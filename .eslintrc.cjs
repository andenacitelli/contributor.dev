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
        plugins: ["@typescript-eslint"],
        rules: {
            // Temporary disables
            "@typescript-eslint/ban-ts-comment": "warn",
            "react/no-unescaped-entities": "warn",
        },
        ignorePatterns: [
            "**/dist/**",
            "**/node_modules/**",
            ".eslintrc.cjs",
            "**/config.*",
        ],
    });
