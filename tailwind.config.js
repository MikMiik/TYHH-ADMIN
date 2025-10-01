module.exports = {
  theme: {
    extend: {
      // thêm utilities cho image-rendering
      imageRendering: {
        auto: "auto",
        crisp: "crisp-edges",
        pixel: "pixelated",
        contrast: "-webkit-optimize-contrast",
      },
    },
  },
  plugins: [
    function ({ addUtilities, theme }) {
      const newUtilities = {
        ".image-auto": { "image-rendering": theme("imageRendering.auto") },
        ".image-crisp": { "image-rendering": theme("imageRendering.crisp") },
        ".image-pixel": { "image-rendering": theme("imageRendering.pixel") },
        ".image-contrast": {
          "image-rendering": theme("imageRendering.contrast"),
        },
      };
      addUtilities(newUtilities, ["responsive"]);
    },
  ],
};
