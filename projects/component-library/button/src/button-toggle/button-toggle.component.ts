import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, contentChildren, effect, HostListener, input, model, output } from '@angular/core';
import type { IOptionLineContext } from 'tableau-ui-angular/common';
import { OptionComponent } from 'tableau-ui-angular/common';
import { TooltipDirective } from 'tableau-ui-angular/tooltip';
import type { Primitive } from 'tableau-ui-angular/types';

@Component({
    selector: 'tab-button-toggle',
    standalone: false,
    templateUrl: './button-toggle.component.html',
    styleUrl: './button-toggle.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[class.disabled]': '$disabled()',
        '[attr.disabled]': '$disabled() ? true : null',
        '[tabindex]': '$disabled() ? -1: 0',
    },
})
export class ButtonToggleComponent {
    /**
     * Disables the button toggle component.
     * This will prevent any interaction with the component
     * @default false
     */
    readonly $disabled = input(false, {
        alias: 'disabled',
    });
    /**
     * The value of the button toggle component.
     * This is the value that will be emitted when an option is selected.
     * If no value is selected, it will be undefined.
     * @default undefined
     */
    readonly $selectedValue = model<Primitive>(undefined, {
        alias: 'selectedValue',
    });

    protected readonly $options = contentChildren(OptionComponent);

    readonly selectedValueChange = effect(() => {
        const val = this.$selectedValue();
        const option = this.$options().find((opt) => opt.$value() === val);
        if (!option || this.$disabled() || option.$disabled()) {
            this.$selectedValue.set(undefined);
        }
    });

    protected readonly $optionRenderContext = computed<IOptionLineContext>(() => {
        return {
            renderIcon: true,
            renderText: false,
            renderAsDisabled: this.$disabled(),
        };
    });

    optionClicked(option: OptionComponent): void {
        if (this.$disabled() || option.$disabled()) {
            return;
        }
        this.$selectedValue.set(option.$value());
    }

    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'ArrowLeft') {
            const curIndex = this.$options().findIndex((opt) => opt.$value() === this.$selectedValue());
            if (curIndex === -1) {
                // find the last enabled option
                const lastEnabledOption = this.$options()
                    .slice()
                    .reverse()
                    .find((opt) => !opt.$disabled());
                if (lastEnabledOption) {
                    this.$selectedValue.set(lastEnabledOption.$value());
                }
            } else {
                // find the previous enabled option
                const prevEnabledOption = this.$options()
                    .slice(0, curIndex)
                    .reverse()
                    .find((opt) => !opt.$disabled());
                if (prevEnabledOption) {
                    this.$selectedValue.set(prevEnabledOption.$value());
                } else {
                    const prevEnabledFromEndOption = this.$options()
                        .slice(curIndex + 1)
                        .reverse()
                        .find((opt) => !opt.$disabled());
                    if (prevEnabledFromEndOption) {
                        this.$selectedValue.set(prevEnabledFromEndOption.$value());
                    }
                }
            }
        } else if (event.key === 'ArrowRight') {
            const curIndex = this.$options().findIndex((opt) => opt.$value() === this.$selectedValue());
            if (curIndex === -1) {
                // find the first enabled option
                const firstEnabledOption = this.$options().find((opt) => !opt.$disabled());
                if (firstEnabledOption) {
                    this.$selectedValue.set(firstEnabledOption.$value());
                }
            } else {
                // find the next enabled option
                const nextEnabledOption = this.$options()
                    .slice(curIndex + 1)
                    .find((opt) => !opt.$disabled());
                if (nextEnabledOption) {
                    this.$selectedValue.set(nextEnabledOption.$value());
                } else {
                    const nextEnabledFromStartOption = this.$options()
                        .slice(0, curIndex)
                        .find((opt) => !opt.$disabled());
                    if (nextEnabledFromStartOption) {
                        this.$selectedValue.set(nextEnabledFromStartOption.$value());
                    }
                }
            }
        }
    }
}
