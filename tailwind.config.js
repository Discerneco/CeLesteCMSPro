/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui')
  ],
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#1e40af",
          "secondary": "#4f46e5",
          "accent": "#0ea5e9",
          "neutral": "#1f2937",
          "base-100": "#ffffff",
          "info": "#3abff8",
          "success": "#22c55e",
          "warning": "#f59e0b",
          "error": "#ef4444",
        },
        dark: {
          "primary": "#3b82f6",
          "secondary": "#6366f1",
          "accent": "#38bdf8",
          "neutral": "#374151",
          "base-100": "#1f2937",
          "info": "#0ea5e9",
          "success": "#16a34a",
          "warning": "#f59e0b",
          "error": "#dc2626",
        },
      },
    ],
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
    logs: true,
    rtl: false,
    prefix: "",
  },
}
