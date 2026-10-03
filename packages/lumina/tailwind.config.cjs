const aurora = require("../aurora/tailwind.config.js");
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "../aurora/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      ...aurora.theme.extend,
      colors: {
        ...aurora.theme.extend.colors,
        lumina: aurora.theme.extend.colors.primary,
      },
    },
  },
  plugins: [],
};
