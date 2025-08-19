export default {
  plugins: {
    '@thedutchcoder/postcss-rem-to-px': {
      // Shadow DOM'da rem birimleri sorun yaratır, px'e dönüştürür
      baseFontSize: 16
    },
    // autoprefixer kaldırıldı - Tailwind v4'te otomatik
  },
};