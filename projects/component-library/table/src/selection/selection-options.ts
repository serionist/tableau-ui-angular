

class CommonSelectionOptions {
    constructor(
        public readonly selectionMode: 'checkbox' | 'row-and-checkbox' = 'row-and-checkbox',
        public readonly clearSelectedKeysOnManualReset: boolean = true,
        public readonly clearSelectedKeysOnAnyReset = false,
    ) {}
}
export class SingleSelectionOptions extends CommonSelectionOptions {
    constructor(


        /**
         * Selection mode for the table.
         * - 'checkbox': Only checkbox selection is allowed.
         * - 'row-and-checkbox': Both row and checkbox selection are allowed.
         *
         */
        selectionMode: 'checkbox' | 'row-and-checkbox' = 'row-and-checkbox',
        /**
         * Clear the selected keys when a manual reset is triggered.
         */
        clearSelectedKeysOnManualReset: boolean = true,
        /**
         * Clear the selected keys when any reset is triggered.
         * This includes manual resets and automatic resets (e.g., when size/sort/displayed cols, etc changes).
         */
        clearSelectedKeysOnAnyReset = false,
    ) {
        super(selectionMode, clearSelectedKeysOnManualReset, clearSelectedKeysOnAnyReset);
    }
}
export class MultiSelectionOptions extends CommonSelectionOptions {
    constructor(


        /**
         * Configuration for the header checkbox mode.
         * This determines how the header checkbox behaves.
         * - 'none': No header checkbox is displayed.
         * - 'selectNone': A header checkbox is displayed that can only unselect all rows that have been selected
         * - `SelectAll`: A header checkbox is displayed that can select all rows that have been selected. Requires FullDataOptions to be used which can lead to performance issues with large datasets.
         */
        public readonly headerCheckboxMode: 'none' | 'selectNone' | 'selectAll',

        /**
         * Selection mode for the table.
         * - 'checkbox': Only checkbox selection is allowed.
         * - 'row-and-checkbox': Both row and checkbox selection are allowed.
         *
         */
        selectionMode: 'checkbox' | 'row-and-checkbox' = 'row-and-checkbox',

        /**
         * Clear the selected keys when a manual reset is triggered.
         */
        clearSelectedKeysOnManualReset: boolean = true,
        /**
         * Clear the selected keys when any reset is triggered.
         * This includes manual resets and automatic resets (e.g., when size/sort/displayed cols, etc changes).
         */
        clearSelectedKeysOnAnyReset: boolean = false,
    ) {
        super(selectionMode, clearSelectedKeysOnManualReset, clearSelectedKeysOnAnyReset);
    }
}

export type SelectionOptions = SingleSelectionOptions | MultiSelectionOptions;
