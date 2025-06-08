import { NgIf } from '@angular/common';
import type { Signal } from '@angular/core';
import { ChangeDetectionStrategy, Component, ContentChild, contentChild, ElementRef, forwardRef, Input, input, model, output, signal, ViewChild } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { CheckboxControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { HintComponent } from '../common/hint';
import { ErrorComponent } from '../common/error';

@Component({
    selector: 'tab-checkbox',
    standalone: false,
    templateUrl: './checkbox.component.html',
    styleUrl: 'checkbox.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'checkbox',
        '[class.disabled]': '$disabled()',
        '[class.checked]': '$value()',
        '(click)': 'toggleValue()',
    },
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CheckboxComponent),
            multi: true,
        },
    ],
})
export class CheckboxComponent implements ControlValueAccessor {
    readonly $disabled = model(false, {
        alias: 'disabled',
    });
    readonly $value = model(false, {
        alias: 'value',
    });
    readonly valueChanges = output<boolean>();

    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    protected readonly $hintElement: Signal<HintComponent | undefined> = contentChild(HintComponent);
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    protected readonly $errorElement: Signal<ErrorComponent | undefined> = contentChild(ErrorComponent);

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onChange = (value: boolean) => {};
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onTouched = () => {};
    writeValue(value: boolean): void {
        this.$value.set(value);
    }
    registerOnChange(fn: (value: boolean) => void): void {
        this.onChange = fn;
    }
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }
    setDisabledState(isDisabled: boolean): void {
        this.$disabled.set(isDisabled);
    }
    toggleValue() {
        if (!this.$disabled()) {
            const newVal = !this.$value();
            this.$value.set(newVal);
            this.onChange(this.$value());
            this.valueChanges.emit(newVal);
            this.onTouched();
        }
    }

    onKeyDown(e: KeyboardEvent) {
        switch (e.key) {
            case 'Enter':
            case ' ':
                this.toggleValue();
                e.preventDefault();
                break;
            default:
                return;
        }
    }
}
