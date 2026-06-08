import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#f4f7fb", panel: "#ffffff", card: "#ffffff", line: "#e2e9f2",
        brand: "#0a4d8c", brand2: "#16b3b9", accent: "#f5a623",
        best: "#16a34a", danger: "#e02424", ink: "#0e2747", muted: "#6b7e99",
      },
    },
  },
  plugins: [],
};
export default config;
