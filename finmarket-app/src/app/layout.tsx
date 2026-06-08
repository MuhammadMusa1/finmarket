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
        <main className="container" style={{ paddingTop: 28, paddingBottom: 60, minHeight: "70vh" }}>{children}</main>
        <footer style={{ background: "var(--brand-deep)", color: "#cdddf0", marginTop: 40 }}>
          <div className="container" style={{ padding: "40px 20px", display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: 28 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 20, color: "#fff", marginBottom: 10 }}>Banki<span style={{ color: "var(--brand2)" }}>.tj</span></div>
              <p style={{ fontSize: 13, lineHeight: 1.5, opacity: .8 }}>Финансовый маркетплейс банковских продуктов Таджикистана. Сравнение и онлайн-заявки.</p>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#fff", marginBottom: 12, fontSize: 14 }}>Продукты</div>
              {[["Кредиты", "/catalog/credit"], ["Депозиты", "/catalog/deposit"], ["Карты", "/catalog/debit_card"], ["Ипотека", "/catalog/mortgage"]].map(([l, h]) => (
                <Link key={h} href={h} style={{ display: "block", fontSize: 13, marginBottom: 8, opacity: .85 }}>{l}</Link>
              ))}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#fff", marginBottom: 12, fontSize: 14 }}>Сервисы</div>
              {[["Сравнение", "/compare"], ["Калькулятор", "/"], ["Кабинет банка", "/admin"]].map(([l, h]) => (
                <Link key={l} href={h} style={{ display: "block", fontSize: 13, marginBottom: 8, opacity: .85 }}>{l}</Link>
              ))}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: "#fff", marginBottom: 12, fontSize: 14 }}>Информация</div>
              <p style={{ fontSize: 13, marginBottom: 8, opacity: .85 }}>Согласие на обработку ПДн</p>
              <p style={{ fontSize: 13, marginBottom: 8, opacity: .85 }}>Только лицензированные банки</p>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,.1)" }}>
            <div className="container" style={{ padding: "16px 20px", fontSize: 12, opacity: .6 }}>© 2026 ФинМаркет · Демо-версия маркетплейса · Республика Таджикистан</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
