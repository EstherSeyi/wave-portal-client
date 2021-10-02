module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      gridTemplateColumns: {
        200: "repeat(auto-fit, minmax(200px, 1fr));",
        automax: "repeat(auto-fit, minmax(250px, 275px))",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
