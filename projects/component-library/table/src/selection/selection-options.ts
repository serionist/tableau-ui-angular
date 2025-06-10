import type { Primitive } from 'tableau-ui-angular/types';

class CommonSelectionOptions<T, TKey extends Primitive> {
    constructor(
        public readonly getRowKey: (row: T) => TKey,
        public readonly selectionMode: 'row-selection' | 'checkbox-selection' | 'both' = 'both',
        public readonly clearSelectedKeysOnManualReset: boolean = true,
        public readonly clearSelectedKeysOnAnyReset = false,
    ) {}
}
export class SingleSelectionOptions<T, TKey extends Primitive> extends CommonSelectionOptions<T, TKey> {
    constructor(
        /**
         * Function to get the key for a row.
         * This is used to identify the row uniquely in the selection.
         */
        getRowKey: (row: T) => TKey,

        /**
         * Selection mode for the table.
         * - 'row-selection': Only row selection is allowed. No checkboxes are shown
         * - 'checkbox-selection': Only checkbox selection is allowed. No row highlighting is shown.
         * - 'both': Both row and checkbox selection are allowed.
         *
         */
        selectionMode: 'row-selection' | 'checkbox-selection' | 'both' = 'both',
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
        super(getRowKey, selectionMode, clearSelectedKeysOnManualReset, clearSelectedKeysOnAnyReset);
    }
}
export class MultiSelectionOptions<T, TKey extends Primitive> extends CommonSelectionOptions<T, TKey> {
    constructor(
        /**
         * Function to get the key for a row.
         * This is used to identify the row uniquely in the selection.
         */
        getRowKey: (row: T) => TKey,

        /**
         * Selection mode for the table.
         * - 'row-selection': Only row selection is allowed. No checkboxes are shown
         * - 'checkbox-selection': Only checkbox selection is allowed. No row highlighting is shown.
         * - 'both': Both row and checkbox selection are allowed.
         *
         */
        selectionMode: 'row-selection' | 'checkbox-selection' | 'both' = 'both',

        /**
         * Configuration for the header checkbox mode.
         * This determines how the header checkbox behaves.
         * - 'none': No header checkbox is displayed.
         * - 'selectNone': A header checkbox is displayed that can only unselect all rows that have been selected
         * - `SelectAllOptions`: A header checkbox is displayed that can select all rows that have been selected. Requires a function to get all row keys.
         */
        public readonly headerCheckboxMode: 'none' | 'selectNone' | SelectAllOptions<TKey> = 'none',

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
        super(getRowKey, selectionMode, clearSelectedKeysOnManualReset, clearSelectedKeysOnAnyReset);
    }
}

export class SelectAllOptions<TKey extends Primitive> {
    constructor(
        /**
         * The function to get all row keys.
         * This is used to retrieve all keys for the rows in the table.
         * If this is provided,
         */
        public readonly getAllRowKeys: (abortSignal: AbortSignal) => Promise<TKey[]> | undefined,
    ) {}
}
