import type { Signal } from '@angular/core';
import { ChangeDetectionStrategy, Component, contentChild, contentChildren, forwardRef, model, signal } from '@angular/core';

import type { ControlValueAccessor } from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { IOptionGridContext } from 'tableau-ui-angular/common';
import { ErrorComponent, OptionComponent } from 'tableau-ui-angular/common';
import type { Primitive } from 'tableau-ui-angular/types';
import { generateRandomString } from 'tableau-ui-angular/utils';

@Component({
    selector: 'tab-radio-group',
    standalone: false,
    templateUrl: './radio-group.component.html',
    styleUrl: './radio-group.component.scss',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => RadioGroupComponent),
            multi: true,
        },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioGroupComponent<T extends Primitive> implements ControlValueAccessor {
    readonly $disabled = signal(false);
    readonly $value = model<T | undefined>(undefined, {
        alias: 'value',
    });
    readonly name = this.generateRandomGroupName();
    readonly $options = contentChildren<OptionComponent<T>>(OptionComponent<T>);
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    readonly $errorElement: Signal<ErrorComponent | undefined> = contentChild(ErrorComponent);

    // eslint-disable-next-line  @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    onChange = (value: T | undefined) => {};
    // eslint-disable-next-line  @typescript-eslint/no-empty-function
    onTouched = () => {};

    writeValue(value: T | undefined): void {
        this.$value.set(value);
    }

    registerOnChange(fn: (value: T | undefined) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.$disabled.set(isDisabled);
    }

    selectValue(option: OptionComponent<T>) {
        if (!this.$disabled() && !option.$disabled()) {
            if (this.$value() !== option.$value()) {
                this.$value.set(option.$value());
                this.onChange(this.$value());
            }
            this.onTouched();
        }
    }

    onKeyDown(e: KeyboardEvent, option: OptionComponent<T>) {
        if (e.key === 'Enter' || e.key === ' ') {
            this.selectValue(option);
            e.preventDefault();
        }
    }

    generateRandomGroupName(length: number = 8): string {
        return `group-${generateRandomString(length)}`;
    }

    optionTemplateContext: IOptionGridContext = {
        renderIcon: true,
        renderText: true,
        renderHint: true,
    };
}
