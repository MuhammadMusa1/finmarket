"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang, DICT } from "@/lib/store";

export default function ProductPage({ params }: { params: { id: string } }) {
  const [p, setP] = useState<any>(null);
  const [err, setErr] = useState(false);
  const { lang } = useLang();

  useEffect(() => {
    fetch(`/api/products/${params.id}`).then((r) => r.ok ? r.json() : Promise.reject()).then(setP).catch(() => setErr(true));
  }, [params.id]);

  if (err) return <p className="muted">{lang === "ru" ? "Продукт не найден." : "Маҳсулот ёфт нашуд."}</p>;
  if (!p) return <p className="muted">{lang === "ru" ? "Загрузка…" : "Боргирӣ…"}</p>;

  const fees = p.fees?.items || [];
  const req = p.requirements || {};

  return (
    <div className="fade" style={{ maxWidth: 720 }}>
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 9, background: "var(--bg2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: "var(--brand)" }}>{p.bank.logoText}</div>
          <b>{p.bank.name}</b>
          {p.bank.verified && <span className="badge verified">✓ {lang === "ru" ? "Лицензия №" : "Иҷозатномаи №"}{p.bank.license_no}</span>}
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 14 }}>{p.name}</h1>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", marginBottom: 18 }}>
          <Stat label={DICT[lang].effRate} value={`${p.effective_rate ?? "—"}%`} />
          <Stat label={lang === "ru" ? "Ставка" : "Меъёр"} value={p.rate_min ? `${p.rate_min}–${p.rate_max}%` : "—"} />
          <Stat label={DICT[lang].amount} value={p.amount_max ? `${(p.amount_min || 0).toLocaleString()} – ${p.amount_max.toLocaleString()} ${p.currency}` : "—"} />
          <Stat label={DICT[lang].term} value={p.term_max ? `${p.term_min}–${p.term_max} ${lang === "ru" ? "мес" : "моҳ"}` : "—"} />
        </div>

        {fees.length > 0 && <>
          <h3 style={{ fontSize: 14, color: "var(--accent)", textTransform: "uppercase", letterSpacing: .4, margin: "16px 0 8px" }}>
            {lang === "ru" ? "Комиссии" : "Комиссияҳо"}
          </h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <tbody>
              {fees.map((f: any, i: number) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "8px 0" }} className="muted">{lang === "tj" ? (f.label_tj || f.label_ru) : f.label_ru}</td>
                  <td style={{ padding: "8px 0", textAlign: "right" }}>
                    {f.type === "free" ? (lang === "ru" ? "Бесплатно" : "Ройгон") : f.type === "percent" ? `${f.value_percent}%` : f.value_fixed}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>}

        {(req.age_min || req.documents) && <>
          <h3 style={{ fontSize: 14, color: "var(--accent)", textTransform: "uppercase", letterSpacing: .4, margin: "16px 0 8px" }}>
            {lang === "ru" ? "Требования" : "Талабот"}
          </h3>
          <p className="muted" style={{ fontSize: 14 }}>
            {req.age_min && `${lang === "ru" ? "Возраст" : "Синну сол"} ${req.age_min}${req.age_max ? `–${req.age_max}` : "+"} · `}
            {req.citizenship && `${lang === "ru" ? "гражданство" : "шаҳрвандӣ"} ${req.citizenship.join(", ")} · `}
            {req.income_proof_required && `${lang === "ru" ? "справка о доходах" : "маълумотнома дар бораи даромад"} · `}
            {req.min_work_experience_months && `${lang === "ru" ? "стаж от" : "собиқаи корӣ аз"} ${req.min_work_experience_months} ${lang === "ru" ? "мес" : "моҳ"}`}
          </p>
        </>}

        <div style={{ marginTop: 18 }}>
          <Link href={`/apply/${p.id}`} className="btn">{DICT[lang].apply}</Link>
        </div>
        <div className="muted" style={{ fontSize: 11, marginTop: 10 }}>{DICT[lang].updatedAt} {new Date(p.updated_at).toLocaleDateString(lang === "ru" ? "ru-RU" : "tg-TJ")}</div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div><div className="muted" style={{ fontSize: 12 }}>{label}</div><b style={{ fontSize: 18 }}>{value}</b></div>;
}
