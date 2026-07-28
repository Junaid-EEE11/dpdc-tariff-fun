import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  { ignores: ["dist", "CMS __ DPDC*", "CMS __ DPDC*_files/**"] },
  js.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  reactHooks.configs.flat.recommended,
  reactRefresh.configs.vite,
  {
    files: ["**/*.{js,jsx}"],
    rules: { "react-refresh/only-export-components": "off", "react/prop-types": "off" },
    settings: { react: { version: "detect" } },
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
  },
];
