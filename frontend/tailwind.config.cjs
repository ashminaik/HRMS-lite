/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F7F4ED",
        pastel: {
          yellow: "#F5D867",
          pink: "#F5B8DB",
          red: "#FFCCCB",
          blue: "#B6CAEB",
          green: "#9AAB63",
          lavender: "#E8DFF5",
        },
        ink: "#1F2937",
        slate: "#4B5563",
      },
      boxShadow: {
        soft: "0 12px 30px rgba(31, 41, 55, 0.08)",
      },
      borderRadius: {
        card: "18px",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
