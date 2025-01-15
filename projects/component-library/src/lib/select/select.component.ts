import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    contentChildren,
    ElementRef,
    forwardRef,
    inject,
    model,
    OnDestroy,
    OnInit,
    output,
    signal,
    TemplateRef,
    viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
    IOptionGridContext,
    IOptionLineContext,
    OptionComponent,
} from '../common/option';
import { SnackService } from '../snack/snack.service';
import { DialogService } from '../dialogservice/dialog.service';
import { DialogRef } from '../dialogservice/dialog.ref';
import { fromEvent, map, Subscription } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { PrefixComponent } from '../common/prefix';
import { SuffixComponent } from '../common/suffix';

@Component({
    selector: 'tab-select',
    templateUrl: './select.component.html',
    styleUrl: './select.component.scss',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SelectComponent),
            multi: true,
        },
    ],
    host: {
        class: 'tab-input',
        '[attr.wrapping-mode]': 'selectedValueWrapMode()',
        '[tabindex]': 'disabled() ? -1 : 0',
        '(click)': 'openDropdown()',
        '(keydown)': 'onKeyDown($event)',
        '[attr.disabled]': 'disabled() ? true : null',
        '[aria-disabled]': 'disabled() ? true : null',
        '[aria-hidden]': 'disabled() ? true : null',
        '[id]': 'selectId',
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponent
    implements ControlValueAccessor, AfterViewInit, OnDestroy
{
    selectId: string;
    dropdownId: string;
    options = contentChildren<OptionComponent>(OptionComponent);
    dropdownPrefix = contentChild<PrefixComponent>(PrefixComponent);
    dropdownSuffix = contentChild<PrefixComponent>(SuffixComponent);
    dropdownTemplate = viewChild<TemplateRef<any>>('dropdownTemplate');

    // #region Imports
    snackService = inject(SnackService);
    dialogService = inject(DialogService);
    elementRef = inject(ElementRef);
    elRef = inject(ElementRef);
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
    disabled = model(false);
    /**
     * Placeholder text to display when no value is selected
     */
    placeholder = model<string>();
    /**
     * The currently selected value.
     * @remarks
     * If allowMultiple is true, this should be an array of values.
     * If allowMultiple is false, this should be a single value.
     */
    value = model<any | any[]>(undefined);

    /**
     * The CSS text to apply to the dropdown container
     * @remarks
     * Use this to apply height, maxHeight, etc. to the dropdown container
     * @default '{}'
     */
    dropdownContainerCss = model<{ [key: string]: string }>({});
    /**
     * The CSS text to apply to the options container in the dropdown
     * @remarks
     * Use this to apply height, maxHeight, etc. to the dropdown
     * This is applied to the options container, excluding the prefix & suffix
     * 
     * @default "{ maxHeight: '300px', height: 'fit-content'}"
     */
    dropdownOptionsContainerCss = model<{ [key: string]: string }>({
        maxHeight: '300px',
        height: 'fit-content',
    });
    /**
     * Whether to show the chevron icon on the right side of the select
     */
    showChevron = model<boolean>(true);
    /**
     * The location of the check icon in dropdown option if an option is selected
     * @default 'none'
     */
    selectedCheckIconLocation = model<'left' | 'right' | 'none'>('none');

    /**
     * Highlight the selected item(s) with a primary back color
     * @default true
     */
    selectedItemHighlight = model<boolean>(true);
    /**
     * Whether multiple values can be selected
     * @default false
     */
    allowMultiple = model<boolean>(false);
    /**
     * Whether the clear button should be displayed
     * @remarks
     * It is only displayed if there are any values selected even if this is true
     * @default false
     */
    allowClear = model<boolean>(false);
    /**
     * The wrapping mode for the selected value field
     * @remarks
     * If set to 'wrap', the text will wrap to the next line if it is too long to fit on one line. This will increase the height of the control
     * If set to 'truncate', the text will be truncated with an ellipsis if it is too long to fit on one line. This will keep the height of the control the same
     * @default 'wrap'
     */
    selectedValueWrapMode = model<'wrap' | 'truncate'>('wrap');
    /**
     * The template context to use for the selected value field
     * @remarks
     * Use this to display the 'icon' and 'text' properties of the selected value conditionally
     */
    selectedValueTemplateContext = model<IOptionLineContext>({
        renderIcon: true,
        renderText: true,
    });
    /**
     * The template context to use for the dropdown options
     * @remarks
     * Use this to display the 'icon', 'text', and 'hint' properties of the options conditionally
     */
    dropdownValueTemplateContext = model<IOptionGridContext>({
        renderIcon: true,
        renderText: true,
        renderHint: true,
    });
    /**
     * The maximum number of items to display in the selected value field when multiple items are selected
     * @default 2
     */
    multipleSelectionMaxItemsListed = model<number>(2);
    /**
     * The display template to use when more than the maximum number of items selected
     * @remarks
     * Use {number} as a placeholder for the number of items selected
     */
    multipleSelectionNumberSelectedTemplate = model<string>(
        '{number} items selected'
    );

    // #endregion
    // #region Constructor + Init + Destroy
    constructor() {
        const id = this.generateId();
        this.selectId = `select-${id}`;
        this.dropdownId = `dropdown-${id}`;
        toObservable(this.options).subscribe((options) => {
            this.highlightedOption.set(undefined);
        });
    }
    ngAfterViewInit() {
        this.registerFocusChange();
    }

    ngOnDestroy() {
        this.unregisterFocusChange();
    }
    // #endregion
    // #region Computed
    hasValue = computed(() => {
        if (this.allowMultiple()) {
            return this.value()?.length > 0;
        } else {
            return this.value() !== undefined && this.value() !== null;
        }
    });
    selectedValueTemplates = computed(() => {
        if (!this.hasValue()) {
            return [];
        }
        let val: any[] = [];
        if (Array.isArray(this.value())) {
            val = this.value();
        } else if (this.value() !== undefined && this.value() !== null) {
            val = [this.value()];
        }
        const ret = val.map((v) => ({
            value: v,
            template: this.options()
                .find((o) => o.value() === v)
                ?.lineTemplate(),
        }));

        return ret.filter((e) => e.template !== undefined) as {
            value: any;
            template: TemplateRef<IOptionLineContext>;
        }[];
    });

    displayClearButton = computed(() => {
        if (!this.allowClear()) {
            return false;
        }
        if (!this.hasValue()) {
            return false;
        }
        return true;
    });
    // #endregion
    // #region ControlValueAccessor
    onChange = (value: any) => {};
    onTouched = () => {};
    writeValue(value: any): void {
        this.value.set(value);
    }
    registerOnChange(fn: any): void {
        this.onChange = fn;
    }
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
    setDisabledState(isDisabled: boolean): void {
        this.disabled.set(isDisabled);
    }
    // #endregion
    // #region Value selection
    highlightedOption = signal<OptionComponent | undefined>(undefined);
    optionMouseDown(event: MouseEvent)  {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
    }
    selectValue(option: OptionComponent) {
       

        if (!this.disabled() && !option.disabled()) {
            if (this.allowMultiple()) {
                if (!this.value()?.includes(option.value())) {
                    this.value.set([...(this.value() ?? []), option.value()]);
                } else {
                    this.value.set(
                        (this.value() || []).filter(
                            (e: any) => e !== option.value()
                        )
                    );
                }
            } else if (this.value() !== option.value()) {
                this.value.set(option.value());
            }
            this.onChange(this.value());
            this.onTouched();
            if (!this.allowMultiple()) {
                this.dropdownReference()?.close();
            }
        }
       
    }
    clearValue(e: Event) {
        e.preventDefault();
        e.stopPropagation();
        if (this.disabled()) {
            return;
        }
        if (this.allowMultiple()) {
            this.value.set([]);
        } else {
            this.value.set(undefined);
        }
        this.onChange(this.value());
        this.onTouched();
    }
    isValueSelected(option: OptionComponent) {
        if (this.allowMultiple()) {
            return this.value()?.includes(option.value());
        } else {
            return this.value() === option.value();
        }
    }
    // #endregion
    // #region Dropdown
   
   
    dropdownReference = signal<DialogRef | undefined>(undefined);
    dropdownOpen = computed(() => this.dropdownReference() !== undefined);

   
    openDropdown() {
        if (this.disabled()) {
            return;
        }
        this.highlightedOption.set(undefined);
        const elRect = this.elRef.nativeElement.getBoundingClientRect();
        const ref = this.dialogService.openTemplateDialog(
            this.dropdownTemplate()!,
            {
                top: elRect.bottom + 'px',
                left: elRect.left + 'px',
                width: elRect.width + 'px',
                closeOnEscape: true,
                closeOnBackdropClick: true,
            }
        , null, this.elementRef.nativeElement);
        // if the dialog element height is smaller than the dropdown container height, we need to adjust the position because we hit the bottom of the page
        setTimeout(() => {
            const dropdownHeight = document.getElementById(this.dropdownId)!.offsetHeight; // the native height of the dropdown
            if (ref.dialogElement.offsetHeight < dropdownHeight && elRect.top - dropdownHeight > 0) {
                ref.reposition(args => {
                    args.left = elRect.left + 'px';
                    args.top = elRect.top - dropdownHeight + 'px';
                });
            }
        }, 10);
       
        this.registerOptionKeyNavigation();
        ref.afterClosed$.subscribe(() => {
            this.unregisterOptionKeyNavigation();
            if (this.dropdownReference() === ref) {
                this.dropdownReference.set(undefined);
            }
        });
        this.dropdownReference.set(ref);
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
            const ref = this.dropdownReference();
            // if dropdown is not open
            if (!ref) {
                this.openDropdown();
            } else {
                // if dropdown is open
                // if an option is highlighted, select it
                if (this.highlightedOption()) {
                    this.selectValue(this.highlightedOption()!);
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
            const open = this.dropdownOpen();
            if (this.allowMultiple() && !open) {
                return;
            }

            let currentIndex = -1;
            if (open) {
                // find already highlighted option
                if (this.highlightedOption()) {
                    currentIndex = this.options().findIndex(
                        (o) =>
                            o.value() === this.highlightedOption()!.value()
                    );
                }
            } else {
                // find already selected option
                currentIndex = this.options().findIndex(
                     // we can be sure that at this point, this is a single select dropdown, so this.value() can be safely used
                    (o) => o.value() === this.value());
            }
            let nextIndex: number;
            // find the next index to highlight/select
            if (e.key === 'ArrowDown') {
                if (currentIndex === -1) {
                    // find the first non disabled option
                    nextIndex = this.options().findIndex(
                        (o) => !o.disabled()
                    );
                } else {
                    // find the next option that is not disabled
                    nextIndex = this.options().findIndex(
                        (o, i) => i > currentIndex && !o.disabled()
                    );
                    // if no option is found, find the next option that is not disabled before the current item
                    if (nextIndex === -1) {
                        nextIndex = this.options().findIndex(
                            (o, i) => i < currentIndex && !o.disabled()
                        );
                    }
                }
            } else if (e.key === 'ArrowUp') {
                if (currentIndex === -1) {
                    // find the last non disabled option
                    nextIndex = this.options()
                        .slice()
                        .reverse()
                        .findIndex((o) => !o.disabled());
                    if (nextIndex !== -1) {
                        nextIndex =
                            this.options().length - nextIndex - 1;
                    }
                } else {
                    const flippedCurrentIndex =
                        this.options().length - currentIndex - 1;
                    // find the next option that is not disabled
                    nextIndex = [...this.options()]
                        .reverse()
                        .findIndex(
                            (o, i) =>
                                i > flippedCurrentIndex && !o.disabled()
                        );
                    // if no option is found, find the next option that is not disabled before the current item
                    if (nextIndex === -1) {
                        nextIndex = [...this.options()]
                            .reverse()
                            .findIndex(
                                (o, i) =>
                                    i < flippedCurrentIndex &&
                                    !o.disabled()
                            );
                    }
                    if (nextIndex !== -1) {
                        nextIndex =
                            this.options().length - nextIndex - 1;
                    }
                }
            } else {
                nextIndex = -1;
            }

            if (nextIndex !== -1) {
                if (open) {
                    this.highlightedOption.set(this.options()[nextIndex]);
                    setTimeout(() => document.querySelector(`#${this.dropdownId} .option-wrapper.highlight`)?.scrollIntoView({
                        block: 'nearest',
                    }), 10);
                } else {
                    this.selectValue(this.options()[nextIndex]);
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
    checkFocus(event: FocusEvent) {
        setTimeout(() => {
            const dropdownContainer = document.getElementById(this.dropdownId);

            if (
                !this.elementRef.nativeElement.contains(
                    document.activeElement
                ) && 
                !dropdownContainer?.contains(
                    document.activeElement
                )
            ) {
                const ref = this.dropdownReference();
                if (ref) {
                    ref.close();
                }
            }
        }, 100);
    }

    // #endregion

    generateId(length: number = 16): string {
        const characters =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let randomName = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            randomName += characters.charAt(randomIndex);
        }

        return `${randomName}`;
    }
}
