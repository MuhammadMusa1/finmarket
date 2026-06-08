"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Cat = { id: string; code: string; name_ru: string; name_tj: string };

export default function Home() {
  const [cats, setCats] = useState<Cat[]>([]);
  useEffect(() => { fetch("/api/categories").then((r) => r.json()).then(setCats); }, []);

  return (
    <div className="fade">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 6 }}>Банковские продукты Таджикистана</h1>
        <p className="muted">Сравните условия банков и подайте заявку онлайн — в одном месте.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 16 }}>
        {cats.map((c) => (
          <Link key={c.id} href={`/catalog/${c.code}`} className="card" style={{ padding: 20, transition: ".15s" }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: "linear-gradient(135deg,var(--brand),var(--brand2))", marginBottom: 12 }} />
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>{c.name_ru}</h3>
            <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>{c.name_tj}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
