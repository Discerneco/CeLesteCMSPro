/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
    require('@tailwindcss/typography'),
  ],
  daisyui: {
    themes: [
      "light",
      "dark",
      {
        celesteLight: {
          "primary": "#1d4ed8",
          "secondary": "#4f46e5",
          "accent": "#0ea5e9",
          "neutral": "#2a323c",
          "base-100": "#f3f4f6",
          "info": "#3abff8",
          "success": "#36d399",
          "warning": "#fbbd23",
          "error": "#f87272"
        },
        celesteDark: {
          "primary": "#3b82f6",
          "secondary": "#818cf8",
          "accent": "#38bdf8",
          "neutral": "#191D24",
          "base-100": "#1f2937",
          "info": "#60a5fa",
          "success": "#34d399",
          "warning": "#fbbf24",
          "error": "#ef4444"
        }
      }
    ],
    darkTheme: "celesteDark",
    base: true,
    styled: true,
    utils: true,
    rtl: false,
    logs: true
  }
}
