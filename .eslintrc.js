module.exports = {
  root: true,
  extends: ["universe/native"],
  env: {
    node: true,
  },
  rules: {
    // Ensures props and state inside functions are always up-to-date
    "react-hooks/exhaustive-deps": "warn",
  },
};
