/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Warm white background and deep charcoal text
        canvas: {
          DEFAULT: "#FBF9F5",   // warm white
          soft: "#F5F2EC",
          card: "#FFFFFF",
        },
        ink: {
          DEFAULT: "#1B1B1F",   // deep charcoal
          soft: "#2A2A30",
          muted: "#6B6B73",
          subtle: "#A0A0A8",
        },
        line: {
          DEFAULT: "#ECE7DD",   // warm border
          soft: "#F2EEE6",
        },
        // Single accent color — Amber (warm, classy)
        accent: {
          50:  "#FFF8EB",
          100: "#FEEFCD",
          200: "#FDDF9B",
          300: "#FBC85F",
          400: "#F5AE2B",
          500: "#D9911A",   // primary accent
          600: "#B47512",
          700: "#8E5B0F",
          DEFAULT: "#D9911A",
          dark: "#B47512",
          light: "#FFF3D6",
        },
        // Backwards compat alias (older code uses brand)
        brand: {
          DEFAULT: "#D9911A",
          dark: "#B47512",
          light: "#FFF3D6",
        },
      },
      borderRadius: {
        DEFAULT: "10px",
        md: "10px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(27,27,31,0.04), 0 4px 16px -2px rgba(27,27,31,0.06)",
        lift: "0 4px 8px rgba(27,27,31,0.05), 0 16px 32px -12px rgba(27,27,31,0.10)",
        ring: "0 0 0 1px rgba(217,145,26,0.35), 0 8px 24px -8px rgba(217,145,26,0.30)",
      },
      keyframes: {
        "fade-in": { from: { opacity: 0 }, to: { opacity: 1 } },
        "scale-in": {
          from: { opacity: 0, transform: "scale(0.96)" },
          to: { opacity: 1, transform: "scale(1)" },
        },
        "slide-up": {
          from: { opacity: 0, transform: "translateY(8px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
        "scale-in": "scale-in 180ms cubic-bezier(0.2, 0.9, 0.3, 1.2)",
        "slide-up": "slide-up 220ms cubic-bezier(0.2, 0.9, 0.3, 1.2)",
      },
    },
  },
  plugins: [],
};
