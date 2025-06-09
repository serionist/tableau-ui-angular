import type { ModelSignal } from '@angular/core';
import { ChangeDetectionStrategy, Component, Directive, effect, ElementRef, forwardRef, HostListener, inject, input, model, output, signal } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
    selector: 'input[type=date],input[type=datetime-local],input[type=datetime],input[date-picker]',
    standalone: false,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DatePickerDirective),
            multi: true,
        },
    ],
    host: {
        class: 'date-picker',
        '[attr.type]': '$type() === "datetime" ? "datetime-local" : "date"',
    },
})
export class DatePickerDirective implements ControlValueAccessor {
    private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef);

    // type can only be set once. Cannot change between date and datetime
    readonly $type = input.required<'date' | 'datetime'>({
        alias: 'type',
    });
    private originalType: 'date' | 'datetime' | undefined;
    private readonly typeChanged = effect(() => {
        this.originalType ??= this.$type();
        if (this.$type() !== this.originalType) {
            throw new Error('DatePickerDirective: type must be "date" or "datetime", can not be changed later');
        }
    });
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    readonly $value: ModelSignal<Date | undefined> = model<Date | undefined>(undefined, {
        alias: 'value',
    });
    readonly valueChange = output<Date | undefined>();

    @HostListener('input')
    onInput() {
        let val: Date | undefined = undefined;
        if (!this.el.nativeElement.value) {
            val = undefined;
        } else {
            const date = new Date(this.el.nativeElement.value);
            if (isNaN(date.getTime())) {
                val = undefined;
            } else {
                val = date;
            }
        }
        this.$value.set(val);
        this.valueChange.emit(val);
        this._onTouched();
        this._onChange(val);
    }
    @HostListener('focus')
    onFocus() {
        this._onTouched();
    }

    writeValue(obj: Date): void {
        if (obj instanceof Date && !isNaN(obj.getTime())) {
            if (this.$type() === 'datetime') {
                const year = obj.getFullYear();
                const month = (obj.getMonth() + 1).toString().padStart(2, '0');
                const day = obj.getDate().toString().padStart(2, '0');
                const hours = obj.getHours().toString().padStart(2, '0');
                const minutes = obj.getMinutes().toString().padStart(2, '0');
                this.el.nativeElement.value = `${year}-${month}-${day}T${hours}:${minutes}`;
            } else {
                const year = obj.getFullYear();
                const month = (obj.getMonth() + 1).toString().padStart(2, '0');
                const day = obj.getDate().toString().padStart(2, '0');
                this.el.nativeElement.value = `${year}-${month}-${day}`;
            }
        } else {
            this.el.nativeElement.value = '';
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private _onChange = (value: Date | undefined) => {};
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private _onTouched = () => {};
    registerOnChange(fn: (date: Date | undefined) => void): void {
        this._onChange = fn;
    }
    registerOnTouched(fn: () => void): void {
        this._onTouched = fn;
    }
    setDisabledState?(isDisabled: boolean): void {
        this.el.nativeElement.disabled = isDisabled;
    }
}
