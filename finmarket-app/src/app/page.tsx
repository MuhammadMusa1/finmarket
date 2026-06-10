"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang, DICT } from "@/lib/store";

type Cat = { id: string; code: string; name_ru: string; name_tj: string };
type Product = {
  id: string; name: string; effective_rate: number | null; amount_max: number | null;
  term_max: number | null; currency: string; category_code: string;
  bank: { name: string; logoText: string };
};
type Rate = { code: string; name_ru: string; name_tj: string; nbt: number; buy: number; sell: number };

const FLAGS: Record<string, string> = { USD: "🇺🇸", EUR: "🇪🇺", RUB: "🇷🇺" };

/* SVG-иконки категорий (вместо эмодзи) */
const ICONS: Record<string, JSX.Element> = {
  credit: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20M6 15h4"/></svg>,
  deposit: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7c0 2.2-3.1 4-7 4S5 9.2 5 7m14 0c0-2.2-3.1-4-7-4S5 4.8 5 7m14 0v10c0 2.2-3.1 4-7 4s-7-1.8-7-4V7m14 5c0 2.2-3.1 4-7 4s-7-1.8-7-4"/></svg>,
  debit_card: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20M15 15h3"/></svg>,
  credit_card: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20M6 15h6"/><circle cx="17.5" cy="14.5" r="1.6"/></svg>,
  mortgage: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-8 9 8M5 9.5V21h14V9.5M9 21v-6h6v6"/></svg>,
  microloan: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L4.5 13.5H11L9.5 22 19 9.5h-6.5L13 2z"/></svg>,
  rko: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M3 13h18"/></svg>,
  insurance: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l8 4v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-4z"/><path d="M9 12l2 2 4-4.5"/></svg>,
};

export default function Home() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [top, setTop] = useState<Product[]>([]);
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [calc, setCalc] = useState({ amount: 50000, term: 24 });
  const { lang } = useLang();

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/products?sort=rate_asc&limit=4").then((r) => r.json()),
      fetch("/api/rates").then((r) => r.json()).catch(() => ({ items: [] })),
    ]).then(([c, p, rt]) => { setCats(c); setTop(p.items || []); setRates(rt.items || []); setLoading(false); });
  }, []);

  const monthly = (() => {
    const r = 0.15 / 12, n = calc.term, p = calc.amount;
    const m = (p * r) / (1 - Math.pow(1 + r, -n));
    return isFinite(m) ? Math.round(m) : 0;
  })();

  const news = lang === "ru" ? [
    ["Нацбанк сохранил ставку рефинансирования", "сегодня"],
    ["Эсхата запустил новый депозит с повышенной ставкой", "вчера"],
    ["Курс сомони к доллару на 8 июня", "2 дня назад"],
  ] : [
    ["Бонки миллӣ меъёри бозтамвилро тағйир надод", "имрӯз"],
    ["Эсхата пасандози навро бо меъёри баландтар ба кор андохт", "дирӯз"],
    ["Қурби сомонӣ нисбат ба доллар барои 8 июн", "2 рӯз пеш"],
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 52 }}>

      {/* ============ HERO ============ */}
      <section className="hero hero-pad fade-up" style={{ padding: "54px 48px" }}>
        <span className="orb" style={{ width: 90, height: 90, right: 180, top: 60 }} />
        <span className="orb" style={{ width: 54, height: 54, right: 90, top: 170, animationDelay: "1.2s" }} />
        <div style={{ maxWidth: 640, position: "relative" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,.16)", border: "1px solid rgba(255,255,255,.22)", padding: "6px 15px", borderRadius: 999, fontSize: 13, fontWeight: 700 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 2l2.6 6.6L21 9.3l-5 4.4 1.5 6.8L12 17l-5.5 3.5L8 13.7 3 9.3l6.4-.7L12 2z"/></svg>
            {lang === "ru" ? "Финансовый маркетплейс Таджикистана" : "Маркетплейси молиявии Тоҷикистон"}
          </span>
          <h1 style={{ fontSize: 44, fontWeight: 800, margin: "20px 0 14px" }}>
            {lang === "ru" ? <>Лучший банковский продукт — <span style={{ whiteSpace: "nowrap" }}>за минуту</span></> : "Маҳсулоти беҳтарини бонкӣ — дар як дақиқа"}
          </h1>
          <p style={{ fontSize: 17, opacity: .94, marginBottom: 28, lineHeight: 1.55, maxWidth: 560 }}>
            {lang === "ru"
              ? "Сравнивайте кредиты, депозиты, карты и ипотеку от банков Таджикистана. Подавайте заявку онлайн — без визита в отделение."
              : "Қарзҳо, пасандозҳо, кортҳо ва ипотекаро аз бонкҳои Тоҷикистон муқоиса кунед. Дархостро онлайн пешниҳод кунед — бе ташриф ба филиал."}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/catalog/credit" className="btn white lg">
              {lang === "ru" ? "Подобрать кредит" : "Интихоби қарз"}
            </Link>
            <Link href="/catalog/deposit" className="btn lg" style={{ background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.28)" }}>
              {lang === "ru" ? "Открыть вклад" : "Кушодани пасандоз"}
            </Link>
          </div>
          <div style={{ display: "flex", gap: 38, marginTop: 38, flexWrap: "wrap" }}>
            {(lang === "ru"
              ? [["5+", "банков-партнёров"], ["50+", "продуктов"], ["2 мин", "на заявку"]]
              : [["5+", "бонкҳои шарик"], ["50+", "маҳсулот"], ["2 дақ", "барои дархост"]]
            ).map(([n, l]) => (
              <div key={l}>
                <div style={{ fontSize: 28, fontWeight: 800 }}>{n}</div>
                <div style={{ fontSize: 13, opacity: .82 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ КУРСЫ ВАЛЮТ (НБТ) ============ */}
      {rates.length > 0 && (
        <section className="fade-up d1" style={{ marginTop: -22 }}>
          <div className="card" style={{ padding: "18px 26px", display: "flex", alignItems: "center", gap: 26, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 150 }}>
              <span style={{ width: 38, height: 38, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--brand-soft)", color: "var(--brand)" }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M14.5 9a2.5 2.5 0 00-2.5-2h-1a2.5 2.5 0 000 5h2a2.5 2.5 0 010 5h-1a2.5 2.5 0 01-2.5-2M12 5v2m0 10v2"/></svg>
              </span>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 800 }}>{lang === "ru" ? "Курсы валют" : "Қурби асъор"}</div>
                <div className="muted" style={{ fontSize: 12 }}>{lang === "ru" ? "НБТ · сомони (TJS)" : "БМТ · сомонӣ (TJS)"}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", flex: 1 }}>
              {rates.map((r) => (
                <div key={r.code} style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 14, padding: "10px 16px", flex: "1 1 180px", minWidth: 180 }}>
                  <span style={{ fontSize: 22 }}>{FLAGS[r.code] || "💱"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 800 }}>{r.code}<span className="muted" style={{ fontWeight: 600, marginLeft: 6, fontSize: 12 }}>{lang === "ru" ? r.name_ru : r.name_tj}</span></div>
                    <div style={{ display: "flex", gap: 14, fontSize: 13, marginTop: 2 }}>
                      <span><span className="muted" style={{ fontSize: 11.5 }}>{lang === "ru" ? "покупка " : "харид "}</span><b>{r.buy}</b></span>
                      <span><span className="muted" style={{ fontSize: 11.5 }}>{lang === "ru" ? "продажа " : "фурӯш "}</span><b>{r.sell}</b></span>
                      <span className="badge brand" style={{ fontSize: 10.5, padding: "2px 8px" }}>{lang === "ru" ? "НБТ" : "БМТ"} {r.nbt}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ КАТЕГОРИИ ============ */}
      <section className="fade-up d1">
        <div className="section-head">
          <h2 className="section-title">{lang === "ru" ? "Все продукты" : "Ҳамаи маҳсулот"}</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 14 }}>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 128 }} />)
            : cats.map((c, i) => (
              <Link key={c.id} href={`/catalog/${c.code}`} className={`card hover tile fade-up d${Math.min(i + 1, 6)}`}>
                <span className="tile-ic">{ICONS[c.code] || ICONS.credit}</span>
                <h3>{lang === "ru" ? c.name_ru : c.name_tj}</h3>
              </Link>
            ))}
        </div>
      </section>

      {/* ============ ВЫГОДНЫЕ ПРЕДЛОЖЕНИЯ ============ */}
      <section className="fade-up d2">
        <div className="section-head">
          <h2 className="section-title">{lang === "ru" ? "Выгодные предложения" : "Пешниҳодҳои муфид"}</h2>
          <Link href="/catalog/credit" className="link-more">
            {lang === "ru" ? "Все предложения →" : "Ҳамаи пешниҳодҳо →"}
          </Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(262px,1fr))", gap: 16 }}>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 230 }} />)
            : top.map((p) => (
              <div key={p.id} className="card hover" style={{ padding: 22, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div className="bank-logo" style={{ width: 36, height: 36, fontSize: 12 }}>{p.bank.logoText}</div>
                  <span className="muted" style={{ fontSize: 13, fontWeight: 600 }}>{p.bank.name}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, minHeight: 44 }}>{p.name}</h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: "var(--brand)", letterSpacing: "-.03em" }}>
                    {p.effective_rate ?? "—"}%
                  </span>
                  <span className="muted" style={{ fontSize: 12.5 }}>{DICT[lang].effRate.toLowerCase()}</span>
                </div>
                <p className="muted" style={{ fontSize: 13, margin: "4px 0 16px" }}>
                  {lang === "ru" ? "до" : "то"} {p.amount_max ? p.amount_max.toLocaleString() : "—"} {p.currency}
                  {p.term_max ? ` · ${lang === "ru" ? "до" : "то"} ${p.term_max} ${lang === "ru" ? "мес" : "моҳ"}` : ""}
                </p>
                <Link href={`/apply/${p.id}`} className="btn" style={{ width: "100%", marginTop: "auto" }}>
                  {DICT[lang].apply}
                </Link>
              </div>
            ))}
        </div>
      </section>

      {/* ============ КАЛЬКУЛЯТОР + НОВОСТИ ============ */}
      <section className="calc-grid fade-up d3" style={{ display: "grid", gridTemplateColumns: "1.45fr 1fr", gap: 20 }}>
        <div className="card" style={{ padding: 30 }}>
          <h2 style={{ fontSize: 21, fontWeight: 800, marginBottom: 5 }}>
            {lang === "ru" ? "Рассчитайте платёж по кредиту" : "Пардохти қарзро ҳисоб кунед"}
          </h2>
          <p className="muted" style={{ fontSize: 14, marginBottom: 24 }}>
            {lang === "ru" ? "Предварительный расчёт по ставке 15% годовых" : "Ҳисобкунии пешакӣ бо меъёри 15% солона"}
          </p>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 170 }}>
              <label className="label">{lang === "ru" ? "Сумма кредита, TJS" : "Маблағи қарз, TJS"}</label>
              <input className="input" type="number" value={calc.amount}
                onChange={(e) => setCalc({ ...calc, amount: Number(e.target.value) })} />
              <input type="range" min={5000} max={500000} step={5000} value={calc.amount}
                onChange={(e) => setCalc({ ...calc, amount: Number(e.target.value) })}
                style={{ width: "100%", marginTop: 12 }} />
            </div>
            <div style={{ flex: 1, minWidth: 170 }}>
              <label className="label">{lang === "ru" ? "Срок, месяцев" : "Мӯҳлат, моҳҳо"}</label>
              <input className="input" type="number" value={calc.term}
                onChange={(e) => setCalc({ ...calc, term: Number(e.target.value) })} />
              <input type="range" min={3} max={60} step={1} value={calc.term}
                onChange={(e) => setCalc({ ...calc, term: Number(e.target.value) })}
                style={{ width: "100%", marginTop: 12 }} />
            </div>
          </div>
          <div style={{
            marginTop: 24, borderRadius: 16, padding: "22px 26px", color: "#fff",
            background: "linear-gradient(118deg,var(--hero-from),var(--hero-to))",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14,
          }}>
            <div>
              <div style={{ fontSize: 13, opacity: .85 }}>{lang === "ru" ? "Ежемесячный платёж" : "Пардохти моҳона"}</div>
              <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-.02em" }}>{monthly.toLocaleString()} TJS</div>
            </div>
            <Link href="/catalog/credit" className="btn white">{lang === "ru" ? "Подобрать" : "Интихоб"}</Link>
          </div>
        </div>

        <div className="card" style={{ padding: 30 }}>
          <div className="section-head" style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 21, fontWeight: 800 }}>{lang === "ru" ? "Финансовые новости" : "Хабарҳои молиявӣ"}</h2>
          </div>
          {news.map(([title, date], i) => (
            <div key={i} style={{ padding: "13px 0", borderBottom: i < news.length - 1 ? "1px solid var(--line)" : "none" }}>
              <p style={{ fontSize: 14.5, fontWeight: 700, lineHeight: 1.4, marginBottom: 4 }}>{title}</p>
              <span className="muted" style={{ fontSize: 12.5 }}>{date}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ============ ДОВЕРИЕ ============ */}
      <section className="fade-up d4" style={{
        background: "var(--bg2)", borderRadius: "var(--r-xl)", padding: "36px 40px",
        display: "flex", gap: 36, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ maxWidth: 470 }}>
          <h2 style={{ fontSize: 23, fontWeight: 800, marginBottom: 10 }}>
            {lang === "ru" ? "Banki.tj — прозрачный выбор финансовых продуктов" : "Banki.tj — интихоби шаффофи маҳсулоти молиявӣ"}
          </h2>
          <p className="muted" style={{ fontSize: 15, lineHeight: 1.55 }}>
            {lang === "ru"
              ? "Только лицензированные банки и МФО Таджикистана. Актуальные ставки, честное сравнение, никаких скрытых комиссий."
              : "Танҳо бонкҳо ва ТМФ-ҳои иҷозатномадори Тоҷикистон. Меъёрҳои муҳим, муқоисаи ростқавлона, бе комиссияҳои пинҳонӣ."}
          </p>
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {(lang === "ru"
            ? [["Лицензии НБТ", "M9 12l2 2 4-4.5"], ["Защита данных", "M12 11v4"], ["Заявка за 2 мин", "M12 8v4l2.5 2.5"]]
            : [["Иҷозатномаҳои БМТ", "M9 12l2 2 4-4.5"], ["Ҳифзи маълумот", "M12 11v4"], ["Дархост дар 2 дақ", "M12 8v4l2.5 2.5"]]
          ).map(([label, d], i) => (
            <div key={label} className="card" style={{ padding: "18px 22px", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{
                width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                background: i === 1 ? "var(--brand2-soft)" : "var(--brand-soft)",
                color: i === 1 ? "var(--brand2-dark)" : "var(--brand)",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {i === 2 ? <circle cx="12" cy="12" r="9" /> : <path d="M12 2l8 4v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-4z" />}
                  <path d={d} />
                </svg>
              </span>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
