import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    rules: {
      "no-console": "warn",
      "no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: true,
          varsIgnorePattern: "^_", // Ignore variables starting with _
          argsIgnorePattern: "^_", // Ignore function arguments starting with _
        },
      ],
      caughtErrors: "off",
    },
  },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];
