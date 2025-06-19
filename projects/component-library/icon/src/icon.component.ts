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
        '[class.error]': "$actualColor() === 'error'",
        '[class.primary]': "$actualColor() === 'primary'",
        '[class.success]': "$actualColor() === 'success'",
        '[style.font-family]': '$actualType()',
        '[style.font-variation-settings]': '$fontVariationSettings()',
        '[style.font-size]': '$actualFontSize()',
    },
})
export class IconComponent {
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    /**
     * The icon name to display.
     * This should be a valid Material Symbols icon name.
     * For example, 'home', 'settings', 'favorite', etc.
     */
    readonly $value = input<string>(undefined, {
        alias: 'value',
    });
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    /**
     * The color of the icon.
     * Can be 'error', 'none', 'primary', 'success', or null.
     * - 'error': Indicates an error state.
     * - 'none'/null/undefined: No color applied.
     * - 'primary': Indicates a primary action or state.
     * - 'success': Indicates a successful action or state.
     * @default undefined
     */
    readonly $color: InputSignal<'error' | 'none' | 'primary' | 'success' | null | undefined> = input<'error' | 'none' | 'primary' | 'success' | null>(undefined, {
        alias: 'color',
    });
    /**
     * The type of Material Symbols icon to use.
     * Can be 'Material Symbols Outlined', 'Material Symbols Rounded', or 'Material Symbols Sharp'.
     * - 'Material Symbols Outlined': Uses the outlined style of Material Symbols.
     * - 'Material Symbols Rounded': Uses the rounded style of Material Symbols.
     * - 'Material Symbols Sharp': Uses the sharp style of Material Symbols.
     * @default 'Material Symbols Rounded'
     */
    readonly $type = input<'Material Symbols Outlined' | 'Material Symbols Rounded' | 'Material Symbols Sharp'>('Material Symbols Rounded', {
        alias: 'type',
    });
    /**
     * Whether to fill the icon with color.
     * @default false
     */
    readonly $fill = input<boolean>(false, {
        alias: 'fill',
    });
    /**
     * The font size of the icon.
     * This should be a valid CSS font size value, such as '16px', '1rem', '2em', etc.
     * If not specified, the default font size will be used that is passed from outside.
     * @default undefined
     */
    readonly $fontSize = input<string>(undefined, {
        alias: 'fontSize',
    });
    /**
     * The weight of the icon.
     * Can be 100, 200, 300, 400, 500, 600, or 700.
     * @default 400
     */
    readonly $weight = input<100 | 200 | 300 | 400 | 500 | 600 | 700>(400, {
        alias: 'weight',
    });
    /**
     * The grade of the icon.
     * Can be -25, 0, or 200.
     * - -25: Indicates a lighter grade.
     * - 0: Indicates a normal grade.
     * - 200: Indicates a heavier grade.
     * @default 0
     */
    readonly $grade = input<-25 | 0 | 200>(0, {
        alias: 'grade',
    });
    /**
     * The optical size of the icon in pixels.
     * Can be 20, 24, 40, or 48.
     * - 20: Small optical size.
     * - 24: Default optical size.
     * - 40: Larger optical size.
     * - 48: Extra large optical size.
     * @default 24
     */
    readonly $opticalSizePx = input<20 | 24 | 40 | 48>(24, {
        alias: 'opticalSizePx',
    });

    /**
     * Used to pass all parameters as a single object except for value.
     * This is useful for passing multiple parameters at once.
     * @example
     * <tab-icon value="home" [params]="{ color: 'primary', type: 'Material Symbols Rounded', fill: true, weight: 500, grade: 0, opticalSizePx: 24 }"></tab-icon>
     * @default undefined
     */
    readonly $params = input<Partial<IconParams>>(undefined, {
        alias: 'params',
    });

    private readonly $actualColor = computed(() => {
        return this.$params()?.color ?? this.$color() ?? 'none';
    });
    private readonly $actualType = computed(() => {
        return this.$params()?.type ?? this.$type();
    });
    private readonly $actualFontSize = computed(() => {
        return this.$params()?.fontSize ?? this.$fontSize();
    });
    private readonly $actualFill = computed(() => {
        return this.$params()?.fill ?? this.$fill();
    });
    private readonly $actualWeight = computed(() => {
        return this.$params()?.weight ?? this.$weight();
    });
    private readonly $actualGrade = computed(() => {
        return this.$params()?.grade ?? this.$grade();
    });
    private readonly $actualOpticalSizePx = computed(() => {
        return this.$params()?.opticalSizePx ?? this.$opticalSizePx();
    });

    private readonly $fontVariationSettings = computed(() => {
        return `'FILL' ${this.$actualFill() ? 1 : 0}, 'wght' ${this.$actualWeight()}, 'GRAD' ${this.$actualGrade()}, 'opsz' ${this.$actualOpticalSizePx()}`;
    });
}
export interface IconParams {
    color?: 'error' | 'none' | 'primary' | 'success';
    type?: 'Material Symbols Outlined' | 'Material Symbols Rounded' | 'Material Symbols Sharp';
    fontSize?: string; // CSS font size value, e.g., '16px', '1rem', '2em'
    fill?: boolean;
    weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
    grade?: -25 | 0 | 200;
    opticalSizePx?: 20 | 24 | 40 | 48;
}
