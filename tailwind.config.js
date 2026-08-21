/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        doctus: {
          yellow: {
            50: '#FFFDF0',
            100: '#FFF9C4',
            200: '#FFF176',
            300: '#FFE082',
            400: '#FFD54F',
            DEFAULT: '#FFD400',
            600: '#FFB800',
            700: '#FFA000',
            800: '#FF8F00',
            900: '#FF6F00',
          },
          red: {
            50: '#FFEBEE',
            100: '#FFCDD2',
            200: '#EF9A9A',
            300: '#E57373',
            400: '#EF5350',
            DEFAULT: '#FF2D2D',
            600: '#E60000',
            700: '#D32F2F',
            800: '#B80000',
            900: '#900000',
          },
          cream: '#FFFDF5',
          dark: '#121214',
          card: '#1F1F24',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(255, 184, 0, 0.15)',
        'glass-red': '0 8px 32px 0 rgba(230, 0, 0, 0.2)',
        'glow-yellow': '0 0 20px rgba(255, 212, 0, 0.5)',
        'glow-red': '0 0 20px rgba(255, 45, 45, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
