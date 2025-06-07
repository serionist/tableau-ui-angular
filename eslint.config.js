// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
const template = require('@angular-eslint/eslint-plugin-template');

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    plugins: {
      "@angular-eslint/template": template
    },
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: ["tab", 'app'],
          style: "kebab-case",
        },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/ban-tslint-comment": "off",
      "@angular-eslint/prefer-standalone": "off",
      "@angular-eslint/no-input-rename": "off",
    },
  },
  {
    files: ["**/*.html"],
    plugins: {
      "@angular-eslint/template": template
    },
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {
      '@angular-eslint/template/no-call-expression': [
        'error',
        {
          allowPrefix: '$'
        },
      ],
    },
  }
);
