import type { InputSignal } from '@angular/core';
import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
@Component({
    selector: 'tab-icon',
    standalone: false,
    template: `
        {{ $value() }}
    `,
    styleUrl: './icon.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        role: 'img',
        class: 'tab-icon',
        '[class.error]': "$color() === 'error'",
        '[class.primary]': "$color() === 'primary'",
        '[class.success]': "$color() === 'success'",
        '[style.font-family]': '$type()',
        '[style.font-variation-settings]': '$fontVariationSettings()',
    },
})
export class IconComponent {
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    readonly $value: InputSignal<string | undefined> = input<string>(undefined, {
        alias: 'value',
    });
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    readonly $color: InputSignal<'error' | 'none' | 'primary' | 'success' | null | undefined> = input<'error' | 'none' | 'primary' | 'success' | null>(undefined, {
        alias: 'color',
    });

    readonly $type = input<'Material Symbols Outlined' | 'Material Symbols Rounded' | 'Material Symbols Sharp'>('Material Symbols Rounded', {
        alias: 'type',
    });
    readonly $fill = input<boolean>(false, {
        alias: 'fill',
    });
    readonly $weight = input<100 | 200 | 300 | 400 | 500 | 600 | 700>(400, {
        alias: 'weight',
    });
    readonly $grade = input<-25 | 0 | 200>(0, {
        alias: 'grade',
    });
    readonly $opticalSizePx = input<20 | 24 | 40 | 48>(24, {
        alias: 'opticalSizePx',
    });

    private readonly $fontVariationSettings = computed(() => {
        return `'FILL' ${this.$fill() ? 1 : 0}, 'wght' ${this.$weight()}, 'GRAD' ${this.$grade()}, 'opsz' ${this.$opticalSizePx()}`;
    });
}
