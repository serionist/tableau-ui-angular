/**
 * The dialog will be placed in the global stacking context, placed at the end of the document body.
 * This is useful for dialogs that need to be displayed above all other content, such as modals or overlays.
 */
export class GlobalStackOptions {
    constructor(
        /**
         * The reference element thats' DOMRect is passed to the left() and height() function of the dialog args.
         * Optional.
         */
        public readonly referenceElement?: HTMLElement,
    ) {}
}

/**
 * The dialog will be placed in the local stacking context, inserted after the specified element.
 * This is useful for dialogs that need to be displayed relative to a specific element, such as tooltips or popovers.
 * The dialog will be placed after the `insertAfterElement` in the DOM.
 * The dialog content will be tabbable right after the `insertAfterElement`.
 */
export class LocalStackOptions {
    constructor(
        /**
         * The element after which the dialog will be inserted in the DOM.
         * If 'referenceElement' is not provided, this will be the reference element that's DOMRect is passed to the left() and height() function of the dialog args.
         */
        public readonly insertAfterElement: HTMLElement,
        /**
         * The reference element that's DOMRect is passed to the left() and height() function of the dialog args.
         * If not provided, the `insertAfterElement` will be used as the reference element.
         */
        public readonly referenceElement?: HTMLElement,
    ) {}
}

export type StackOptions = GlobalStackOptions | LocalStackOptions;
