/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { Component, ChangeDetectionStrategy, forwardRef, viewChild, ElementRef, AfterViewInit, OnDestroy, inject, input, model, signal, effect } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MonacoLoaderService } from './monaco-loader.service';
import type { editor } from 'monaco-editor';
@Component({
    selector: 'tab-monaco-editor',
    standalone: false,
    template: `
        <div #editorContainer class="editor-container"></div>
    `,
    styles: `
        :host {
            display: block;
            width: 100%;
            min-height: 100%;
        }
        .editor-container {
            width: 100%;
            height: 100%;
        }
    `,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MonacoEditorComponent),
            multi: true,
        },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonacoEditorComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
    private readonly $editorContainer = viewChild.required<ElementRef<HTMLElement>>('editorContainer');
    private readonly loader = inject(MonacoLoaderService);

    readonly options = input.required<editor.IEditorConstructionOptions>();
    readonly overrideServices = input<any>();
    private readonly value = signal<string>('');

    private readonly editorInstance?: any;

    private viewInit = false;
    ngAfterViewInit(): void {
        this.viewInit = true;
        const options = this.options();
        const overrideServices = this.overrideServices();
        void this.loadMonaco(options, overrideServices);
    }
    private readonly onParametersChange = effect(() => {
        const options = this.options();
        const overrideServices = this.overrideServices();
        if (!this.viewInit) {
            return;
        }
        void this.loadMonaco(options, overrideServices);
    });

    private async loadMonaco(options: any, overrideServices: any): Promise<void> {
        console.log('MonacoEditorComponent: loadMonaco called', options, overrideServices);
        // eslint-disable-next-line @angular-eslint/no-lifecycle-call
        this.ngOnDestroy();
        // const monaco = await this.loader.loadMonaco();

        // this.value.set(options.value ?? '');
        // this.editorInstance = monaco.editor.create(this.$editorContainer().nativeElement, options, overrideServices);
    }

    // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
    ngOnDestroy(): void {
        // this.editorInstance?.dispose();
    }

    writeValue(obj: string): void {
        throw new Error('Method not implemented.');
    }
    registerOnChange(fn: (v: string) => void): void {
        throw new Error('Method not implemented.');
    }
    registerOnTouched(fn: () => void): void {
        throw new Error('Method not implemented.');
    }
    setDisabledState?(isDisabled: boolean): void {
        throw new Error('Method not implemented.');
    }
}
