import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}"],
  darkMode: "selector",
  theme: {
    fontFamily: {
      sans: [
        "Pretendard", "-apple-system", "BlinkMacSystemFont", "system-ui", "Roboto", "\"Helvetica Neue\"",
        "\"Segoe UI\"", "\"Apple SD Gothic Neo\"", "\"Noto Sans KR\"", "\"Malgun Gothic\"", "sans-serif",
      ],
      ingame: [
        "GyeonggiTitle", "-apple-system", "BlinkMacSystemFont", "system-ui", "Roboto", "\"Helvetica Neue\"",
        "\"Segoe UI\"", "\"Apple SD Gothic Neo\"", "\"Noto Sans KR\"", "\"Malgun Gothic\"", "sans-serif",
      ]
    },
    extend: {
      boxShadow: {
        't-sm': '0 -1px 2px 0 rgba(0, 0, 0, 0.05)',
        't-md': '0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        't-lg': '0 -10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        't-xl': '0 -20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        't-2xl': '0 -25px 50px -12px rgba(0, 0, 0, 0.25)',
        't-3xl': '0 -35px 60px -15px rgba(0, 0, 0, 0.3)',
      },
      inset: {
        'safe-b': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
} satisfies Config;
