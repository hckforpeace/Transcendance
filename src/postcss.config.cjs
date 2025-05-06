// postcss.config.js (ou postcss.config.cjs si tu utilises CommonJS)
module.exports = {
  plugins: [
    require('tailwindcss'),        // Charge Tailwind CSS
    require('autoprefixer'),       // Ajoute des préfixes pour la compatibilité avec les navigateurs
  ]
};
