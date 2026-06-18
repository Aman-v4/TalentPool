/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          50: "#f8fafc",
          100: "#f1f3f9",
          200: "#e8ecf4",
          400: "#8b95a8",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          900: "#111827",
        },
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          300: "#93c5fd",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        coral: {
          50: "#fff1f2",
          200: "#fecdd3",
          500: "#f43f5e",
        },
        amber: {
          50: "#fffbeb",
          200: "#fde68a",
          500: "#f59e0b",
        },
        surface: {
          DEFAULT: "#f4f6fc",
          tint: "#eef1fa",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "1.5rem",
      },
      boxShadow: {
        card: "0 4px 24px rgba(15, 23, 42, 0.06)",
        panel: "0 8px 32px rgba(15, 23, 42, 0.08)",
        soft: "0 2px 12px rgba(15, 23, 42, 0.04)",
      },
    },
  },
  plugins: [],
};
