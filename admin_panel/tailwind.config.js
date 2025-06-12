/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './index.html',
    // 确保包含所有可能的文件
    './src/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
    './src/pages/**/*.{js,jsx,ts,tsx}',
    './src/layouts/**/*.{js,jsx,ts,tsx}'
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--color-border))",
        input: "hsl(var(--color-input))",
        ring: "hsl(var(--color-ring))",
        background: "hsl(var(--color-background))",
        foreground: "hsl(var(--color-foreground))",
        primary: {
          DEFAULT: "hsl(var(--color-primary))",
          foreground: "hsl(var(--color-primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--color-secondary))",
          foreground: "hsl(var(--color-secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--color-destructive))",
          foreground: "hsl(var(--color-destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--color-muted))",
          foreground: "hsl(var(--color-muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--color-accent))",
          foreground: "hsl(var(--color-accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--color-popover))",
          foreground: "hsl(var(--color-popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--color-card))",
          foreground: "hsl(var(--color-card-foreground))",
        },
        // Custom colors for modern design
        blue: {
          50: "hsl(var(--color-blue-50))",
          500: "hsl(var(--color-blue-500))",
          600: "hsl(var(--color-blue-600))",
        },
        purple: {
          500: "hsl(var(--color-purple-500))",
          600: "hsl(var(--color-purple-600))",
        },
        indigo: {
          500: "hsl(var(--color-indigo-500))",
          600: "hsl(var(--color-indigo-600))",
        },
        slate: {
          50: "hsl(var(--color-slate-50))",
          100: "hsl(var(--color-slate-100))",
          200: "hsl(var(--color-slate-200))",
          500: "hsl(var(--color-slate-500))",
          600: "hsl(var(--color-slate-600))",
          700: "hsl(var(--color-slate-700))",
          800: "hsl(var(--color-slate-800))",
          900: "hsl(var(--color-slate-900))",
        },
        white: "hsl(var(--color-white))",
        emerald: {
          500: "hsl(var(--color-emerald-500))",
          600: "hsl(var(--color-emerald-600))",
        },
        teal: {
          500: "hsl(var(--color-teal-500))",
          600: "hsl(var(--color-teal-600))",
        },
        orange: {
          500: "hsl(var(--color-orange-500))",
          600: "hsl(var(--color-orange-600))",
        },
        pink: {
          500: "hsl(var(--color-pink-500))",
          600: "hsl(var(--color-pink-600))",
        },
        green: {
          50: "hsl(var(--color-green-50))",
          500: "hsl(var(--color-green-500))",
          600: "hsl(var(--color-green-600))",
        },
        red: {
          50: "hsl(var(--color-red-50))",
          500: "hsl(var(--color-red-500))",
          600: "hsl(var(--color-red-600))",
        },
        yellow: {
          50: "hsl(var(--color-yellow-50))",
          500: "hsl(var(--color-yellow-500))",
          600: "hsl(var(--color-yellow-600))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)" },
          "50%": { boxShadow: "0 0 40px rgba(147, 51, 234, 0.6)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "bounce-in": "bounce-in 0.6s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}