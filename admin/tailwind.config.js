/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          darkBrown: '#251B19',
          beige: '#ECD7C5',
          yellow: '#FFCC33',
          offWhite: '#F8F9FA',
          grayLight: '#F5F5F5',
          grayMedium: '#D1D1D1',
          grayDark: '#6B6B6B',
          grayMuted: '#8E8A89',
        },
      },
    },
  },
  plugins: [],
};
