import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f1623", panel: "#161f30", card: "#1d2940", line: "#2c3a57",
        brand: "#3b82f6", brand2: "#10b981", accent: "#f59e0b", best: "#10b981", danger: "#ef4444",
        muted: "#8a9bbd",
      },
      fontFamily: { display: ['Georgia','serif'], sans: ['system-ui','sans-serif'] },
    },
  },
  plugins: [],
};
export default config;
