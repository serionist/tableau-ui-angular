import {
    AfterContentInit,
    Component,
    contentChildren,
    ElementRef,
    forwardRef,
    inject,
    model,
    OnInit,
    output,
    signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { OptionComponent } from '../common/option';
import { SnackService } from '../snack/snack.service';

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
        "tabindex": "0",
        "(click)": "openDropdown()",
        "(blur)": "dropdownOpen.set(false)"
    }
})
export class SelectComponent
    implements ControlValueAccessor, OnInit, AfterContentInit
{
    snackService = inject(SnackService);
    disabled = signal(false);
    placeholder = model<string>();
    value = model<any | any[]>(undefined);
    allowMultiple = model<boolean>(false);
    // this will select the option with 'undefined' or 'null' value.
    // if no option exists with those values, the first option will be selected
    allowClear = model<boolean>(false);

    multipleSelectionMaxItemsListed = model<number>(2);
    multipleSelectionNumberSelectedTemplate = model<string>(
        '{number} items selected'
    );

    // valueChanges = output<any | any[]>();

    options = contentChildren<OptionComponent>(OptionComponent);


    elRef = inject(ElementRef);

    ngOnInit(): void {
        console.log('select component inited');
    }

    ngAfterContentInit(): void {
        console.log('options', this.options());
    }

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

    selectValue(option: OptionComponent) {
        if (!this.disabled() && !option.disabled()) {
            if (this.allowMultiple()) {
                if (this.value()?.includes(option.value())) {
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
            // this.valueChanges.emit(this.value());
            this.onTouched();
        }
    }

    onKeyDown(e: KeyboardEvent, option: OptionComponent) {
        if (e.key === 'Enter' || e.key === ' ') {
            this.selectValue(option);
            e.preventDefault();
        }
    }


    dropdownOpen = signal(false);
    dropdownTop = signal(0);
    dropdownLeft = signal(0);
    dropdownWidth = signal(0);

    openDropdown() {
        const elRect = this.elRef.nativeElement.getBoundingClientRect();
        console.log(elRect);
        this.dropdownTop.set(elRect.bottom);
        this.dropdownLeft.set(elRect.left);
        this.dropdownWidth.set(elRect.width);

        this.dropdownOpen.set(true);

        console.log('open');
    }
}
