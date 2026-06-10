import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Banki.tj — маркетплейс банковских продуктов Таджикистана",
  description: "Каталог, сравнение и онлайн-заявки на кредиты, депозиты, карты и ипотеку банков Таджикистана",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Header />
        <main className="container" style={{ paddingTop: 30, paddingBottom: 70, minHeight: "70vh" }}>
          {children}
        </main>

        <footer style={{ background: "var(--brand-deep)", color: "#c6d8ee" }}>
          <div
            className="container"
            style={{ padding: "48px 20px 40px", display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr", gap: 30 }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
                <span style={{
                  width: 32, height: 32, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                  background: "linear-gradient(135deg,var(--hero-mid),var(--hero-to))",
                }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
                    <path d="M3 21h18M5 21V9M19 21V9M3 9l9-6 9 6M9 21v-5h6v5" />
                  </svg>
                </span>
                <span style={{ fontWeight: 800, fontSize: 20, color: "#fff", letterSpacing: "-.03em" }}>
                  Banki<span style={{ color: "var(--brand2)" }}>.tj</span>
                </span>
              </div>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, opacity: .78, maxWidth: 280 }}>
                Финансовый маркетплейс банковских продуктов Таджикистана. Сравнение условий и онлайн-заявки в лицензированные банки и МФО.
              </p>
            </div>

            <div>
              <div style={{ fontWeight: 700, color: "#fff", marginBottom: 14, fontSize: 14 }}>Продукты</div>
              {[["Кредиты", "/catalog/credit"], ["Депозиты", "/catalog/deposit"], ["Карты", "/catalog/debit_card"], ["Ипотека", "/catalog/mortgage"]].map(([l, h]) => (
                <Link key={h} href={h} style={{ display: "block", fontSize: 13.5, marginBottom: 9, opacity: .82, transition: ".15s" }}>
                  {l}
                </Link>
              ))}
            </div>

            <div>
              <div style={{ fontWeight: 700, color: "#fff", marginBottom: 14, fontSize: 14 }}>Сервисы</div>
              {[["Сравнение", "/compare"], ["Калькулятор", "/"], ["Кабинет банка", "/admin"]].map(([l, h]) => (
                <Link key={l} href={h} style={{ display: "block", fontSize: 13.5, marginBottom: 9, opacity: .82 }}>
                  {l}
                </Link>
              ))}
            </div>

            <div>
              <div style={{ fontWeight: 700, color: "#fff", marginBottom: 14, fontSize: 14 }}>Информация</div>
              <p style={{ fontSize: 13.5, marginBottom: 9, opacity: .82 }}>Согласие на обработку ПДн</p>
              <p style={{ fontSize: 13.5, marginBottom: 9, opacity: .82 }}>Только лицензированные банки</p>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,.09)" }}>
            <div className="container" style={{ padding: "18px 20px", fontSize: 12.5, opacity: .55, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <span>© 2026 Banki.tj · Республика Таджикистан</span>
              <span>Демо-версия маркетплейса</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
