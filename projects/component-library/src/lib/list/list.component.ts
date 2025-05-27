import {
    AfterViewInit,
    Component,
    computed,
    contentChildren,
    ElementRef,
    forwardRef,
    inject,
    model,
    OnDestroy,
    signal,
    WritableSignal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IOptionGridContext, OptionComponent } from '../common/option';

@Component({
    selector: 'tab-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ListComponent),
            multi: true,
        },
    ],
    host: {
        class: 'tab-input',
        '[class.silent-focus]': 'focusMode() === "silent"',
        '[tabindex]': 'disabled() || focusMode() === "none" ? -1 : 0',
        '(keydown)': 'onKeyDown($event)',
        '(blur)': 'onBlur()',
        '(focus)': 'onFocus()',
        '(mouseleave)': 'onMouseOut()',
    },
    standalone: false
})
export class ListComponent
    implements ControlValueAccessor
{
    options = contentChildren<OptionComponent>(OptionComponent);
    elementRef = inject(ElementRef);
    // #region Inputs

    /**
     * Sets the focusability of the list
     * @remarks
     * - 'strong' - The list can be focused and navigated using the keyboard. Focus indicators are shown and are strong (primary color).
     * - 'silent' - The list can be focused and navigated using the keyboard. Focus indicators are shown, but are subtle .
     * - 'none' - The list cannot be focused or navigated using the keyboard.
     * @default 'full'
     */
    focusMode = model<'strong' | 'silent' | 'none'>('strong');
    /**
     * Whether the list is disabled
     * @remarks
     * Set this using the FormControl if you are using reactive forms.
     * Only set this manually if you are not using reactive forms.
     *
     * @default false
     */
    disabled = model(false);
    /**
     * The currently selected value.
     * @remarks
     * If allowMultiple is true, this should be an array of values.
     * If allowMultiple is false, this should be a single value.
     */
    value = model<any | any[]>(undefined);
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
     * The template context to use for the dropdown options
     * @remarks
     * Use this to display the 'icon', 'text', and 'hint' properties of the options conditionally
     */
    itemTemplateContext = model<IOptionGridContext>({
        renderIcon: true,
        renderText: true,
        renderHint: true,
    });

    // #endregion

    itemTemplateActualContext = computed(() => {
        return {
            renderIcon: this.itemTemplateContext().renderIcon,
            renderText: this.itemTemplateContext().renderText,
            renderHint: this.itemTemplateContext().renderHint,
            renderAsDisabled: this.itemTemplateContext().renderAsDisabled || this.disabled(),
        };
    })

    // #region ControlValueAccessor
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onChange = (value: any) => {};
    // eslint-disable-next-line @typescript-eslint/no-empty-function
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
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    highlightedOption: WritableSignal<OptionComponent | undefined> = signal<OptionComponent | undefined>(undefined);
    optionMouseDown(event: MouseEvent) {
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
            if (this.elementRef.nativeElement.tabIndex !== -1) {
                this.elementRef.nativeElement.focus();
            }
            // if (!this.allowMultiple()) {
            //     this.dropdownReference()?.close();
            // }
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
    // #region Focus management
    focused = signal(false);
    onFocus() {
        this.focused.set(true);
    }
    onBlur() {
        this.focused.set(false);
        this.highlightedOption.set(undefined);
    }
    onMouseOut() {
        this.highlightedOption.set(undefined);
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
            if (this.highlightedOption()) {
                this.selectValue(this.highlightedOption()!);
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
            if (this.highlightedOption()) {
                currentIndex = this.options().findIndex(
                    (o) => o.value() === this.highlightedOption()!.value()
                );
            } else {
                // find already selected option
                let val: any;
                if (e.key === 'ArrowDown') {
                    val = this.allowMultiple() ? this.value()?.[this.value().length - 1] : this.value(); // find the last selected option
                    
                } else {
                    val = this.allowMultiple() ? this.value()?.[0] : this.value() // find the first selected option
                }
                nextIndex = currentIndex = this.options().findIndex((o) => o.value() === val); 
            }

            if (nextIndex === -1) {
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
                            nextIndex = this.options().length - nextIndex - 1;
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
                                        i < flippedCurrentIndex && !o.disabled()
                                );
                        }
                        if (nextIndex !== -1) {
                            nextIndex = this.options().length - nextIndex - 1;
                        }
                    }
                }
            }
            if (nextIndex !== -1) {
                this.highlightedOption.set(this.options()[nextIndex]);
                setTimeout(
                    () =>
                        this.elementRef.nativeElement
                            .querySelector(`.option-wrapper.highlight`)
                            ?.scrollIntoView({
                                block: 'nearest',
                            }),
                    10
                );
            }

            e.preventDefault();
            e.stopPropagation();
        }
    }
}
