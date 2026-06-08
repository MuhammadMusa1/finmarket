"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { TJ_PHONE, normalizePhone } from "@/lib/validation";

export default function ApplyPage({ params }: { params: { productId: string } }) {
  const [product, setProduct] = useState<any>(null);
  const [form, setForm] = useState({ full_name: "", phone: "+992 ", email: "", consent: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<{ id: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetch(`/api/products/${params.productId}`).then((r) => r.json()).then(setProduct).catch(() => {}); }, [params.productId]);

  const submit = async () => {
    const e: Record<string, string> = {};
    if (form.full_name.trim().length < 2) e.full_name = "Укажите ФИО";
    if (!TJ_PHONE.test(normalizePhone(form.phone))) e.phone = "Формат: +992XXYYYYYYY";
    if (!form.consent) e.consent = "Согласие обязательно";
    setErrors(e);
    if (Object.keys(e).length) return;

    setSubmitting(true);
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify({
        product_id: params.productId, full_name: form.full_name,
        phone: normalizePhone(form.phone), email: form.email || null, consent_pdn: form.consent,
      }),
    });
    setSubmitting(false);
    const d = await res.json();
    if (res.ok) setDone({ id: d.id });
    else setErrors({ form: d.error?.message || "Ошибка отправки" });
  };

  if (done) return (
    <div className="fade card" style={{ maxWidth: 460, margin: "20px auto", padding: 36, textAlign: "center" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--brand2)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: "#fff" }}>✓</div>
      <h2 style={{ fontSize: 22, fontWeight: 800 }}>Заявка отправлена</h2>
      <p className="muted" style={{ marginTop: 8 }}>{product?.bank?.name} получит вашу заявку и свяжется с вами.<br />Номер: <b>{done.id.slice(0, 8)}…</b></p>
      <Link href="/" className="btn" style={{ marginTop: 18, display: "inline-block" }}>Вернуться в каталог</Link>
    </div>
  );

  return (
    <div className="fade" style={{ maxWidth: 460 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>Заявка</h1>
      {product && <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <b>{product.bank?.name} · {product.name}</b>
        <div className="muted" style={{ fontSize: 13 }}>Эфф. ставка {product.effective_rate}% · до {product.amount_max?.toLocaleString()} {product.currency}</div>
      </div>}
      {errors.form && <div style={{ color: "var(--danger)", marginBottom: 12 }}>{errors.form}</div>}

      <Field label="ФИО" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} error={errors.full_name} />
      <Field label="Телефон (РТ)" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} error={errors.phone} placeholder="+992 90 123 45 67" />
      <Field label="Email (опционально)" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />

      <label style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 13, background: "var(--card)", border: `1px solid ${errors.consent ? "var(--danger)" : "var(--line)"}`, padding: 12, borderRadius: 8, marginBottom: 14, cursor: "pointer" }} className="muted">
        <input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} style={{ marginTop: 2 }} />
        <span>Я даю согласие на обработку персональных данных и передачу их банку-партнёру (обязательно)</span>
      </label>

      <button className="btn" style={{ width: "100%" }} onClick={submit} disabled={submitting}>{submitting ? "Отправка…" : "Отправить заявку"}</button>
    </div>
  );
}

function Field({ label, value, onChange, error, placeholder }: { label: string; value: string; onChange: (v: string) => void; error?: string; placeholder?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label className="label">{label}</label>
      <input className="input" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={error ? { borderColor: "var(--danger)" } : {}} />
      {error && <div style={{ color: "var(--danger)", fontSize: 11, marginTop: 4 }}>{error}</div>}
    </div>
  );
}
