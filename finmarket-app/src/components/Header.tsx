"use client";
import Link from "next/link";
import { useCompare, useLang } from "@/lib/store";

const NAV = [
  { href: "/catalog/credit", ru: "Кредиты", tj: "Қарзҳо" },
  { href: "/catalog/deposit", ru: "Депозиты", tj: "Пасандозҳо" },
  { href: "/catalog/debit_card", ru: "Карты", tj: "Кортҳо" },
  { href: "/catalog/mortgage", ru: "Ипотека", tj: "Ипотека" },
  { href: "/catalog/microloan", ru: "Микрозаймы", tj: "Микроқарзҳо" },
  { href: "/catalog/insurance", ru: "Страхование", tj: "Суғурта" },
];

export default function Header() {
  const { lang, setLang } = useLang();
  const compareCount = useCompare((s) => s.ids.length);

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, background: "#fff", borderBottom: "1px solid var(--line)", boxShadow: "0 1px 8px rgba(14,39,71,.04)" }}>
      <div className="container" style={{ display: "flex", alignItems: "center", gap: 22, padding: "14px 20px" }}>
        {/* Логотип */}
        <Link href="/" style={{ display: "flex", alignItems: "center" }}>
          <img src="/logo.svg" alt="Banki.tj" style={{ height: 40 }} />
        </Link>

        {/* Навигация по продуктам */}
        <nav style={{ display: "flex", gap: 20, fontSize: 14, marginLeft: 6, fontWeight: 500 }} className="hide-mobile">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} style={{ color: "var(--ink)", paddingBottom: 2, borderBottom: "2px solid transparent", transition: ".15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink)")}>
              {lang === "ru" ? n.ru : n.tj}
            </Link>
          ))}
        </nav>

        {/* Правый блок */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          <Link href="/compare" className="btn ghost sm" style={{ position: "relative" }}>
            ⇄ {lang === "ru" ? "Сравнение" : "Муқоиса"}
            {compareCount > 0 && <span style={{ position: "absolute", top: -7, right: -7, background: "var(--brand2)", color: "#fff", borderRadius: "50%", width: 19, height: 19, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{compareCount}</span>}
          </Link>
          <Link href="/admin" className="btn ghost sm hide-mobile">{lang === "ru" ? "Кабинет банка" : "Кабинети бонк"}</Link>
          <div style={{ display: "flex", gap: 3, background: "var(--bg2)", padding: 3, borderRadius: 9 }}>
            {(["ru", "tj"] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)}
                style={{ padding: "5px 11px", fontSize: 12, fontWeight: 700, borderRadius: 7, border: "none", cursor: "pointer",
                  background: lang === l ? "var(--brand)" : "transparent", color: lang === l ? "#fff" : "var(--muted)" }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
      <style>{`@media(max-width:900px){.hide-mobile{display:none!important}}`}</style>
    </header>
  );
}
