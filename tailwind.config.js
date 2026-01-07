/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        hc: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669', // Primary Green
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        night: {
          900: '#F3F4F6',
          800: '#D1D5DB',
          700: '#FFFFFF',
          600: '#E5E7EB',
          500: '#1F2937',
          400: '#4B5563',
          100: '#111827'
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'soft-card': '0 20px 45px rgba(6, 20, 27, 0.35)',
        'hub': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};
