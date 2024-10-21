// @ts-expect-error ignore
import pluginJs from "@eslint/js";
import globals from "globals";
import tsESLint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default [
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tsESLint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    ignores: ["**/dist/*"],
    rules: {
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
          tabWidth: 2,
        },
      ],
      indent: "off", // Turning this off to avoid conflicts with prettier
      semi: ["error", "always"],
      quotes: ["error", "double", { avoidEscape: true }],
      "no-empty-function": "off",
      "@typescript-eslint/no-empty-function": "off",
      "react/display-name": "off",
      "react/prop-types": "off",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
  {
    ignores: ["node_modules", "pm2.config.js"],
  },
];
