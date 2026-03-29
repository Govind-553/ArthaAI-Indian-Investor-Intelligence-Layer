const config = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        mist: '#eef2ff',
        saffron: '#f59e0b',
        ocean: '#0f766e',
        slateblue: '#1d4ed8',
      },
      boxShadow: {
        glow: '0 18px 55px rgba(15, 23, 42, 0.15)',
      },
      backgroundImage: {
        grid: 'radial-gradient(circle at 1px 1px, rgba(15, 23, 42, 0.07) 1px, transparent 0)',
      },
    },
  },
  plugins: [],
};

export default config;

