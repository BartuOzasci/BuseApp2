/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Unchanged brand palette — pink stays the identity
        pink: {
          50: "#fdf2f8",
          100: "#fce7f3",
          200: "#fbcfe8",
          300: "#f9a8d4",
          400: "#f472b6",
          500: "#ec4899",
          600: "#db2777",
          700: "#be185d",
          800: "#9d174d",
          900: "#831843",
        },
        // Neutral scale for the editorial / luxury layer
        ink: {
          50: "#f7f7f8",
          100: "#eeeef0",
          200: "#d9d9dd",
          300: "#b6b6bd",
          400: "#8b8b94",
          500: "#6b6b74",
          600: "#4f4f57",
          700: "#3c3c43",
          800: "#26262b",
          900: "#161619",
        },
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        label: "0.18em",
        wider2: "0.28em",
      },
      borderRadius: {
        lux: "1.5rem",
      },
      boxShadow: {
        // Layered, low-opacity shadows read as "expensive"
        card: "0 1px 2px rgba(157, 23, 77, 0.04), 0 8px 24px -12px rgba(157, 23, 77, 0.12)",
        "card-hover":
          "0 1px 2px rgba(157, 23, 77, 0.06), 0 18px 40px -16px rgba(157, 23, 77, 0.22)",
        lift: "0 24px 60px -28px rgba(157, 23, 77, 0.35)",
        inset: "inset 0 1px 0 rgba(255,255,255,0.6)",
      },
      backgroundImage: {
        "pink-sheen":
          "linear-gradient(135deg, #db2777 0%, #ec4899 45%, #f472b6 100%)",
        "pink-veil": "linear-gradient(180deg, #fdf2f8 0%, #ffffff 100%)",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        rise: "rise 0.45s cubic-bezier(0.22, 1, 0.36, 1) both",
        shimmer: "shimmer 2.4s linear infinite",
      },
    },
  },
  plugins: [],
};
