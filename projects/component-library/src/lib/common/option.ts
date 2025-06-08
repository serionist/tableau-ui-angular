import { CommonModule } from '@angular/common';
import type { InputSignal, Signal, TemplateRef} from '@angular/core';
import { ChangeDetectionStrategy, Component, computed, ContentChild, ElementRef, inject, input, signal, viewChild, ViewChild, ViewContainerRef } from '@angular/core';
import { HintComponent } from './hint';
import { IconComponent } from '../icon/icon.component';
import type { Primitive } from './types/primitive';

@Component({
    selector: 'tab-option',
    standalone: false,
    templateUrl: './option.html',
    styleUrl: './option.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionComponent {
    readonly elementRef = inject(ElementRef);
    readonly $value = input.required<Exclude<Primitive, undefined>>({
        alias: 'value',
    });
    readonly $disabled = input<boolean>(false, {
        alias: 'disabled',
    });
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    readonly $text: InputSignal<string | TemplateRef<unknown> | undefined> = input<string | TemplateRef<unknown>>(undefined, {
        alias: 'text',
    });
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    readonly $hint: InputSignal<string | TemplateRef<unknown> | undefined> = input<string | TemplateRef<unknown>>(undefined, {
        alias: 'hint',
    });
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    readonly $icon: InputSignal<string | TemplateRef<unknown> | undefined> = input<string | TemplateRef<unknown>>(undefined, {
        alias: 'icon',
    });
    readonly $template = viewChild.required<TemplateRef<IOptionGridContext>>('templateRef');
    readonly $lineTemplate = viewChild.required<TemplateRef<IOptionLineContext>>('lineTemplateRef');

    protected readonly $iconType = computed(() => {
        if (!this.$icon()) {
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
        if (!this.$text()) {
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
        if (!this.$hint()) {
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
