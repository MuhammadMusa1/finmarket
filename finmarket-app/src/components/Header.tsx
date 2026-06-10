"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCompare, useLang } from "@/lib/store";

const NAV = [
  { href: "/catalog/credit", ru: "Кредиты", tj: "Қарзҳо" },
  { href: "/catalog/deposit", ru: "Депозиты", tj: "Пасандозҳо" },
  { href: "/catalog/debit_card", ru: "Карты", tj: "Кортҳо" },
  { href: "/catalog/mortgage", ru: "Ипотека", tj: "Ипотека" },
  { href: "/catalog/microloan", ru: "Микрозаймы", tj: "Микроқарзҳо" },
  { href: "/catalog/insurance", ru: "Страхование", tj: "Суғурта" },
];

const IcCompare = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 3h5v5M21 3l-7 7M8 21H3v-5M3 21l7-7" />
  </svg>
);
const IcBank = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18M5 21V10M19 21V10M3 10l9-7 9 7M9 21v-6h6v6" />
  </svg>
);

export default function Header() {
  const { lang, setLang } = useLang();
  const compareCount = useCompare((s) => s.ids.length);
  const pathname = usePathname();

  return (
    <header
      style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,.86)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div className="container" style={{ display: "flex", alignItems: "center", gap: 26, padding: "13px 20px" }}>
        {/* Логотип */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
          <span
            style={{
              width: 36, height: 36, borderRadius: 11, display: "flex", alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg,var(--hero-from),var(--hero-to))",
              boxShadow: "0 4px 12px rgba(19,102,214,.30)",
            }}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
              <path d="M3 21h18M5 21V9M19 21V9M3 9l9-6 9 6M9 21v-5h6v5" />
            </svg>
          </span>
          <span style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-.03em" }}>
            Banki<span style={{ color: "var(--brand2)" }}>.tj</span>
          </span>
        </Link>

        {/* Навигация */}
        <nav className="hide-mobile" style={{ display: "flex", gap: 4 }}>
          {NAV.map((n) => {
            const active = pathname?.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                style={{
                  fontSize: 14, fontWeight: 600, padding: "8px 13px", borderRadius: 10,
                  color: active ? "var(--brand)" : "var(--ink)",
                  background: active ? "var(--brand-soft)" : "transparent",
                  transition: ".15s",
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--bg2)"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                {lang === "ru" ? n.ru : n.tj}
              </Link>
            );
          })}
        </nav>

        {/* Правый блок */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          <Link href="/compare" className="btn ghost sm" style={{ position: "relative" }}>
            <IcCompare /> {lang === "ru" ? "Сравнение" : "Муқоиса"}
            {compareCount > 0 && (
              <span
                style={{
                  position: "absolute", top: -7, right: -7, width: 20, height: 20,
                  background: "var(--brand2)", color: "#fff", borderRadius: "50%",
                  fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center",
                  justifyContent: "center", boxShadow: "0 2px 8px rgba(17,181,188,.45)",
                }}
              >
                {compareCount}
              </span>
            )}
          </Link>
          <Link href="/admin" className="btn soft sm hide-mobile">
            <IcBank /> {lang === "ru" ? "Кабинет банка" : "Кабинети бонк"}
          </Link>
          <div style={{ display: "flex", gap: 3, background: "var(--bg2)", padding: 3, borderRadius: 10 }}>
            {(["ru", "tj"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  padding: "5px 12px", fontSize: 12, fontWeight: 800, borderRadius: 8,
                  border: "none", cursor: "pointer", fontFamily: "var(--font-body)",
                  background: lang === l ? "#fff" : "transparent",
                  color: lang === l ? "var(--brand)" : "var(--muted)",
                  boxShadow: lang === l ? "var(--shadow-sm)" : "none",
                  transition: ".15s",
                }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
