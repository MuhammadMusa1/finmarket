"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useCompare, useLang, DICT } from "@/lib/store";

export default function ComparePage() {
  const { ids, clear, remove } = useCompare();
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState("");
  const { lang } = useLang();

  useEffect(() => {
    if (ids.length < 2) { setData(null); return; }
    fetch("/api/products/compare", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product_ids: ids }) })
      .then(async (r) => { const d = await r.json(); if (!r.ok) { setErr(d.error?.message || "Ошибка"); setData(null); } else { setErr(""); setData(d); } });
  }, [ids]);

  if (ids.length < 2) return <p className="muted fade">{lang === "ru" ? "Добавьте минимум 2 продукта к сравнению из каталога." : "Ақаллан 2 маҳсулотро барои муқоиса аз каталог илова кунед."}</p>;
  if (err) return <p style={{ color: "var(--danger)" }} className="fade">{err}</p>;
  if (!data) return <p className="muted">{lang === "ru" ? "Загрузка…" : "Боргирӣ…"}</p>;

  const translateUnit = (unit: string) => {
    if (lang === "ru") return unit;
    if (unit === "мес") return "моҳ";
    if (unit === "дней") return "рӯз";
    if (unit === "число") return "адад";
    return unit;
  };

  return (
    <div className="fade">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>{DICT[lang].compare} ({data.products.length})</h1>
        <button className="btn ghost sm" onClick={clear}>{lang === "ru" ? "Очистить всё" : "Тоза кардани ҳама"}</button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr>
              <th style={th}>{lang === "ru" ? "Параметр" : "Нишондиҳанда"}</th>
              {data.products.map((p: any) => (
                <th key={p.product_id} style={th}>
                  {p.name}
                  <button onClick={() => remove(p.product_id)} className="muted" style={{ marginLeft: 8, background: "none", border: "none", cursor: "pointer", color: "var(--danger)" }}>✕</button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.attributes.map((attr: any) => (
              <tr key={attr.key}>
                <td style={td} className="muted">
                  {lang === "tj" ? (attr.label_tj || attr.label_ru) : attr.label_ru}
                  {attr.unit !== "text" && attr.unit !== "currency" ? `, ${translateUnit(attr.unit)}` : ""}
                </td>
                {data.products.map((p: any) => {
                  const isBest = p.best_in.includes(attr.key);
                  return <td key={p.product_id} style={{ ...td, ...(isBest ? { background: "rgba(16,185,129,.14)", color: "var(--best)", fontWeight: 700 } : {}) }}>
                    {p.values[attr.key] ?? "—"}{isBest ? " ★" : ""}
                  </td>;
                })}
              </tr>
            ))}
            <tr>
              <td style={td}></td>
              {data.products.map((p: any) => <td key={p.product_id} style={td}><Link href={`/apply/${p.product_id}`} className="btn sm">{lang === "ru" ? "Заявка" : "Дархост"}</Link></td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
const th: React.CSSProperties = { border: "1px solid var(--line)", padding: "10px 12px", textAlign: "left", background: "var(--card)", color: "var(--muted)", fontSize: 13 };
const td: React.CSSProperties = { border: "1px solid var(--line)", padding: "10px 12px", textAlign: "left" };
