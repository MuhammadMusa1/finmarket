import crypto from "crypto";
import { db } from "./db";

// In-memory очередь доставки лидов (замена RabbitMQ для демо без установок).
// Реализует FR-LR-01..05, BR-05/06 и политику retry §18.4 ТЗ.

const MAX_ATTEMPTS = 5;
const BASE_DELAY_MS = 2000;   // в демо ускорено (в ТЗ — 30с)
const MULTIPLIER = 2;
const MAX_DELAY_MS = 20000;
const TIMEOUT_MS = 10000;

type Job = { applicationId: string; attempt: number };
const queue: Job[] = [];
const dlq: string[] = [];
let processing = false;

export function getDLQ() {
  return [...dlq];
}

export function enqueueLead(applicationId: string) {
  queue.push({ applicationId, attempt: 1 });
  void drain();
}

function sign(secret: string, body: string) {
  const ts = Math.floor(Date.now() / 1000);
  const digest = crypto.createHmac("sha256", secret).update(`${ts}.${body}`).digest("hex");
  return `t=${ts},v1=${digest}`;
}

async function deliver(job: Job): Promise<boolean> {
  const app = await db.application.findUnique({
    where: { id: job.applicationId },
    include: { product: { include: { bank: true } } },
  });
  if (!app) return true; // нечего доставлять

  const bank = app.product.bank;
  const payload = {
    event: "lead.created",
    version: "1.0",
    application_id: app.id,
    product_id: app.productId,
    bank_id: bank.id,
    contact: { full_name: app.fullName, phone: app.phone, email: app.email },
    created_at: app.createdAt.toISOString(),
  };
  const body = JSON.stringify(payload);
  const channel = bank.webhookUrl ? "webhook" : "email";

  let httpStatus: number | null = null;
  let error: string | null = null;
  let ok = false;

  try {
    if (channel === "webhook" && bank.webhookUrl) {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
      // В демо webhook.site реально примет POST; если сети нет — уйдём в catch и retry.
      const res = await fetch(bank.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-FinMarket-Signature": sign(bank.webhookSecret || "secret", body) },
        body,
        signal: ctrl.signal,
      });
      clearTimeout(t);
      httpStatus = res.status;
      ok = res.status >= 200 && res.status < 300;
      if (!ok && res.status >= 400 && res.status < 500 && res.status !== 429) {
        // 4xx (кроме 429) — не ретраим
        error = `Client error ${res.status}`;
      }
    } else {
      // email-канал: в демо просто логируем «отправку» (MailHog в проде)
      console.log(`[email] Лид ${app.id} → ${bank.routingEmail}`);
      httpStatus = 200;
      ok = true;
    }
  } catch (e: any) {
    error = e?.message || "network error";
  }

  await db.leadDeliveryLog.create({
    data: { applicationId: app.id, channel, attemptNo: job.attempt, httpStatus, deliveredAt: ok ? new Date() : null, error },
  });

  if (ok) {
    await db.application.update({ where: { id: app.id }, data: { status: "sent" } });
    return true;
  }

  // не ретраим клиентские ошибки
  if (httpStatus && httpStatus >= 400 && httpStatus < 500 && httpStatus !== 429) {
    await db.application.update({ where: { id: app.id }, data: { status: "failed" } });
    dlq.push(app.id);
    return true;
  }
  return false; // нужен retry
}

async function drain() {
  if (processing) return;
  processing = true;
  while (queue.length) {
    const job = queue.shift()!;
    const done = await deliver(job);
    if (!done) {
      if (job.attempt >= MAX_ATTEMPTS) {
        await db.application.update({ where: { id: job.applicationId }, data: { status: "failed" } });
        dlq.push(job.applicationId);
      } else {
        const delay = Math.min(BASE_DELAY_MS * MULTIPLIER ** (job.attempt - 1), MAX_DELAY_MS);
        setTimeout(() => { queue.push({ applicationId: job.applicationId, attempt: job.attempt + 1 }); void drain(); }, delay);
      }
    }
  }
  processing = false;
}
