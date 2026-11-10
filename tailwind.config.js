/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "var(--paper)",
          elevated: "var(--paper-elevated)",
        },
        ink: {
          DEFAULT: "var(--ink)",
          soft: "var(--ink-soft)",
        },
        mute: "var(--mute)",
        line: {
          DEFAULT: "var(--line)",
          strong: "var(--line-strong)",
        },
        ember: {
          DEFAULT: "var(--ember)",
          deep: "var(--ember-deep)",
          soft: "var(--ember-soft)",
        },
        void: {
          DEFAULT: "var(--void)",
          soft: "var(--void-soft)",
        },
        danger: "var(--danger)",
        /* legacy aliases so older pages don't break mid-migrate */
        steel: "var(--mute)",
        signal: {
          DEFAULT: "var(--ember)",
          deep: "var(--ember-deep)",
          soft: "var(--ember-soft)",
        },
        spark: {
          DEFAULT: "var(--ember)",
          ink: "#ffffff",
        },
        panel: {
          DEFAULT: "var(--panel)",
          soft: "var(--void-soft)",
          ink: "var(--panel-ink)",
        },
        "on-void": {
          DEFAULT: "var(--on-void)",
          soft: "var(--on-void-soft)",
          mute: "var(--on-void-mute)",
          line: "var(--on-void-line)",
        },
      },
      fontFamily: {
        display: ["var(--font-sora)", "system-ui", "sans-serif"],
        sans: ["var(--font-sora)", "system-ui", "sans-serif"],
        serif: ["var(--font-literata)", "Georgia", "serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "2px",
        lg: "8px",
      },
      maxWidth: {
        measure: "72rem",
      },
      transitionTimingFunction: {
        field: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        lift: "var(--shadow-lift)",
        ember: "var(--shadow-ember)",
      },
    },
  },
  plugins: [],
};
