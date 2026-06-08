import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "FinMarket TJ — Маркетплейс банковских продуктов",
  description: "Каталог, сравнение и онлайн-заявки на банковские продукты Таджикистана",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Header />
        <main className="container" style={{ paddingTop: 24, paddingBottom: 60 }}>{children}</main>
      </body>
    </html>
  );
}
