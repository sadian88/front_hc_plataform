/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
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
        sans: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'soft-card': '0 20px 45px rgba(6, 20, 27, 0.35)'
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};
