import type { WritableSignal } from '@angular/core';
import { AfterViewInit, ChangeDetectionStrategy, Component, computed, contentChildren, ElementRef, forwardRef, inject, model, OnDestroy, signal } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { IOptionGridContext } from 'tableau-ui-angular/common';
import { OptionComponent } from 'tableau-ui-angular/common';
import type { Primitive } from 'tableau-ui-angular/types';
import { IsValueSelectedPipe } from './pipes/is-value-selected.pipe';
import { CommonModule } from '@angular/common';
import { IconComponent } from 'tableau-ui-angular/icon';
export type ListValue = Exclude<Primitive, undefined> | Exclude<Primitive, undefined>[] | undefined;
@Component({
    selector: 'tab-list',
    imports: [IsValueSelectedPipe, CommonModule, IconComponent],
    standalone: true,
    templateUrl: './list.component.html',
    styleUrl: './list.component.scss',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ListComponent),
            multi: true,
        },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'tab-input',
        '[class.silent-focus]': '$focusMode() === "silent"',
        '[tabindex]': '$disabled() || $focusMode() === "none" ? -1 : 0',
        '(keydown)': 'onKeyDown($event)',
        '(blur)': 'onBlur()',
        '(focus)': 'onFocus()',
        '(mouseleave)': 'onMouseOut()',
    },
})
export class ListComponent implements ControlValueAccessor {
    protected readonly $options = contentChildren<OptionComponent>(OptionComponent);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    // #region Inputs

    /**
     * Sets the focusability of the list
     * @remarks
     * - 'strong' - The list can be focused and navigated using the keyboard. Focus indicators are shown and are strong (primary color).
     * - 'silent' - The list can be focused and navigated using the keyboard. Focus indicators are shown, but are subtle .
     * - 'none' - The list cannot be focused or navigated using the keyboard.
     * @default 'full'
     */
    readonly $focusMode = model<'none' | 'silent' | 'strong'>('strong', {
        alias: 'focusMode',
    });
    /**
     * Whether the list is disabled
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
     * The currently selected value.
     * @remarks
     * If allowMultiple is true, this should be an array of values.
     * If allowMultiple is false, this should be a single value.
     */
    readonly $value = model<ListValue>(undefined, {
        alias: 'value',
    });
    /**
     * The location of the check icon in dropdown option if an option is selected
     * @default 'none'
     */
    readonly $selectedCheckIconLocation = model<'left' | 'none' | 'right'>('none', {
        alias: 'selectedCheckIconLocation',
    });
    /**
     * Highlight the selected item(s) with a primary back color
     * @default true
     */
    readonly $selectedItemHighlight = model<boolean>(true, {
        alias: 'selectedItemHighlight',
    });
    /**
     * Whether multiple values can be selected
     * @default false
     */
    readonly $allowMultiple = model<boolean>(false, {
        alias: 'allowMultiple',
    });
    /**
     * The template context to use for the dropdown options
     * @remarks
     * Use this to display the 'icon', 'text', and 'hint' properties of the options conditionally
     */
    readonly $itemTemplateContext = model<IOptionGridContext>(
        {
            renderIcon: true,
            renderText: true,
            renderHint: true,
        },
        {
            alias: 'itemTemplateContext',
        },
    );

    // #endregion

    protected readonly $itemTemplateActualContext = computed(() => {
        return {
            renderIcon: this.$itemTemplateContext().renderIcon,
            renderText: this.$itemTemplateContext().renderText,
            renderHint: this.$itemTemplateContext().renderHint,
            renderAsDisabled: this.$itemTemplateContext().renderAsDisabled ?? this.$disabled(),
        };
    });

    // #region ControlValueAccessor
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onChange = (value: ListValue) => {};
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onTouched = () => {};
    writeValue(value: ListValue): void {
        this.$value.set(value);
    }
    registerOnChange(fn: (value: ListValue) => void): void {
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
            if (this.elementRef.nativeElement.tabIndex !== -1) {
                this.elementRef.nativeElement.focus();
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
    // #region Focus management
    protected readonly $focused = signal(false);
    onFocus() {
        this.$focused.set(true);
    }
    onBlur() {
        this.$focused.set(false);
        this.$highlightedOption.set(undefined);
    }
    onMouseOut() {
        this.$highlightedOption.set(undefined);
    }

    /**
     *
     *
     * @param e Handles KeyDown event for:
     * - host element
     * - global keydown event when dropdown is open
     * @returns
     */
    onKeyDown(e: KeyboardEvent) {
        if (e.key === 'Enter' || e.key === ' ') {
            if (this.$highlightedOption()) {
                this.selectValue(this.$highlightedOption()!);
            }
            e.preventDefault();
            e.stopPropagation();
        }
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            // - we find the currently HIGHLIGHTED option
            // - we find the next option to highlight
            // - if no option is found, we highlight the first/last option

            let currentIndex: number;
            let nextIndex: number = -1;
            if (this.$highlightedOption()) {
                currentIndex = this.$options().findIndex((o) => o.$value() === this.$highlightedOption()!.$value());
            } else {
                // find already selected option
                const value = this.$value();
                let val: Primitive;

                if (e.key === 'ArrowDown') {
                    // find the last selected option
                    if (this.$allowMultiple()) {
                        if (value != null && Array.isArray(value) && value.length > 0) {
                            val = value[value.length - 1];
                        }
                    } else {
                        if (value !== undefined && !Array.isArray(value)) {
                            val = value;
                        }
                    }
                } else {
                    // find the first selected option
                    if (this.$allowMultiple()) {
                        if (value != null && Array.isArray(value) && value.length > 0) {
                            val = value[0];
                        }
                    } else {
                        if (value !== undefined && !Array.isArray(value)) {
                            val = value;
                        }
                    }
                }
                nextIndex = currentIndex = this.$options().findIndex((o) => o.$value() === val);
            }

            if (nextIndex === -1) {
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
                }
            }
            if (nextIndex !== -1) {
                this.$highlightedOption.set(this.$options()[nextIndex]);
                setTimeout(
                    () =>
                        this.elementRef.nativeElement.querySelector(`.option-wrapper.highlight`)?.scrollIntoView({
                            block: 'nearest',
                        }),
                    10,
                );
            }

            e.preventDefault();
            e.stopPropagation();
        }
    }
}
