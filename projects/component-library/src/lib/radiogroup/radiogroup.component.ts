import type { Signal } from '@angular/core';
import { ChangeDetectionStrategy, Component, contentChild, ContentChild, contentChildren, ContentChildren, forwardRef, model, OnInit, output, signal } from '@angular/core';
import type { IOptionGridContext } from '../common/option';
import { OptionComponent } from '../common/option';
import { HintComponent } from '../common/hint';
import { ErrorComponent } from '../common/error';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import type { ControlValueAccessor } from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { generateRandomString } from '../utils';
import type { Primitive } from '../common/types/primitive';

@Component({
    selector: 'tab-radiogroup',
    standalone: false,
    templateUrl: './radiogroup.component.html',
    styleUrl: './radiogroup.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => RadiogroupComponent),
            multi: true,
        },
    ],
})
export class RadiogroupComponent implements ControlValueAccessor {
    readonly $disabled = signal(false);
    readonly $value = model<Primitive>(undefined, {
        alias: 'value',
    });
    readonly valueChanges = output<Primitive>();
    readonly name = this.generateRandomGroupName();
    readonly $options = contentChildren(OptionComponent);
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    readonly $errorElement: Signal<ErrorComponent | undefined> = contentChild(ErrorComponent);

    // eslint-disable-next-line  @typescript-eslint/no-empty-function
    onChange = (value: Primitive) => {};
    // eslint-disable-next-line  @typescript-eslint/no-empty-function
    onTouched = () => {};

    writeValue(value: Primitive): void {
        this.$value.set(value);
    }

    registerOnChange(fn: (value: Primitive) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.$disabled.set(isDisabled);
    }

    selectValue(option: OptionComponent) {
        if (!this.$disabled() && !option.$disabled()) {
            if (this.$value() !== option.$value()) {
                this.$value.set(option.$value());
                this.onChange(this.$value());
                this.valueChanges.emit(this.$value());
            }
            this.onTouched();
        }
    }

    onKeyDown(e: KeyboardEvent, option: OptionComponent) {
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
