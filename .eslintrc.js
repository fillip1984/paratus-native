module.exports = {
  root: true,
  extends: [
    "plugin:@tanstack/eslint-plugin-query/recommended",
    "universe/native",
  ],
  env: {
    node: true,
  },
  rules: {
    // Ensures props and state inside functions are always up-to-date
    "react-hooks/exhaustive-deps": "warn",
  },
};
