"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Cat = { id: string; code: string; name_ru: string; name_tj: string };
type Product = {
  id: string; name: string; effective_rate: number | null; amount_max: number | null;
  term_max: number | null; currency: string; category_code: string;
  bank: { name: string; logoText: string };
};

const CAT_ICON: Record<string, string> = {
  credit: "💳", deposit: "🏦", debit_card: "💠", credit_card: "🪪",
  mortgage: "🏠", microloan: "⚡", rko: "💼", insurance: "🛡️",
};

export default function Home() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [top, setTop] = useState<Product[]>([]);
  const [calc, setCalc] = useState({ amount: 50000, term: 24 });

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCats);
    fetch("/api/products?sort=rate_asc&limit=4").then((r) => r.json()).then((d) => setTop(d.items || []));
  }, []);

  const monthly = (() => {
    const r = 0.15 / 12, n = calc.term, p = calc.amount;
    const m = (p * r) / (1 - Math.pow(1 + r, -n));
    return isFinite(m) ? Math.round(m) : 0;
  })();

  return (
    <div className="fade" style={{ display: "flex", flexDirection: "column", gap: 44 }}>
      <section style={{ background: "linear-gradient(120deg,var(--hero-from),var(--hero-to))", borderRadius: 24, padding: "48px 44px", color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -60, top: -60, width: 280, height: 280, borderRadius: "50%", background: "rgba(255,255,255,.08)" }} />
        <div style={{ position: "absolute", right: 80, bottom: -90, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,.06)" }} />
        <div style={{ maxWidth: 620, position: "relative" }}>
          <span style={{ background: "rgba(255,255,255,.18)", padding: "5px 13px", borderRadius: 20, fontSize: 13, fontWeight: 600 }}>Финансовый маркетплейс Таджикистана</span>
          <h1 style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.15, margin: "18px 0 12px" }}>Выберите лучший банковский продукт за минуту</h1>
          <p style={{ fontSize: 17, opacity: .92, marginBottom: 26, lineHeight: 1.5 }}>Сравнивайте кредиты, депозиты, карты и ипотеку от банков Таджикистана. Подавайте заявку онлайн — без визита в отделение.</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/catalog/credit" className="btn teal" style={{ fontSize: 15, padding: "13px 26px" }}>Подобрать кредит</Link>
            <Link href="/catalog/deposit" className="btn" style={{ background: "rgba(255,255,255,.16)", fontSize: 15, padding: "13px 26px" }}>Открыть вклад</Link>
          </div>
          <div style={{ display: "flex", gap: 32, marginTop: 34 }}>
            {[["5+", "банков-партнёров"], ["50+", "продуктов"], ["2 мин", "на заявку"]].map(([n, l]) => (
              <div key={l}><div style={{ fontSize: 26, fontWeight: 800 }}>{n}</div><div style={{ fontSize: 13, opacity: .85 }}>{l}</div></div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 18 }}>Все продукты</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14 }}>
          {cats.map((c) => (
            <Link key={c.id} href={`/catalog/${c.code}`} className="card hover" style={{ padding: "22px 18px", textAlign: "center" }}>
              <div style={{ fontSize: 34, marginBottom: 10 }}>{CAT_ICON[c.code] || "•"}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>{c.name_ru}</h3>
              <p className="muted" style={{ fontSize: 12, marginTop: 3 }}>{c.name_tj}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>Выгодные предложения</h2>
          <Link href="/catalog/credit" className="muted" style={{ fontSize: 14, fontWeight: 600 }}>Все предложения →</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
          {top.map((p) => (
            <div key={p.id} className="card hover" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--bg2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--brand)" }}>{p.bank.logoText}</div>
                <span className="muted" style={{ fontSize: 13 }}>{p.bank.name}</span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, minHeight: 42 }}>{p.name}</h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 30, fontWeight: 800, color: "var(--brand)" }}>{p.effective_rate ?? "—"}%</span>
                <span className="muted" style={{ fontSize: 13 }}>ставка</span>
              </div>
              <p className="muted" style={{ fontSize: 13, marginBottom: 14 }}>до {p.amount_max ? p.amount_max.toLocaleString() : "—"} {p.currency}{p.term_max ? ` · до ${p.term_max} мес` : ""}</p>
              <Link href={`/apply/${p.id}`} className="btn" style={{ width: "100%", textAlign: "center", display: "block" }}>Подать заявку</Link>
            </div>
          ))}
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }} className="calc-grid">
        <div className="card" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Рассчитайте платёж по кредиту</h2>
          <p className="muted" style={{ fontSize: 14, marginBottom: 20 }}>Предварительный расчёт по ставке 15% годовых</p>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label className="label">Сумма кредита, TJS</label>
              <input className="input" type="number" value={calc.amount} onChange={(e) => setCalc({ ...calc, amount: Number(e.target.value) })} />
              <input type="range" min={5000} max={500000} step={5000} value={calc.amount} onChange={(e) => setCalc({ ...calc, amount: Number(e.target.value) })} style={{ width: "100%", marginTop: 10, accentColor: "var(--brand)" }} />
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label className="label">Срок, месяцев</label>
              <input className="input" type="number" value={calc.term} onChange={(e) => setCalc({ ...calc, term: Number(e.target.value) })} />
              <input type="range" min={3} max={60} step={1} value={calc.term} onChange={(e) => setCalc({ ...calc, term: Number(e.target.value) })} style={{ width: "100%", marginTop: 10, accentColor: "var(--brand)" }} />
            </div>
          </div>
          <div style={{ marginTop: 22, background: "linear-gradient(120deg,var(--hero-from),var(--hero-to))", borderRadius: 14, padding: "20px 24px", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div><div style={{ fontSize: 13, opacity: .85 }}>Ежемесячный платёж</div><div style={{ fontSize: 30, fontWeight: 800 }}>{monthly.toLocaleString()} TJS</div></div>
            <Link href="/catalog/credit" className="btn teal">Подобрать кредит</Link>
          </div>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 18 }}>Финансовые новости</h2>
          {[
            ["Нацбанк сохранил ставку рефинансирования", "сегодня"],
            ["Эсхата запустил новый депозит с повышенной ставкой", "вчера"],
            ["Курс сомони к доллару на 8 июня", "2 дня назад"],
          ].map(([title, date], i) => (
            <div key={i} style={{ paddingBottom: 14, marginBottom: 14, borderBottom: i < 2 ? "1px solid var(--line)" : "none" }}>
              <p style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>{title}</p>
              <span className="muted" style={{ fontSize: 12 }}>{date}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: "var(--bg2)", borderRadius: 20, padding: "32px 36px", display: "flex", gap: 36, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ maxWidth: 460 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>ФинМаркет — прозрачный выбор финансовых продуктов</h2>
          <p className="muted" style={{ fontSize: 15, lineHeight: 1.5 }}>Только лицензированные банки и МФО Таджикистана. Актуальные ставки, честное сравнение, никаких скрытых комиссий.</p>
        </div>
        <div style={{ display: "flex", gap: 28 }}>
          {[["✓", "Лицензии ЦБ"], ["🔒", "Защита данных"], ["⚡", "Заявка за 2 мин"]].map(([ic, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 26 }}>{ic}</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      <style>{`@media(max-width:820px){.calc-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
