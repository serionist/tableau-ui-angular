// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const template = require('@angular-eslint/eslint-plugin-template');

module.exports = tseslint.config(
    {
        files: ['**/*.ts'],
        plugins: {
            '@angular-eslint/template': template,
        },
        extends: [eslint.configs.recommended, ...tseslint.configs.recommended, ...tseslint.configs.stylistic, ...angular.configs.tsRecommended],
        processor: angular.processInlineTemplates,
        rules: {
            '@angular-eslint/directive-selector': [
                'error',
                {
                    type: 'attribute',
                    style: 'camelCase',
                },
            ],
            '@angular-eslint/component-selector': [
                'error',
                {
                    type: 'element',
                    prefix: ['tab', 'app'],
                    style: 'kebab-case',
                },
            ],
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-inferrable-types': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/ban-tslint-comment': 'off',
            '@angular-eslint/prefer-standalone': 'off',
            '@angular-eslint/no-input-rename': 'off',
        },
    },
    {
        files: ['**/*.html'],
        plugins: {
            '@angular-eslint/template': template,
        },
        extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
        rules: {
            '@angular-eslint/template/no-call-expression': [
                'error',
                {
                    allowPrefix: '$',
                },
            ],
            //[Accessibility] Enforces alternate text for elements which require the alt, aria-label, aria-labelledby attributes.
            '@angular-eslint/template/alt-text': ['error'],
            //Ensures that HTML attributes and Angular bindings are sorted based on an expected order
            '@angular-eslint/template/attributes-order': ['error'],
            //Ensures that the two-way data binding syntax is correct
            '@angular-eslint/template/banana-in-box': ['error'],
            //Ensures that a button has a valid type specified
            '@angular-eslint/template/button-has-type': ['off'], // this is added by the default button component
            //The conditional complexity should not exceed a rational limit
            '@angular-eslint/template/conditional-complexity': [
                'error',
                {
                    maxComplexity: 5,
                },
            ],
            // Checks cyclomatic complexity against a specified limit. It is a quantitative measure of the number of linearly independent paths through a program's source code
            '@angular-eslint/template/cyclomatic-complexity': [
                'error',
                {
                    maxComplexity: 25,
                },
            ],
            // [Accessibility] Ensures that the heading, anchor and button elements have content in it
            '@angular-eslint/template/elements-content': [
                'error',
                {
                    allowList: [],
                },
            ],
            // Requires === and !== in place of == and !=
            '@angular-eslint/template/eqeqeq': ['error'],
            "@angular-eslint/template/i18n": ['off'], // not yet needed
            // [Accessibility] Ensures that elements with interactive handlers like (click) are focusable.
            '@angular-eslint/template/interactive-supports-focus': ['error'],
            // [Accessibility] Ensures that a label element/component is associated with a form element
            '@angular-eslint/template/label-has-associated-control': [
                'error',
                {
                    controlComponents: ['input', 'select', 'textarea', 'tab-select', 'tab-list', 'tab-checkbox', 'tab-radiogroup']
                },
            ],
        },
    },
);
