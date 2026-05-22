import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        hgex: {
          bg: '#07010f',
          card: 'rgba(17,25,40,0.65)',
          primary: '#a855f7',
          secondary: '#7c3aed',
          accent: '#c084fc',
          text: '#ffffff',
          muted: '#94a3b8',
          success: '#10b981',
          danger: '#ef4444',
          glow: 'rgba(168,85,247,0.45)',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'float-slow': 'floatSlow 6s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'ticker': 'ticker 30s linear infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(168,85,247,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(168,85,247,0.6), 0 0 60px rgba(168,85,247,0.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '33%': { transform: 'translateY(-6px) rotate(0.5deg)' },
          '66%': { transform: 'translateY(4px) rotate(-0.3deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
