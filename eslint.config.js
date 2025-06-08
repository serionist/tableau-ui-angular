// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const template = require('@angular-eslint/eslint-plugin-template');

module.exports = tseslint.config(
    angular.configs.tsRecommended,
    {
        files: ['**/*.ts'],
        ignores: ['**/*.spec.ts'],
        plugins: {
            '@angular-eslint/template': template,
        },
        extends: [eslint.configs.recommended, ...tseslint.configs.recommended, ...tseslint.configs.stylistic, ...angular.configs.tsRecommended],
        processor: angular.processInlineTemplates,
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: __dirname,
                projectService: true,
            },
        },
        rules: {
            // ## Typescript rules
            //Require that function overload signatures be consecutive
            '@typescript-eslint/adjacent-overload-signatures': 'error',
            //Require consistently using T[] for arrays instead of Array<T>
            '@typescript-eslint/array-type': 'error',
            //Disallow awaiting a value that is not a Thenable
            '@typescript-eslint/await-thenable': 'error',
            //Disallow @ts-<directive> comments or require descriptions after directives
            '@typescript-eslint/ban-ts-comment': 'error',
            //Disallow // tslint:<rule-flag> comments
            '@typescript-eslint/ban-tslint-comment': 'error',
            // Enforce that literals on classes are exposed in a consistent style
            '@typescript-eslint/class-literal-property-style': 'error',
            //Enforce that class methods utilize this -> makes everything static if it doesn't use class properties
            '@typescript-eslint/class-methods-use-this': 'off',
            //Enforce specifying generic type arguments on type annotation or constructor name of a constructor call
            '@typescript-eslint/consistent-generic-constructors': 'error',
            //Require or disallow the Record type
            '@typescript-eslint/consistent-indexed-object-style': 'error',
            //Require return statements to either always or never specify values
            '@typescript-eslint/consistent-return': 'error',
            //Enforce consistent usage of type assertions
            '@typescript-eslint/consistent-type-assertions': 'error',
            //Enforce type definitions to consistently use either interface or type
            '@typescript-eslint/consistent-type-definitions': 'error',
            //Enforce consistent usage of type exports
            '@typescript-eslint/consistent-type-exports': 'error',
            //Enforce consistent usage of type imports
            '@typescript-eslint/consistent-type-imports': 'error',
            //Enforce default parameters to be last
            '@typescript-eslint/default-param-last': 'off',
            //Enforce dot notation whenever possible
            '@typescript-eslint/dot-notation': 'error',
            //Require explicit return types on functions and class methods
            '@typescript-eslint/explicit-function-return-type': 'off',
            //Require explicit accessibility modifiers on class properties and methods
            '@typescript-eslint/explicit-member-accessibility': 'off',
            //Require explicit return and argument types on exported functions' and classes' public class methods
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            //Require or disallow initialization in variable declarations
            '@typescript-eslint/init-declarations': 'off',
            //Enforce a maximum number of parameters in function definitions
            '@typescript-eslint/max-params': [
                'error',
                {
                    max: 15,
                },
            ],
            //Require a consistent member declaration order
            '@typescript-eslint/member-ordering': 'off',
            //Enforce using a particular method signature syntax
            '@typescript-eslint/method-signature-style': 'error',
            //Enforce naming conventions for everything across a codebase
            '@typescript-eslint/naming-convention': 'off',
            //Disallow generic Array constructors
            '@typescript-eslint/no-array-constructor': 'error',
            //Disallow using the delete operator on array values
            '@typescript-eslint/no-array-delete': 'error',
            //Require .toString() and .toLocaleString() to only be called on objects which provide useful information when stringified
            '@typescript-eslint/no-base-to-string': 'error',
            //Disallow non-null assertion in locations that may be confusing
            '@typescript-eslint/no-confusing-non-null-assertion': 'error',
            //Require expressions of type void to appear in statement position
            '@typescript-eslint/no-confusing-void-expression': 'error',
            //Disallow using code marked as @deprecated
            '@typescript-eslint/no-deprecated': 'error',
            //Disallow duplicate class members
            '@typescript-eslint/no-dupe-class-members': 'error',
            //Disallow duplicate enum member values
            '@typescript-eslint/no-duplicate-enum-values': 'error',
            //Disallow duplicate constituents of union or intersection types
            '@typescript-eslint/no-duplicate-type-constituents': 'error',
            //Disallow using the delete operator on computed key expressions
            '@typescript-eslint/no-dynamic-delete': 'error',
            //Disallow empty functions
            '@typescript-eslint/no-empty-function': 'error',
            //Disallow accidentally using the "empty object" type
            '@typescript-eslint/no-empty-object-type': 'error',
            //@typescript-eslint/no-explicit-any
            '@typescript-eslint/no-explicit-any': 'error',
            //Disallow extra non-null assertions
            '@typescript-eslint/no-extra-non-null-assertion': 'error',
            //Disallow classes used as namespaces
            '@typescript-eslint/no-extraneous-class': 'off',
            //Require Promise-like statements to be handled appropriately
            '@typescript-eslint/no-floating-promises': 'error',
            //Disallow iterating over an array with a for-in loop
            '@typescript-eslint/no-for-in-array': 'off',
            //Disallow the use of eval()-like functions
            '@typescript-eslint/no-implied-eval': 'error',
            //Enforce the use of top-level import type qualifier when an import only has specifiers with inline type qualifiers
            '@typescript-eslint/no-import-type-side-effects': 'error',
            //Disallow explicit type declarations for variables or parameters initialized to a number, string, or boolean
            '@typescript-eslint/no-inferrable-types': 'off',
            //Disallow this keywords outside of classes or class-like objects
            '@typescript-eslint/no-invalid-this': 'off',
            //Disallow void type outside of generic or return types
            '@typescript-eslint/no-invalid-void-type': 'error',
            //Disallow function declarations that contain unsafe references inside loop statements
            '@typescript-eslint/no-loop-func': 'error',
            //Disallow magic numbers
            '@typescript-eslint/no-magic-numbers': 'off',
            //Disallow the void operator except when used to discard a value
            '@typescript-eslint/no-meaningless-void-operator': 'error',
            //Enforce valid definition of new and constructor
            '@typescript-eslint/no-misused-new': 'error',
            //Disallow Promises in places not designed to handle them
            '@typescript-eslint/no-misused-promises': 'error',
            //Disallow using the spread operator when it might cause unexpected behavior
            '@typescript-eslint/no-misused-spread': 'error',
            //Disallow enums from having both number and string members
            '@typescript-eslint/no-mixed-enums': 'error',
            //Disallow TypeScript namespaces
            '@typescript-eslint/no-namespace': 'error',
            //Disallow non-null assertions in the left operand of a nullish coalescing operator
            '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
            // Disallow non-null assertions after an optional chain expression
            '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
            // Disallow non-null assertions using the ! postfix operator
            '@typescript-eslint/no-non-null-assertion': 'off',
            //Disallow variable redeclaration
            '@typescript-eslint/no-redeclare': 'error',
            //Disallow members of unions and intersections that do nothing or override type information
            '@typescript-eslint/no-redundant-type-constituents': 'off',
            // Disallow invocation of require()
            '@typescript-eslint/no-require-imports': 'error',
            //Disallow specified modules when loaded by import
            '@typescript-eslint/no-restricted-imports': 'error',
            //Disallow certain types
            '@typescript-eslint/no-restricted-types': 'error',
            //Disallow variable declarations from shadowing variables declared in the outer scope
            '@typescript-eslint/no-shadow': 'error',
            //Disallow aliasing this
            '@typescript-eslint/no-this-alias': 'error',
            //Disallow unnecessary equality comparisons against boolean literals
            '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
            //Disallow conditionals where the type is always truthy or always falsy
            '@typescript-eslint/no-unnecessary-condition': 'off',
            //Disallow unnecessary assignment of constructor property parameter
            '@typescript-eslint/no-unnecessary-parameter-property-assignment': 'error',
            //Disallow unnecessary namespace qualifiers
            '@typescript-eslint/no-unnecessary-qualifier': 'error',
            //Disallow unnecessary template expressions
            '@typescript-eslint/no-unnecessary-template-expression': 'error',
            // Disallow type arguments that are equal to the default
            '@typescript-eslint/no-unnecessary-type-arguments': 'error',
            //Disallow type assertions that do not change the type of an expression
            '@typescript-eslint/no-unnecessary-type-assertion': 'error',
            //Disallow unnecessary constraints on generic types
            '@typescript-eslint/no-unnecessary-type-constraint': 'error',
            //Disallow conversion idioms when they do not change the type or value of the expression
            '@typescript-eslint/no-unnecessary-type-conversion': 'error',
            //Disallow type parameters that aren't used multiple times
            '@typescript-eslint/no-unnecessary-type-parameters': 'off',
            //Disallow calling a function with a value with type any
            '@typescript-eslint/no-unsafe-argument': 'error',
            //Disallow assigning a value with type any to variables and properties
            '@typescript-eslint/no-unsafe-assignment': 'error',
            //Disallow calling a value with type any
            '@typescript-eslint/no-unsafe-call': 'error',
            //Disallow unsafe declaration merging
            '@typescript-eslint/no-unsafe-declaration-merging': 'error',
            //Disallow comparing an enum value with a non-enum value
            '@typescript-eslint/no-unsafe-enum-comparison': 'error',
            //Disallow using the unsafe built-in Function type
            '@typescript-eslint/no-unsafe-function-type': 'error',
            //Disallow member access on a value with type any
            '@typescript-eslint/no-unsafe-member-access': 'error',
            //Disallow returning a value with type any from a function
            '@typescript-eslint/no-unsafe-return': 'error',
            //Disallow type assertions that narrow a type
            '@typescript-eslint/no-unsafe-type-assertion': 'off',
            //Require unary negation to take a number
            '@typescript-eslint/no-unsafe-unary-minus': 'error',
            //Disallow unused expressions
            '@typescript-eslint/no-unused-expressions': 'error',
            //Disallow unused variables
            '@typescript-eslint/no-unused-vars': 'off',
            //Disallow the use of variables before they are defined
            '@typescript-eslint/no-use-before-define': 'off',
            //Disallow unnecessary constructors
            '@typescript-eslint/no-useless-constructor': 'error',
            //Disallow empty exports that don't change anything in a module file
            '@typescript-eslint/no-useless-empty-export': 'error',
            //Disallow require statements except in import statements
            '@typescript-eslint/no-var-requires': 'error',
            //Disallow using confusing built-in primitive class wrappers
            '@typescript-eslint/no-wrapper-object-types': 'error',
            //Enforce non-null assertions over explicit type assertions
            '@typescript-eslint/non-nullable-type-assertion-style': 'error',
            //Disallow throwing non-Error values as exceptions
            '@typescript-eslint/only-throw-error': 'error',
            //Require or disallow parameter properties in class constructors
            '@typescript-eslint/parameter-properties': 'off',
            //Enforce the use of as const over literal type
            '@typescript-eslint/prefer-as-const': 'error',
            //Require destructuring from arrays and/or objects
            '@typescript-eslint/prefer-destructuring': 'off',
            //Require each enum member value to be explicitly initialized
            '@typescript-eslint/prefer-enum-initializers': 'error',
            // Enforce the use of Array.prototype.find() over filter()[0]
            '@typescript-eslint/prefer-find': 'error',
            // Enforce the use of for-of loop over traditional for loop
            '@typescript-eslint/prefer-for-of': 'error',
            // Enforce using function types instead of interfaces with call signatures
            '@typescript-eslint/prefer-function-type': 'error',
            // Enforce includes() over indexOf()
            '@typescript-eslint/prefer-includes': 'error',
            // Require all enum members to be literal values
            '@typescript-eslint/prefer-literal-enum-member': 'error',
            // Require using namespace keyword over module keyword
            '@typescript-eslint/prefer-namespace-keyword': 'error',
            // Enforce using nullish coalescing operator (??) instead of logical OR/AND
            '@typescript-eslint/prefer-nullish-coalescing': 'error',
            // Enforce concise optional chaining instead of nested checks
            '@typescript-eslint/prefer-optional-chain': 'error',
            // Require using Error objects as Promise rejection reasons
            '@typescript-eslint/prefer-promise-reject-errors': 'error',
            // Require private members to be marked readonly if never modified
            '@typescript-eslint/prefer-readonly': 'error',
            // Require readonly function parameters to prevent mutation
            '@typescript-eslint/prefer-readonly-parameter-types': 'off',
            // Enforce type parameter with Array#reduce over assertion
            '@typescript-eslint/prefer-reduce-type-parameter': 'error',
            // Enforce RegExp.exec over String.match if no global flag
            '@typescript-eslint/prefer-regexp-exec': 'error',
            // Enforce returning this when only this type is returned
            '@typescript-eslint/prefer-return-this-type': 'error',
            // Enforce using startsWith/endsWith over other substring checks
            '@typescript-eslint/prefer-string-starts-ends-with': 'error',
            // Require functions returning Promise to be async
            '@typescript-eslint/promise-function-async': 'error',
            // Enforce getter/setter pairs to have matching types
            '@typescript-eslint/related-getter-setter-pairs': 'error',
            // Require compareFunction in Array#sort and Array#toSorted
            '@typescript-eslint/require-array-sort-compare': 'error',
            // Disallow async functions with no await or Promise return
            '@typescript-eslint/require-await': 'error',
            // Enforce operands in addition are the same type (number, string, bigint)
            '@typescript-eslint/restrict-plus-operands': 'error',
            // Enforce only string-type expressions in template literals
            '@typescript-eslint/restrict-template-expressions': 'off',
            // Enforce consistent use of return await
            '@typescript-eslint/return-await': 'error',
            // Disallow loose boolean expressions (e.g., empty object as truthy)
            '@typescript-eslint/strict-boolean-expressions': 'error',
            // Enforce exhaustive switch statements
            '@typescript-eslint/switch-exhaustiveness-check': 'error',
            // Disallow triple-slash references in favor of ES6 imports
            '@typescript-eslint/triple-slash-reference': 'error',
            // Enforce calling unbound methods with correct scope
            '@typescript-eslint/unbound-method': 'off',
            // Enforce merging function overloads when possible
            '@typescript-eslint/unified-signatures': 'error',
            // Enforce using unknown type in catch callback variable
            '@typescript-eslint/use-unknown-in-catch-callback-variable': 'error',

            // ## Angular specific rules

            //Classes decorated with @Component must have suffix "Component" (or custom) in their name. Note: As of v20, this is no longer recommended by the Angular Team.
            '@angular-eslint/component-class-suffix': 'error',
            //Enforces a maximum number of lines in inline template, styles and animations. See more at https://angular.dev/style-guide#style-05-04
            '@angular-eslint/component-max-inline-declarations': [
                'error',
                {
                    template: 65,
                    styles: 50,
                    animations: 10,
                },
            ],
            //Component selectors should follow given naming rules. See more at https://angular.dev/style-guide#style-02-07, https://angular.dev/style-guide#style-05-02 and https://angular.dev/style-guide#style-05-03.
            '@angular-eslint/component-selector': [
                'error',
                {
                    type: 'element',
                    prefix: ['tab', 'app'],
                    style: 'kebab-case',
                },
            ],
            //Ensures consistent usage of styles/styleUrls/styleUrl within Component metadata
            '@angular-eslint/consistent-component-styles': 'error',
            //Ensures that classes use contextual decorators in its body
            '@angular-eslint/contextual-decorator': 'error',
            //Ensures that lifecycle methods are used in a correct context
            '@angular-eslint/contextual-lifecycle': 'error',
            //Classes decorated with @Directive must have suffix "Directive" (or custom) in their name. Note: As of v20, this is no longer recommended by the Angular Team.
            '@angular-eslint/directive-class-suffix': 'error',
            //Directive selectors should follow given naming rules. See more at https://angular.dev/style-guide#style-02-06 and https://angular.dev/style-guide#style-02-08.
            '@angular-eslint/directive-selector': [
                'error',
                {
                    type: 'attribute',
                    style: 'camelCase',
                },
            ],
            //Angular Lifecycle methods should not be async. Angular does not wait for async lifecycle but the code incorrectly suggests it does.
            '@angular-eslint/no-async-lifecycle-method': 'error',
            //The @Attribute decorator is used to obtain a single value for an attribute. This is a much less common use-case than getting a stream of values (using @Input), so often the @Attribute decorator is mistakenly used when @Input was what was intended. This rule disallows usage of @Attribute decorator altogether in order to prevent these mistakes.
            '@angular-eslint/no-attribute-decorator': 'error',
            //Ensures that directives not implement conflicting lifecycle interfaces.
            '@angular-eslint/no-conflicting-lifecycle': 'error',
            //Ensures that metadata arrays do not contain duplicate entries.
            '@angular-eslint/no-duplicates-in-metadata-arrays': 'error',
            //Disallows declaring empty lifecycle methods
            '@angular-eslint/no-empty-lifecycle-method': 'error',
            //Disallows usage of forwardRef references for DI
            '@angular-eslint/no-forward-ref': 'off',
            //Ensures that input bindings, including aliases, are not named or prefixed by the configured disallowed prefixes
            '@angular-eslint/no-input-prefix': [
                'error',
                {
                    prefixes: ['input', 'in'],
                },
            ],
            //Ensures that input bindings are not aliased
            '@angular-eslint/no-input-rename': 'off',
            //Disallows usage of the inputs metadata property. See more at https://angular.dev/style-guide#style-05-12
            '@angular-eslint/no-inputs-metadata-property': 'error',
            //Disallows explicit calls to lifecycle methods
            '@angular-eslint/no-lifecycle-call': 'error',
            //Ensures that output bindings, including aliases, are not named as standard DOM events
            '@angular-eslint/no-output-native': 'error',
            //Ensures that output bindings, including aliases, are not named "on", nor prefixed with it. See more at https://angular.dev/style-guide#style-05-16
            '@angular-eslint/no-output-on-prefix': 'error',
            //Ensures that output bindings are not aliased
            '@angular-eslint/no-output-rename': 'error',
            //Disallows usage of the outputs metadata property. See more at https://angular.dev/style-guide#style-05-12
            '@angular-eslint/no-outputs-metadata-property': 'error',
            //Disallows the declaration of impure pipes
            '@angular-eslint/no-pipe-impure': 'error',
            //Disallows usage of the queries metadata property. See more at https://angular.dev/style-guide#style-05-12.
            '@angular-eslint/no-queries-metadata-property': 'error',
            //Warns user about unintentionally doing logic on the signal, rather than the signal's value
            '@angular-eslint/no-uncalled-signals': 'error',
            //Enforce consistent prefix for pipes.
            '@angular-eslint/pipe-prefix': 'error',
            //Prefer using the inject() function over constructor parameter injection
            '@angular-eslint/prefer-inject': 'error',
            //Ensures component's changeDetection is set to ChangeDetectionStrategy.OnPush
            '@angular-eslint/prefer-on-push-component-change-detection': 'error',
            //Use OutputEmitterRef instead of @Output()
            '@angular-eslint/prefer-output-emitter-ref': 'error',
            //Prefer to declare @Output, OutputEmitterRef and OutputRef as readonly since they are not supposed to be reassigned
            '@angular-eslint/prefer-output-readonly': 'error',
            //Use readonly signals instead of @Input(), @ViewChild() and other legacy decorators
            '@angular-eslint/prefer-signals': 'error',
            //Ensures Components, Directives and Pipes do not opt out of standalone.
            '@angular-eslint/prefer-standalone': 'off',
            //The ./ and ../ prefix is standard syntax for relative URLs; don't depend on Angular's current ability to do without that prefix. See more at https://angular.dev/style-guide#style-05-04
            '@angular-eslint/relative-url-prefix': 'error',
            //Ensures that lifecycle methods are defined on the object's prototype instead of on an instance.
            '@angular-eslint/require-lifecycle-on-prototype': 'error',
            //Ensures that $localize tagged messages contain helpful metadata to aid with translations.
            '@angular-eslint/require-localize-metadata': 'error',
            //Ensures that $localize tagged messages can use runtime-loaded translations.
            '@angular-eslint/runtime-localize': 'error',
            //Ensures that keys in type decorators (Component, Directive, NgModule, Pipe) are sorted in a consistent order
            '@angular-eslint/sort-keys-in-type-decorator': 'error',
            //Ensures that lifecycle methods are declared in order of execution
            '@angular-eslint/sort-lifecycle-methods': 'error',
            //Component selector must be declared
            '@angular-eslint/use-component-selector': 'error',
            //Disallows using ViewEncapsulation.None
            '@angular-eslint/use-component-view-encapsulation': 'error',
            //Using the providedIn property makes Injectables tree-shakable
            '@angular-eslint/use-injectable-provided-in': 'error',
            //Ensures that classes implement lifecycle interfaces corresponding to the declared lifecycle methods. See more at https://angular.dev/style-guide#style-09-01
            '@angular-eslint/use-lifecycle-interface': 'error',
            //Ensures that Pipes implement PipeTransform interface
            '@angular-eslint/use-pipe-transform-interface': 'error',
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
