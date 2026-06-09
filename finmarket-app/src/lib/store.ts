"use client";
import { create } from "zustand";

type CompareState = {
  ids: string[];
  category: string | null;
  add: (id: string, category: string) => string | null; // возвращает ошибку или null
  remove: (id: string) => void;
  clear: () => void;
};

export const useCompare = create<CompareState>((set, get) => ({
  ids: [],
  category: null,
  add: (id, category) => {
    const s = get();
    if (s.ids.includes(id)) return null;
    if (s.category && s.category !== category) return "Сравнение возможно только внутри одной категории";
    if (s.ids.length >= 4) return "Можно сравнить не более 4 продуктов";
    set({ ids: [...s.ids, id], category: s.category || category });
    return null;
  },
  remove: (id) => {
    const ids = get().ids.filter((x) => x !== id);
    set({ ids, category: ids.length ? get().category : null });
  },
  clear: () => set({ ids: [], category: null }),
}));

// Простой словарь tj/ru (US-09)
export const DICT: Record<string, Record<string, string>> = {
  ru: {
    catalog: "Каталог", compare: "Сравнение", apply: "Подать заявку", addCompare: "+ К сравнению",
    filters: "Фильтры", reset: "Сбросить фильтры", bank: "Банк", currency: "Валюта",
    amount: "Сумма", term: "Срок (мес)", rateMax: "Ставка до, %", sort: "Сортировка",
    effRate: "Эфф. ставка", updatedAt: "Актуально на", admin: "Админ",
    allBanks: "Все банки", partnerSort: "Партнёры сначала", partnerLabel: "Партнёр", chooseCategory: "Выберите категорию продукта",
  },
  tj: {
    catalog: "Каталог", compare: "Муқоиса", apply: "Дархост додан", addCompare: "+ Ба муқоиса",
    filters: "Филтрҳо", reset: "Тоза кардан", bank: "Бонк", currency: "Асъор",
    amount: "Маблағ", term: "Мӯҳлат (моҳ)", rateMax: "Меъёр то, %", sort: "Тартиб",
    effRate: "Меъёри муассир", updatedAt: "Навсозӣ", admin: "Админ",
    allBanks: "Ҳама бонкҳо", partnerSort: "Ҳамкорон аввал", partnerLabel: "Ҳамкор", chooseCategory: "Категорияи маҳсулотро интихоб кунед",
  },
};

export const useLang = create<{ lang: "ru" | "tj"; setLang: (l: "ru" | "tj") => void }>((set) => ({
  lang: "ru",
  setLang: (lang) => set({ lang }),
}));
