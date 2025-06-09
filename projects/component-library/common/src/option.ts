import type { InputSignal, Signal, TemplateRef } from '@angular/core';
import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, viewChild } from '@angular/core';
import type { Primitive } from 'tableau-ui-angular/types';

@Component({
    selector: 'tab-option',
    standalone: false,
    templateUrl: './option.html',
    styleUrl: './option.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionComponent {
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    readonly $value = input.required<Exclude<Primitive, undefined>>({
        alias: 'value',
    });
    readonly $disabled = input<boolean>(false, {
        alias: 'disabled',
    });
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    readonly $text: InputSignal<TemplateRef<unknown> | string | undefined> = input<TemplateRef<unknown> | string>(undefined, {
        alias: 'text',
    });
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    readonly $hint: InputSignal<TemplateRef<unknown> | string | undefined> = input<TemplateRef<unknown> | string>(undefined, {
        alias: 'hint',
    });
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    readonly $icon: InputSignal<TemplateRef<unknown> | string | undefined> = input<TemplateRef<unknown> | string>(undefined, {
        alias: 'icon',
    });
    readonly $template = viewChild.required<TemplateRef<IOptionGridContext>>('templateRef');
    readonly $lineTemplate = viewChild.required<TemplateRef<IOptionLineContext>>('lineTemplateRef');

    protected readonly $iconType = computed(() => {
        if (this.$icon() === undefined) {
            return 'none';
        } else if (typeof this.$icon() === 'string') {
            return 'string';
        } else {
            return 'template';
        }
    });
    protected readonly $iconString = computed(() => {
        return this.$iconType() === 'string' ? (this.$icon() as string) : '';
    });
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    protected readonly $iconTemplate: Signal<TemplateRef<unknown> | null> = computed(() => {
        return this.$iconType() === 'template' ? (this.$icon() as TemplateRef<unknown>) : null;
    });
    protected readonly $textType = computed(() => {
        if (this.$text() === undefined) {
            return 'none';
        } else if (typeof this.$text() === 'string') {
            return 'string';
        } else {
            return 'template';
        }
    });
    protected readonly $textString = computed(() => {
        return this.$textType() === 'string' ? (this.$text() as string) : '';
    });
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    protected readonly $textTemplate: Signal<TemplateRef<unknown> | null> = computed(() => {
        return this.$textType() === 'template' ? (this.$text() as TemplateRef<unknown>) : null;
    });
    protected readonly $hintType = computed(() => {
        if (this.$hint() === undefined) {
            return 'none';
        } else if (typeof this.$hint() === 'string') {
            return 'string';
        } else {
            return 'template';
        }
    });
    protected readonly $hintString = computed(() => {
        return this.$hintType() === 'string' ? (this.$hint() as string) : '';
    });
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    protected readonly $hintTemplate: Signal<TemplateRef<unknown> | null> = computed(() => {
        return this.$hintType() === 'template' ? (this.$hint() as TemplateRef<unknown>) : null;
    });
}
export interface IOptionLineContext {
    renderIcon: boolean;
    renderText: boolean;
    renderAsDisabled?: boolean;
}
export interface IOptionGridContext extends IOptionLineContext {
    renderHint: boolean;
}
