"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useCompare } from "@/lib/store";

type Product = {
  id: string; name: string; category_code: string; currency: string;
  effective_rate: number | null; amount_max: number | null; term_max: number | null;
  updated_at: string; bank: { name: string; logoText: string; verified: boolean };
};

export default function CatalogPage({ params }: { params: { category: string } }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [filters, setFilters] = useState({ bank: "", currency: "", rate_max: "", sort: "rate_asc" });
  const [loading, setLoading] = useState(true);
  const { add, remove, ids } = useCompare();
  const [msg, setMsg] = useState("");

  useEffect(() => { fetch("/api/banks").then((r) => r.json()).then(setBanks); }, []);

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
    setMsg(err || "");
  };

  return (
    <div className="fade">
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16, textTransform: "capitalize" }}>Категория: {params.category}</h1>
      {msg && <div style={{ background: "rgba(245,158,11,.15)", color: "var(--accent)", padding: "8px 12px", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{msg}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 18 }}>
        {/* Фильтры */}
        <aside className="card" style={{ padding: 16, height: "fit-content" }}>
          <h4 className="muted" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: .5, marginBottom: 12 }}>Фильтры</h4>
          <div style={{ marginBottom: 12 }}>
            <label className="label">Банк</label>
            <select value={filters.bank} onChange={(e) => setFilters({ ...filters, bank: e.target.value })}>
              <option value="">Все банки</option>
              {banks.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="label">Валюта</label>
            <select value={filters.currency} onChange={(e) => setFilters({ ...filters, currency: e.target.value })}>
              <option value="">Любая</option><option>TJS</option><option>USD</option><option>EUR</option>
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="label">Ставка до, %</label>
            <input className="input" value={filters.rate_max} onChange={(e) => setFilters({ ...filters, rate_max: e.target.value })} placeholder="напр. 20" />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="label">Сортировка</label>
            <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
              <option value="rate_asc">Ставка ↑</option><option value="rate_desc">Ставка ↓</option>
              <option value="amount_desc">Сумма ↓</option><option value="term_desc">Срок ↓</option>
            </select>
          </div>
          <button className="btn ghost" style={{ width: "100%" }} onClick={() => setFilters({ bank: "", currency: "", rate_max: "", sort: "rate_asc" })}>Сбросить фильтры</button>
        </aside>

        {/* Список */}
        <div>
          {loading ? <p className="muted">Загрузка…</p> : products.length === 0 ? <p className="muted">Продукты не найдены.</p> :
            products.map((p) => (
              <div key={p.id} className="card" style={{ padding: 18, marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--line)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }} className="muted">{p.bank.logoText}</div>
                  <b>{p.bank.name}</b>
                  {p.bank.verified && <span className="badge verified">✓ Лицензия</span>}
                </div>
                <Link href={`/product/${p.id}`}><h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{p.name}</h3></Link>
                <div style={{ display: "flex", gap: 26, flexWrap: "wrap", margin: "8px 0" }}>
                  <div><div className="muted" style={{ fontSize: 12 }}>Эфф. ставка</div><b style={{ fontSize: 17 }}>{p.effective_rate ?? "—"}%</b></div>
                  <div><div className="muted" style={{ fontSize: 12 }}>Сумма до</div><b style={{ fontSize: 17 }}>{p.amount_max ? p.amount_max.toLocaleString() : "—"} {p.currency}</b></div>
                  <div><div className="muted" style={{ fontSize: 12 }}>Срок до</div><b style={{ fontSize: 17 }}>{p.term_max ?? "—"} мес</b></div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <Link href={`/apply/${p.id}`} className="btn">Подать заявку</Link>
                  <button className="btn ghost" onClick={() => toggleCompare(p)}>{ids.includes(p.id) ? "✓ В сравнении" : "+ К сравнению"}</button>
                </div>
                <div className="muted" style={{ fontSize: 11, marginTop: 6 }}>Актуально на {new Date(p.updated_at).toLocaleDateString("ru-RU")}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
