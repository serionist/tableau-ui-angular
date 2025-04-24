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
    value = input.required<any>();
    disabled = input<boolean>(false);
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    text: InputSignal<string | TemplateRef<any> | undefined> = input<string | TemplateRef<any>>();
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    hint: InputSignal<string | TemplateRef<any> | undefined> = input<string | TemplateRef<any>>();
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    icon: InputSignal<string | TemplateRef<any> | undefined> = input<string | TemplateRef<any>>();
    template = viewChild.required<TemplateRef<IOptionGridContext>>('templateRef');
    lineTemplate = viewChild.required<TemplateRef<IOptionLineContext>>('lineTemplateRef');
  

    iconType = computed(() => {
        if (!this.icon()) {
            return 'none';
        } else if (typeof this.icon() === 'string') {
            return 'string';
        } else {
            return 'template';
        }
    });
    iconString = computed(() => {
        return this.iconType() === 'string' ? (this.icon() as string) : '';
    });
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    iconTemplate: Signal<TemplateRef<any> | null> = computed(() => {
        return this.iconType() === 'template'
            ? (this.icon() as TemplateRef<any>)
            : null;
    });
    textType = computed(() => {
        if (!this.text()) {
            return 'none';
        } else if (typeof this.text() === 'string') {
            return 'string';
        } else {
            return 'template';
        }
    });
    textString = computed(() => {
        return this.textType() === 'string' ? (this.text() as string) : '';
    });
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    textTemplate: Signal<TemplateRef<any> | null> = computed(() => {
        return this.textType() === 'template'
            ? (this.text() as TemplateRef<any>)
            : null;
    });
    hintType = computed(() => {
        if (!this.hint()) {
            return 'none';
        } else if (typeof this.hint() === 'string') {
            return 'string';
        } else {
            return 'template';
        }
    });
    hintString = computed(() => {
        return this.hintType() === 'string' ? (this.hint() as string) : '';
    });
    // nullable Signal type needs to be set explicitly -> ng-packagr strips nullability
    hintTemplate: Signal<TemplateRef<any> | null> = computed(() => {
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
