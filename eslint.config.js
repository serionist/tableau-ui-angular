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
            // Disallows calling expressions in templates, except for output handlers
            // Allows prefixing with $ to allow for calling Signals
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
            '@angular-eslint/template/i18n': ['off'], // not yet needed
            // [Accessibility] Ensures that elements with interactive handlers like (click) are focusable.
            '@angular-eslint/template/interactive-supports-focus': ['error'],
            // [Accessibility] Ensures that a label element/component is associated with a form element
            '@angular-eslint/template/label-has-associated-control': [
                'error',
                {
                    controlComponents: ['input', 'select', 'textarea', 'tab-select', 'tab-list', 'tab-checkbox', 'tab-radiogroup'],
                },
            ],
            // [Accessibility] Ensures that the mouse events mouseout and mouseover are accompanied by focus and blur events respectively. Coding for the keyboard is important for users with physical disabilities who cannot use a mouse, AT compatibility, and screenreader users. See more at
            '@angular-eslint/template/mouse-events-have-key-events': ['error'],
            // The use of "$any" nullifies the compile-time benefits of Angular's type system
            '@angular-eslint/template/no-any': ['error'],
            //Disallows calling expressions in templates, except for output handlers
            '@angular-eslint/template/no-autofocus': ['error'],
            //[Accessibility] Enforces that no distracting elements are used
            '@angular-eslint/template/no-distracting-elements': ['error'],
            //Ensures that there are no duplicate input properties or output event listeners
            '@angular-eslint/template/no-duplicate-attributes': ['error'],
            //Disallows the use of inline styles in HTML templates
            '@angular-eslint/template/no-inline-styles': [
                'error',
                {
                    allowBindToStyle: true,
                    allowNgStyle: true,
                },
            ],
            //Ensures that property-binding is used instead of interpolation in attributes.
            '@angular-eslint/template/no-interpolation-in-attributes': [
                'error',
                {
                    allowSubstringInterpolation: false,
                },
            ],
            //Ensures that async pipe results, as well as values used with the async pipe, are not negated
            '@angular-eslint/template/no-negated-async': ['error'],
            // Denies nesting of tags
            '@angular-eslint/template/no-nested-tags': ['error'],
            //Ensures that the tabindex attribute is not positive
            '@angular-eslint/template/no-positive-tabindex': ['error'],
            //Prefer using @empty with @for loops instead of a separate @if or @else block to reduce code and make it easier to read.
            '@angular-eslint/template/prefer-at-empty': ['error'],
            //Ensures that contextual variables are used in @for blocks where possible instead of aliasing them.
            '@angular-eslint/template/prefer-contextual-for-variables': ['off'],
            //Ensures that the built-in control flow is used.
            '@angular-eslint/template/prefer-control-flow': ['error'],
            //Ensures ngSrc is used instead of src for img elements
            '@angular-eslint/template/prefer-ngsrc': ['error'],
            //Ensures that self-closing tags are used for elements with a closing tag but no content.
            '@angular-eslint/template/prefer-self-closing-tags': ['error'],
            //Ensures that static string values use property assignment instead of property binding.
            '@angular-eslint/template/prefer-static-string-properties': ['error'],
            //Ensure that template literals are used instead of concatenating strings or expressions.
            '@angular-eslint/template/prefer-template-literal': ['error'],
            //[Accessibility] Ensures elements with ARIA roles have all required properties for that role.
            '@angular-eslint/template/role-has-required-aria': ['error'],
            // [Accessibility] Ensures that the scope attribute is only used on the <th> element
            '@angular-eslint/template/table-scope': ['error'],
            //Ensures trackBy function is used
            '@angular-eslint/template/use-track-by-function': ['error'],
            //[Accessibility] Ensures that correct ARIA attributes and respective values are used
            '@angular-eslint/template/valid-aria': ['error'],
        },
    },
);
