"use client";
import Link from "next/link";
import { useCompare, useLang } from "@/lib/store";

export default function Header() {
  const { lang, setLang } = useLang();
  const compareCount = useCompare((s) => s.ids.length);

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(15,22,35,.92)", backdropFilter: "blur(8px)", borderBottom: "1px solid var(--line)" }}>
      <div className="container" style={{ display: "flex", alignItems: "center", gap: 18, padding: "14px 20px" }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: 19, letterSpacing: .3 }}>
          Fin<span style={{ color: "var(--brand)" }}>Market</span> <span className="muted" style={{ fontSize: 12 }}>TJ</span>
        </Link>
        <nav style={{ display: "flex", gap: 16, fontSize: 14, marginLeft: 8 }} className="muted">
          <Link href="/catalog/credit">Кредиты</Link>
          <Link href="/catalog/deposit">Депозиты</Link>
          <Link href="/catalog/mortgage">Ипотека</Link>
        </nav>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          <Link href="/compare" className="btn ghost sm">
            Сравнение{compareCount ? ` (${compareCount})` : ""}
          </Link>
          <Link href="/admin" className="btn ghost sm">Админ</Link>
          <div style={{ display: "flex", gap: 4 }}>
            {(["ru", "tj"] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)} className="btn sm"
                style={{ background: lang === l ? "var(--brand)" : "transparent", border: "1px solid var(--line)", color: lang === l ? "#fff" : "var(--muted)" }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
