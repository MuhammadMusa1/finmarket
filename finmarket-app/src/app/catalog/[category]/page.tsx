"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useCompare, useLang, DICT } from "@/lib/store";

type Product = {
  id: string; name: string; category_code: string; currency: string;
  effective_rate: number | null; amount_max: number | null; term_max: number | null;
  updated_at: string; bank: { name: string; logoText: string; verified: boolean; is_partner?: boolean; rating?: number };
};

export default function CatalogPage({ params }: { params: { category: string } }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [catName, setCatName] = useState("");
  const [filters, setFilters] = useState({ bank: "", currency: "", rate_max: "", sort: "partner" });
  const [loading, setLoading] = useState(true);
  const { add, remove, ids } = useCompare();
  const { lang } = useLang();
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/banks").then((r) => r.json()).then(setBanks);
  }, []);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((cats) => {
        const match = cats.find((c: any) => c.code === params.category);
        if (match) {
          setCatName(lang === "ru" ? match.name_ru : match.name_tj);
        } else {
          setCatName(params.category);
        }
      })
      .catch(() => setCatName(params.category));
  }, [params.category, lang]);

  const load = useCallback(() => {
    setLoading(true);
    const q = new URLSearchParams({ category: params.category, sort: filters.sort });
    if (filters.bank) q.set("bank", filters.bank);
    if (filters.currency) q.set("currency", filters.currency);
    if (filters.rate_max) q.set("rate_max", filters.rate_max);
    fetch(`/api/products?${q}`).then((r) => r.json()).then((d) => { setProducts(d.items); setLoading(false); });
  }, [params.category, filters]);

  useEffect(() => { load(); }, [load]);

  const toggleCompare = (p: Product) => {
    if (ids.includes(p.id)) { remove(p.id); setMsg(""); return; }
    const err = add(p.id, p.category_code);
    if (err) {
      const localizedErr = lang === "ru" ? err : 
        err.includes("категории") ? "Муқоиса танҳо дар дохили як категория имконпазир аст" : 
        "Шумо метавонед на бештар аз 4 маҳсулотро муқоиса кунед";
      setMsg(localizedErr);
    } else {
      setMsg("");
    }
  };

  return (
    <div className="fade">
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>
        {lang === "ru" ? "Категория" : "Категория"}: {catName}
      </h1>
      {msg && <div style={{ background: "rgba(245,158,11,.15)", color: "var(--accent)", padding: "8px 12px", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{msg}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 18 }} className="catalog-grid">
        {/* Фильтры */}
        <aside className="card" style={{ padding: 16, height: "fit-content" }}>
          <h4 className="muted" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: .5, marginBottom: 12 }}>{DICT[lang].filters}</h4>
          <div style={{ marginBottom: 12 }}>
            <label className="label">{DICT[lang].bank}</label>
            <select value={filters.bank} onChange={(e) => setFilters({ ...filters, bank: e.target.value })}>
              <option value="">{DICT[lang].allBanks}</option>
              {banks.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="label">{DICT[lang].currency}</label>
            <select value={filters.currency} onChange={(e) => setFilters({ ...filters, currency: e.target.value })}>
              <option value="">{lang === "ru" ? "Любая" : "Ҳама"}</option>
              <option>TJS</option>
              <option>USD</option>
              <option>EUR</option>
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="label">{DICT[lang].rateMax}</label>
            <input className="input" value={filters.rate_max} onChange={(e) => setFilters({ ...filters, rate_max: e.target.value })} placeholder="напр. 20" />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="label">{DICT[lang].sort}</label>
            <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
              <option value="partner">{DICT[lang].partnerSort}</option>
              <option value="rate_asc">{lang === "ru" ? "Ставка ↑" : "Меъёр ↑"}</option>
              <option value="rate_desc">{lang === "ru" ? "Ставка ↓" : "Меъёр ↓"}</option>
              <option value="amount_desc">{lang === "ru" ? "Сумма ↓" : "Маблағ ↓"}</option>
              <option value="term_desc">{lang === "ru" ? "Срок ↓" : "Мӯҳлат ↓"}</option>
            </select>
          </div>
          <button className="btn ghost" style={{ width: "100%" }} onClick={() => setFilters({ bank: "", currency: "", rate_max: "", sort: "partner" })}>{DICT[lang].reset}</button>
        </aside>

        {/* Список */}
        <div>
          {loading ? <p className="muted">{lang === "ru" ? "Загрузка…" : "Боргирӣ…"}</p> : products.length === 0 ? <p className="muted">{lang === "ru" ? "Продукты не найдены." : "Маҳсулот ёфт нашуд."}</p> :
            products.map((p) => (
              <div key={p.id} className="card" style={{ padding: 18, marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--bg2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--brand)" }}>{p.bank.logoText}</div>
                  <b>{p.bank.name}</b>
                  {p.bank.verified && <span className="badge verified">✓ {lang === "ru" ? "Лицензия" : "Иҷозатнома"}</span>}
                  {p.bank.is_partner && <span className="badge accent" style={{ marginLeft: 8 }}>{DICT[lang].partnerLabel}</span>}
                  {typeof p.bank.rating === "number" && p.bank.rating > 0 && <span className="badge" style={{ marginLeft: 8 }}>{p.bank.rating.toFixed(1)}★</span>}
                </div>
                <Link href={`/product/${p.id}`}><h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{p.name}</h3></Link>
                <div style={{ display: "flex", gap: 26, flexWrap: "wrap", margin: "8px 0" }}>
                  <div><div className="muted" style={{ fontSize: 12 }}>{DICT[lang].effRate}</div><b style={{ fontSize: 17 }}>{p.effective_rate ?? "—"}%</b></div>
                  <div><div className="muted" style={{ fontSize: 12 }}>{lang === "ru" ? "Сумма до" : "Маблағ то"}</div><b style={{ fontSize: 17 }}>{p.amount_max ? p.amount_max.toLocaleString() : "—"} {p.currency}</b></div>
                  <div><div className="muted" style={{ fontSize: 12 }}>{lang === "ru" ? "Срок до" : "Мӯҳлат то"}</div><b style={{ fontSize: 17 }}>{p.term_max ?? "—"} {lang === "ru" ? "мес" : "моҳ"}</b></div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <Link href={`/apply/${p.id}`} className="btn">{DICT[lang].apply}</Link>
                  <button className="btn ghost" onClick={() => toggleCompare(p)}>{ids.includes(p.id) ? (lang === "ru" ? "✓ В сравнении" : "✓ Дар муқоиса") : DICT[lang].addCompare}</button>
                </div>
                <div className="muted" style={{ fontSize: 11, marginTop: 6 }}>{DICT[lang].updatedAt} {new Date(p.updated_at).toLocaleDateString(lang === "ru" ? "ru-RU" : "tg-TJ")}</div>
              </div>
            ))}
        </div>
      </div>
      <style>{`@media(max-width:820px){.catalog-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
