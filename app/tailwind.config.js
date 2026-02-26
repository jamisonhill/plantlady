/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'selector',
  theme: {
    extend: {
      fontFamily: {
        display: ["'Cormorant Garamond'", 'Georgia', 'serif'],
        body: ["'DM Sans'", 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: '0.75rem',     // 12px
        sm: '0.875rem',    // 14px
        base: '1rem',      // 16px
        lg: '1.125rem',    // 18px
        xl: '1.375rem',    // 22px
        '2xl': '1.875rem', // 30px
        '3xl': '2.5rem',   // 40px
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        full: '9999px',
      },
      colors: {
        // Dark mode (primary)
        bg: {
          DEFAULT: '#1A140E',
          surface: '#2C1F14',
          'surface-2': '#3D2B1A',
          'surface-3': '#4E3722',
        },
        brand: {
          terracotta: '#C4613A',
          'terracotta-light': '#E07A52',
          sage: '#7A9E7E',
          'sage-light': '#9BBBAA',
          gold: '#D4A85C',
        },
        text: {
          primary: '#F5EED8',
          secondary: '#C4B49A',
          muted: '#8A7B6B',
        },
        semantic: {
          success: '#7BC47A',
          error: '#E05555',
          warning: '#D4A85C',
        },
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.4)',
        md: '0 4px 12px rgba(0,0,0,0.5)',
        lg: '0 8px 24px rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        'dark-vignette': 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(196,97,58,0.08) 0%, transparent 70%), linear-gradient(180deg, #1A140E 0%, #150F0A 100%)',
        'card-gradient': 'linear-gradient(135deg, #2C1F14 0%, #261A10 100%)',
        'section-plants': 'radial-gradient(ellipse at top right, rgba(122,158,126,0.12) 0%, transparent 50%)',
        'section-garden': 'radial-gradient(ellipse at top right, rgba(196,97,58,0.12) 0%, transparent 50%)',
      },
    },
  },
  plugins: [],
}
