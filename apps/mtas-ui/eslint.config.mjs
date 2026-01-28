import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Allow underscore-prefixed unused vars (common pattern for destructuring)
      "@typescript-eslint/no-unused-vars": ["error", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_"
      }],
      // Downgrade unescaped entities to warning (apostrophes in text)
      "react/no-unescaped-entities": "warn",
      // Allow @ts-ignore with a description
      "@typescript-eslint/ban-ts-comment": "warn",
    },
  },
];

export default eslintConfig;
