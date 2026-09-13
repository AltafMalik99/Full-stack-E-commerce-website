/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  corePlugins: {
    // Disabled so Tailwind's base reset doesn't override the existing
    // hand-written customer-site CSS in src/index.css. Only utility
    // classes (used in src/admin/**) are generated and applied.
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        admin: {
          bg: "#0f1122",
          sidebar: "#161a34",
          card: "#1c2038",
          accent: "#7c5cff",
          accent2: "#3fa9f5",
        },
      },
    },
  },
  plugins: [],
};
