const { defineConfig } = require("eslint-define-config");

module.exports = defineConfig(
    {
        root: true,
        parser: "@typescript-eslint/parser",
        extends: [
            "plugin:@typescript-eslint/recommended",
            "next/core-web-vitals"
        ],
        parserOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
        },
        plugins: ["@typescript-eslint", "unused-imports", "simple-import-sort"],
        rules: {
            // Temporary disables
            "@typescript-eslint/ban-ts-comment": "warn",
            "react/no-unescaped-entities": "warn",

            // simple-import-sort
            "simple-import-sort/imports": "error",
            "simple-import-sort/exports": "error",

            // unused-imports
            "@typescript-eslint/no-unused-vars": "off",
            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": ["error", {argsIgnorePattern: "^_"}],
        },
        ignorePatterns: [
            "**/dist/**",
            "**/node_modules/**",
            ".eslintrc.cjs",
            "**/config.*",
        ],
    });
