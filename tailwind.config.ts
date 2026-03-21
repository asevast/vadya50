import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background-primary)",
        gold: "var(--color-gold)",
        "electric-blue": "var(--color-electric-blue)",
      },
    },
  },
  plugins: [],
} satisfies Config;
