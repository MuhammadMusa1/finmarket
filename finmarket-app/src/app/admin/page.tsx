"use client";
import { useState, useEffect, useCallback } from "react";

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState("");
  const [tab, setTab] = useState<"products" | "applications" | "audit">("products");

  if (!token) return <Login onLogin={(t, r) => { setToken(t); setRole(r); }} />;

  return (
    <div className="fade" style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 18 }}>
      <aside className="card" style={{ padding: 12, height: "fit-content" }}>
        <div style={{ fontWeight: 800, padding: "6px 10px 12px" }}>Admin Lite</div>
        <div className="muted" style={{ fontSize: 11, padding: "0 10px 10px" }}>Роль: {role}</div>
        {(["products", "applications", "audit"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className="btn sm" style={{ display: "block", width: "100%", textAlign: "left", marginBottom: 4, background: tab === t ? "var(--brand)" : "transparent", border: "none", color: tab === t ? "#fff" : "var(--muted)" }}>
            {t === "products" ? "Продукты" : t === "applications" ? "Заявки" : "Аудит"}
          </button>
        ))}
      </aside>
      <div>
        {tab === "products" && <Products token={token} role={role} />}
        {tab === "applications" && <Applications token={token} role={role} />}
        {tab === "audit" && <Audit token={token} />}
      </div>
    </div>
  );
}

function Login({ onLogin }: { onLogin: (t: string, r: string) => void }) {
  const [email, setEmail] = useState("admin@finmarket.tj");
  const [password, setPassword] = useState("admin123");
  const [err, setErr] = useState("");
  const submit = async () => {
    const r = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const d = await r.json();
    if (r.ok) onLogin(d.access_token, d.role); else setErr(d.error?.message || "Ошибка");
  };
  return (
    <div className="fade card" style={{ maxWidth: 360, margin: "20px auto", padding: 28 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Вход в админку</h2>
      <label className="label">Email</label>
      <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} style={{ marginBottom: 10 }} />
      <label className="label">Пароль</label>
      <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ marginBottom: 14 }} />
      {err && <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 10 }}>{err}</div>}
      <button className="btn" style={{ width: "100%" }} onClick={submit}>Войти</button>
      <p className="muted" style={{ fontSize: 11, marginTop: 12 }}>Демо-доступы: admin/editor/viewer @finmarket.tj · пароль {`{role}`}123</p>
    </div>
  );
}

function Products({ token, role }: { token: string; role: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const load = useCallback(() => fetch("/api/admin/products", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()).then(setRows), [token]);
  useEffect(() => { load(); }, [load]);
  const canEdit = role === "admin" || role === "editor";

  const togglePublish = async (p: any) => {
    await fetch(`/api/admin/products/${p.id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: p.status === "published" ? "draft" : "published" }) });
    load();
  };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Продукты</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead><tr>{["Продукт", "Банк", "Категория", "Эфф. ставка", "Статус", ""].map((h) => <th key={h} style={thA}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id}>
              <td style={tdA}>{p.name}</td><td style={tdA}>{p.bank}</td><td style={tdA}>{p.category}</td>
              <td style={tdA}>{p.effective_rate ?? "—"}%</td>
              <td style={tdA}><span className="badge" style={{ background: p.status === "published" ? "rgba(16,185,129,.15)" : "rgba(245,158,11,.15)", color: p.status === "published" ? "var(--best)" : "var(--accent)" }}>{p.status}</span></td>
              <td style={tdA}>{canEdit && <button className="btn sm ghost" onClick={() => togglePublish(p)}>{p.status === "published" ? "В черновик" : "Опубликовать"}</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!canEdit && <p className="muted" style={{ fontSize: 12, marginTop: 10 }}>Роль viewer: только просмотр (RBAC).</p>}
    </div>
  );
}

function Applications({ token, role }: { token: string; role: string }) {
  const [data, setData] = useState<any>({ items: [], dlq_size: 0 });
  const load = useCallback(() => fetch("/api/admin/applications", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()).then(setData), [token]);
  useEffect(() => { load(); const i = setInterval(load, 3000); return () => clearInterval(i); }, [load]);
  const canResend = role === "admin" || role === "editor";

  const resend = async (id: string) => { await fetch(`/api/admin/applications/${id}/resend`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }); load(); };
  const stColor: any = { sent: ["rgba(16,185,129,.15)", "var(--best)"], failed: ["rgba(239,68,68,.15)", "var(--danger)"], new: ["rgba(59,130,246,.15)", "var(--brand)"], processed: ["rgba(138,155,189,.15)", "var(--muted)"] };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Заявки <span className="muted" style={{ fontSize: 13 }}>· DLQ: {data.dlq_size}</span></h2>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead><tr>{["Дата", "Продукт", "Банк", "Телефон", "Статус", "Доставка", ""].map((h) => <th key={h} style={thA}>{h}</th>)}</tr></thead>
        <tbody>
          {data.items.map((a: any) => (
            <tr key={a.id}>
              <td style={tdA}>{new Date(a.created_at).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</td>
              <td style={tdA}>{a.product}</td><td style={tdA}>{a.bank}</td><td style={tdA}>{a.phone_masked}</td>
              <td style={tdA}><span className="badge" style={{ background: stColor[a.status]?.[0], color: stColor[a.status]?.[1] }}>{a.status}</span></td>
              <td style={tdA} className="muted">{a.last_delivery ? `${a.last_delivery.channel} #${a.last_delivery.attempt}` : "—"}</td>
              <td style={tdA}>{a.status === "failed" && canResend && <button className="btn sm ghost" onClick={() => resend(a.id)}>↻ Resend</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted" style={{ fontSize: 11, marginTop: 8 }}>Список автообновляется каждые 3с (видно смену new → sent после доставки лида).</p>
    </div>
  );
}

function Audit({ token }: { token: string }) {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { fetch("/api/admin/audit", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()).then(setRows); }, [token]);
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Аудит изменений</h2>
      {rows.length === 0 ? <p className="muted">Пока нет записей. Измените продукт во вкладке «Продукты».</p> :
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead><tr>{["Дата", "Кто", "Сущность", "Действие", "Diff"].map((h) => <th key={h} style={thA}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id}>
                <td style={tdA}>{new Date(l.createdAt).toLocaleString("ru-RU")}</td>
                <td style={tdA}>{l.actorEmail}</td><td style={tdA}>{l.entityType}</td><td style={tdA}>{l.action}</td>
                <td style={tdA} className="muted">{JSON.stringify(l.diff)}</td>
              </tr>
            ))}
          </tbody>
        </table>}
    </div>
  );
}

const thA: React.CSSProperties = { borderBottom: "1px solid var(--line)", padding: "9px 10px", textAlign: "left", color: "var(--muted)", fontSize: 12, textTransform: "uppercase" };
const tdA: React.CSSProperties = { borderBottom: "1px solid var(--line)", padding: "9px 10px", textAlign: "left" };
