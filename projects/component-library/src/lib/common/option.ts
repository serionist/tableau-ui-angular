import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    ContentChild,
    ElementRef,
    input,
    InputSignal,
    Signal,
    signal,
    TemplateRef,
    viewChild,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { HintComponent } from './hint';
import { IconComponent } from '../icon/icon.component';

@Component({
    selector: 'tab-option',
    templateUrl: './option.html',
    styleUrls: ['./option.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class OptionComponent {
    readonly value = input.required<any>();
    readonly disabled = input<boolean>(false);
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    readonly text: InputSignal<string | TemplateRef<any> | undefined> = input<string | TemplateRef<any>>();
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    readonly hint: InputSignal<string | TemplateRef<any> | undefined> = input<string | TemplateRef<any>>();
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    readonly icon: InputSignal<string | TemplateRef<any> | undefined> = input<string | TemplateRef<any>>();
    readonly template = viewChild.required<TemplateRef<IOptionGridContext>>('templateRef');
    readonly lineTemplate = viewChild.required<TemplateRef<IOptionLineContext>>('lineTemplateRef');
  

    protected iconType = computed(() => {
        if (!this.icon()) {
            return 'none';
        } else if (typeof this.icon() === 'string') {
            return 'string';
        } else {
            return 'template';
        }
    });
    protected iconString = computed(() => {
        return this.iconType() === 'string' ? (this.icon() as string) : '';
    });
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    protected iconTemplate: Signal<TemplateRef<any> | null> = computed(() => {
        return this.iconType() === 'template'
            ? (this.icon() as TemplateRef<any>)
            : null;
    });
    protected textType = computed(() => {
        if (!this.text()) {
            return 'none';
        } else if (typeof this.text() === 'string') {
            return 'string';
        } else {
            return 'template';
        }
    });
    protected textString = computed(() => {
        return this.textType() === 'string' ? (this.text() as string) : '';
    });
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    protected textTemplate: Signal<TemplateRef<any> | null> = computed(() => {
        return this.textType() === 'template'
            ? (this.text() as TemplateRef<any>)
            : null;
    });
    protected hintType = computed(() => {
        if (!this.hint()) {
            return 'none';
        } else if (typeof this.hint() === 'string') {
            return 'string';
        } else {
            return 'template';
        }
    });
    protected hintString = computed(() => {
        return this.hintType() === 'string' ? (this.hint() as string) : '';
    });
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    protected hintTemplate: Signal<TemplateRef<any> | null> = computed(() => {
        return this.hintType() === 'template'
            ? (this.hint() as TemplateRef<any>)
            : null;
    });

    constructor(
        public elementRef: ElementRef,
        private viewContainerRef: ViewContainerRef
    ) {}
}
export interface IOptionLineContext {
    renderIcon: boolean;
    renderText: boolean;
    renderAsDisabled?: boolean;
}
export interface IOptionGridContext extends IOptionLineContext{
    renderHint: boolean;
}
