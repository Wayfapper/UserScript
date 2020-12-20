module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: ["google", "plugin:prettier/recommended"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  rules: {
    "no-invalid-this": "off",
    "prefer-rest-params": "off",
  },
};
