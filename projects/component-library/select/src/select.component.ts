import type { AfterViewInit, InputSignal, OnDestroy, Signal, TemplateRef, WritableSignal } from '@angular/core';
import { ChangeDetectionStrategy, Component, computed, contentChild, contentChildren, effect, ElementRef, forwardRef, inject, input, model, signal, viewChild } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { Subscription } from 'rxjs';
import { fromEvent, map } from 'rxjs';
import type { Primitive } from 'tableau-ui-angular/types';
import type { IOptionGridContext, IOptionLineContext } from 'tableau-ui-angular/common';
import { OptionComponent, PrefixComponent, SuffixComponent } from 'tableau-ui-angular/common';
import type { DialogRef } from 'tableau-ui-angular/dialog';
import { DialogService } from 'tableau-ui-angular/dialog';
import { generateRandomString } from 'tableau-ui-angular/utils';

export type SelectValue = Exclude<Primitive, undefined> | Exclude<Primitive, undefined>[] | undefined;
@Component({
    selector: 'tab-select',
    standalone: false,
    templateUrl: './select.component.html',
    styleUrl: './select.component.scss',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SelectComponent),
            multi: true,
        },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'tab-input',
        '[attr.wrapping-mode]': '$selectedValueWrapMode()',
        '[tabindex]': '$disabled() ? -1 : 0',
        '(click)': 'openDropdown()',
        '(keydown)': 'onKeyDown($event)',
        '[attr.disabled]': '$disabled() ? true : null',
        '[aria-disabled]': '$disabled() ? true : null',
        '[aria-hidden]': '$disabled() ? true : null',
        '[id]': 'selectId',
    },
})
export class SelectComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
    protected readonly selectId: string;
    protected readonly dropdownId: string;
    protected readonly $options = contentChildren<OptionComponent>(OptionComponent);
    private readonly optionsChanged = effect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const options = this.$options();
        this.$highlightedOption.set(undefined);
    });
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    protected readonly $dropdownPrefix: Signal<PrefixComponent | undefined> = contentChild<PrefixComponent>(PrefixComponent);
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    protected readonly $dropdownSuffix: Signal<SuffixComponent | undefined> = contentChild<SuffixComponent>(SuffixComponent);
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    private readonly $dropdownTemplate: Signal<TemplateRef<unknown> | undefined> = viewChild<TemplateRef<unknown>>('dropdownTemplate');

    // #region Imports
    private readonly dialogService = inject(DialogService);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    // #endregion
    // #region Inputs
    /**
     * Whether the select is disabled
     * @remarks
     * Set this using the FormControl if you are using reactive forms.
     * Only set this manually if you are not using reactive forms.
     *
     * @default false
     */
    readonly $disabled = model(false, {
        alias: 'disabled',
    });
    /**
     * Placeholder text to display when no value is selected
     * // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
     */
    readonly $placeholder: InputSignal<string | undefined> = input<string>(undefined, {
        alias: 'placeholder',
    });
    /**
     * The currently selected value.
     * @remarks
     * If allowMultiple is true, this should be an array of values.
     * If allowMultiple is false, this should be a single value.
     */
    readonly $value = model<SelectValue>(undefined, {
        alias: 'value',
    });

    /**
     * The CSS text to apply to the dropdown container
     * @remarks
     * Use this to apply height, maxHeight, etc. to the dropdown container
     * @default '{}'
     */
    readonly $dropdownContainerCss = input<Record<string, string>>(
        {},
        {
            alias: 'dropdownContainerCss',
        },
    );
    /**
     * The CSS text to apply to the options container in the dropdown
     * @remarks
     * Use this to apply height, maxHeight, etc. to the dropdown
     * This is applied to the options container, excluding the prefix & suffix
     *
     * @default "{ maxHeight: '300px', height: 'fit-content'}"
     */
    readonly $dropdownOptionsContainerCss = input<Record<string, string>>(
        {
            maxHeight: '300px',
            height: 'fit-content',
        },
        {
            alias: 'dropdownOptionsContainerCss',
        },
    );
    /**
     * Whether to show the chevron icon on the right side of the select
     */
    readonly $showChevron = input<boolean>(true, {
        alias: 'showChevron',
    });
    /**
     * The location of the check icon in dropdown option if an option is selected
     * @default 'none'
     */
    readonly $selectedCheckIconLocation = input<'left' | 'none' | 'right'>('none', {
        alias: 'selectedCheckIconLocation',
    });

    /**
     * Highlight the selected item(s) with a primary back color
     * @default true
     */
    readonly $selectedItemHighlight = input<boolean>(true, {
        alias: 'selectedItemHighlight',
    });
    /**
     * Whether multiple values can be selected
     * @default false
     */
    readonly $allowMultiple = input<boolean>(false, {
        alias: 'allowMultiple',
    });
    /**
     * Whether the clear button should be displayed
     * @remarks
     * It is only displayed if there are any values selected even if this is true
     * @default false
     */
    readonly $allowClear = input<boolean>(false, {
        alias: 'allowClear',
    });
    /**
     * The wrapping mode for the selected value field
     * @remarks
     * If set to 'wrap', the text will wrap to the next line if it is too long to fit on one line. This will increase the height of the control
     * If set to 'truncate', the text will be truncated with an ellipsis if it is too long to fit on one line. This will keep the height of the control the same
     * @default 'wrap'
     */
    readonly $selectedValueWrapMode = input<'truncate' | 'wrap'>('wrap', {
        alias: 'selectedValueWrapMode',
    });
    /**
     * The template context to use for the selected value field
     * @remarks
     * Use this to display the 'icon' and 'text' properties of the selected value conditionally
     */
    readonly $selectedValueTemplateContext = input<IOptionLineContext>(
        {
            renderIcon: true,
            renderText: true,
        },
        {
            alias: 'selectedValueTemplateContext',
        },
    );
    /**
     * The template context to use for the dropdown options
     * @remarks
     * Use this to display the 'icon', 'text', and 'hint' properties of the options conditionally
     */
    readonly $dropdownValueTemplateContext = input<IOptionGridContext>(
        {
            renderIcon: true,
            renderText: true,
            renderHint: true,
        },
        {
            alias: 'dropdownValueTemplateContext',
        },
    );
    /**
     * The maximum number of items to display in the selected value field when multiple items are selected
     * @default 2
     */
    readonly $multipleSelectionMaxItemsListed = input<number>(2, {
        alias: 'multipleSelectionMaxItemsListed',
    });
    /**
     * The display template to use when more than the maximum number of items selected
     * @remarks
     * Use {number} as a placeholder for the number of items selected
     */
    readonly $multipleSelectionNumberSelectedTemplate = input<string>('{number} items selected', {
        alias: 'multipleSelectionNumberSelectedTemplate',
    });

    // #endregion
    // #region Constructor + Init + Destroy
    constructor() {
        const id = generateRandomString();
        this.selectId = `select-${id}`;
        this.dropdownId = `dropdown-${id}`;
    }
    ngAfterViewInit() {
        this.registerFocusChange();
    }

    ngOnDestroy() {
        this.unregisterFocusChange();
    }
    // #endregion
    // #region Computed
    readonly $hasValue = computed(() => {
        const value = this.$value();
        if (value === undefined) {
            return false;
        }
        if (this.$allowMultiple()) {
            if (!Array.isArray(value)) {
                return false;
            }
            return value.length > 0;
        } else {
            return true;
        }
    });
    protected readonly $selectedValueTemplates = computed(() => {
        if (!this.$hasValue()) {
            return [];
        }
        let val: Primitive[] = [];
        const value = this.$value();
        if (Array.isArray(value)) {
            val = value;
        } else if (value !== undefined) {
            val = [value];
        }
        const ret = val.map((v) => ({
            value: v,
            template: this.$options()
                .find((o) => o.$value() === v)
                ?.$lineTemplate(),
        }));

        return ret.filter((e) => e.template !== undefined) as {
            value: Primitive;
            template: TemplateRef<IOptionLineContext>;
        }[];
    });

    protected readonly $displayClearButton = computed(() => {
        if (!this.$allowClear()) {
            return false;
        }
        if (!this.$hasValue()) {
            return false;
        }
        return true;
    });
    // #endregion
    // #region ControlValueAccessor
    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    onChange = (value: SelectValue) => {};
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onTouched = () => {};
    writeValue(value: SelectValue): void {
        this.$value.set(value);
    }
    registerOnChange(fn: (value: SelectValue) => void) {
        this.onChange = fn;
    }
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }
    setDisabledState(isDisabled: boolean): void {
        this.$disabled.set(isDisabled);
    }
    // #endregion
    // #region Value selection
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    protected readonly $highlightedOption: WritableSignal<OptionComponent | undefined> = signal<OptionComponent | undefined>(undefined);
    optionMouseDown(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
    }
    selectValue(option: OptionComponent) {
        if (!this.$disabled() && !option.$disabled()) {
            const value = this.$value();
            const optionValue = option.$value();
            if (this.$allowMultiple()) {
                if (value === undefined || !Array.isArray(value)) {
                    this.$value.set([optionValue]);
                } else if (!value.includes(optionValue)) {
                    this.$value.set([...value, optionValue]);
                } else {
                    this.$value.set(value.filter((e) => e !== optionValue));
                }
            } else if (this.$value() !== option.$value()) {
                this.$value.set(option.$value());
            }
            this.onChange(this.$value());
            this.onTouched();
            if (!this.$allowMultiple()) {
                this.$dropdownReference()?.close();
            }
        }
    }
    clearValue(e: Event) {
        e.preventDefault();
        e.stopPropagation();
        if (this.$disabled()) {
            return;
        }
        if (this.$allowMultiple()) {
            this.$value.set([]);
        } else {
            this.$value.set(undefined);
        }
        this.onChange(this.$value());
        this.onTouched();
    }
    isValueSelected(option: OptionComponent) {
        const value = this.$value();
        const optionValue = option.$value();
        if (this.$allowMultiple()) {
            if (!Array.isArray(value)) {
                return false;
            }
            return value.includes(optionValue);
        } else {
            return value === optionValue;
        }
    }
    // #endregion
    // #region Dropdown

    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    private readonly $dropdownReference: WritableSignal<DialogRef | undefined> = signal<DialogRef | undefined>(undefined);
    protected readonly $dropdownOpen = computed(() => this.$dropdownReference() !== undefined);

    openDropdown() {
        if (this.$disabled()) {
            return;
        }
        this.$highlightedOption.set(undefined);
        const elRect = this.elementRef.nativeElement.getBoundingClientRect();
        const ref = this.dialogService.openTemplateDialog(
            this.$dropdownTemplate()!,
            {
                top(actualWidth, actualHeight) {
                    if (elRect.bottom + actualHeight > window.innerHeight && elRect.top - actualHeight > 0) {
                        return elRect.top - actualHeight + 'px';
                    }
                    return elRect.bottom + 'px';
                },
                left: elRect.left + 'px',
                width: elRect.width + 'px',
                closeOnEscape: true,
                closeOnBackdropClick: true,
            },
            null,
            this.elementRef.nativeElement,
        );

        this.registerOptionKeyNavigation();
        ref.closed$.subscribe(() => {
            this.unregisterOptionKeyNavigation();
            if (this.$dropdownReference() === ref) {
                this.$dropdownReference.set(undefined);
            }
        });
        this.$dropdownReference.set(ref);
    }
    // #endregion
    // #region Keyboard navigation

    /**
     *
     * @param e Handles KeyDown event for:
     * - host element
     * - global keydown event when dropdown is open
     * @returns
     */
    onKeyDown(e: KeyboardEvent) {
        if (e.key === 'Enter' || e.key === ' ') {
            const ref = this.$dropdownReference();
            // if dropdown is not open
            if (!ref) {
                this.openDropdown();
            } else {
                // if dropdown is open
                // if an option is highlighted, select it
                if (this.$highlightedOption()) {
                    this.selectValue(this.$highlightedOption()!);
                } else {
                    // if an option is not highlighted, close the dropdown
                    ref.close();
                }
            }
            e.preventDefault();
            e.stopPropagation();
        }
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            // if dropdown is open:
            // - we find the currently HIGHLIGHTED option
            // - we find the next option to highlight
            // - if no option is found, we highlight the first/last option
            // if dropdown is NOT open:
            // - if this is a multiselect, ignore
            // - if this is a single select, find the next item to select
            // - if no item is selected, highlight the first/last item
            const open = this.$dropdownOpen();
            if (this.$allowMultiple() && !open) {
                return;
            }

            let currentIndex = -1;
            if (open) {
                // find already highlighted option
                if (this.$highlightedOption()) {
                    currentIndex = this.$options().findIndex((o) => o.$value() === this.$highlightedOption()!.$value());
                }
            } else {
                // find already selected option
                currentIndex = this.$options().findIndex(
                    // we can be sure that at this point, this is a single select dropdown, so this.value() can be safely used
                    (o) => o.$value() === this.$value(),
                );
            }
            let nextIndex: number;
            // find the next index to highlight/select
            if (e.key === 'ArrowDown') {
                if (currentIndex === -1) {
                    // find the first non disabled option
                    nextIndex = this.$options().findIndex((o) => !o.$disabled());
                } else {
                    // find the next option that is not disabled
                    nextIndex = this.$options().findIndex((o, i) => i > currentIndex && !o.$disabled());
                    // if no option is found, find the next option that is not disabled before the current item
                    if (nextIndex === -1) {
                        nextIndex = this.$options().findIndex((o, i) => i < currentIndex && !o.$disabled());
                    }
                }
            } else if (e.key === 'ArrowUp') {
                if (currentIndex === -1) {
                    // find the last non disabled option
                    nextIndex = this.$options()
                        .slice()
                        .reverse()
                        .findIndex((o) => !o.$disabled());
                    if (nextIndex !== -1) {
                        nextIndex = this.$options().length - nextIndex - 1;
                    }
                } else {
                    const flippedCurrentIndex = this.$options().length - currentIndex - 1;
                    // find the next option that is not disabled
                    nextIndex = [...this.$options()].reverse().findIndex((o, i) => i > flippedCurrentIndex && !o.$disabled());
                    // if no option is found, find the next option that is not disabled before the current item
                    if (nextIndex === -1) {
                        nextIndex = [...this.$options()].reverse().findIndex((o, i) => i < flippedCurrentIndex && !o.$disabled());
                    }
                    if (nextIndex !== -1) {
                        nextIndex = this.$options().length - nextIndex - 1;
                    }
                }
            } else {
                nextIndex = -1;
            }

            if (nextIndex !== -1) {
                if (open) {
                    this.$highlightedOption.set(this.$options()[nextIndex]);
                    setTimeout(
                        () =>
                            document.querySelector(`#${this.dropdownId} .option-wrapper.highlight`)?.scrollIntoView({
                                block: 'nearest',
                            }),
                        10,
                    );
                } else {
                    this.selectValue(this.$options()[nextIndex]);
                }
            }

            e.preventDefault();
            e.stopPropagation();
        }
    }
    clearKeyDown(e: KeyboardEvent) {
        if (e.key === 'Enter' || e.key === ' ') {
            this.clearValue(e);
            e.preventDefault();
        }
    }
    optionKeyNavSubscription: Subscription | undefined;
    private registerOptionKeyNavigation() {
        this.unregisterOptionKeyNavigation();
        this.optionKeyNavSubscription = fromEvent(document, 'keydown')
            .pipe(map((e) => e as KeyboardEvent))
            .subscribe((e: KeyboardEvent) => {
                this.onKeyDown(e);
            });
    }
    private unregisterOptionKeyNavigation() {
        if (this.optionKeyNavSubscription) {
            this.optionKeyNavSubscription.unsubscribe();
            this.optionKeyNavSubscription = undefined;
        }
    }
    // #endregion
    // #region Focus management
    focusChangeFn: ((event: FocusEvent) => void) | undefined;
    registerFocusChange() {
        this.focusChangeFn = this.checkFocus.bind(this);
        document.addEventListener('focusout', this.focusChangeFn);
    }
    unregisterFocusChange() {
        document.removeEventListener('focusout', this.focusChangeFn!);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    checkFocus(event: FocusEvent) {
        setTimeout(() => {
            const dropdownContainer = document.getElementById(this.dropdownId);

            if (!this.elementRef.nativeElement.contains(document.activeElement) && dropdownContainer?.contains(document.activeElement) !== true) {
                const ref = this.$dropdownReference();
                if (ref) {
                    ref.close();
                }
            }
        }, 100);
    }

    // #endregion
}
