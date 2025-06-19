import type { AfterViewInit, OnDestroy } from '@angular/core';
import { ElementRef } from '@angular/core';
import { ChangeDetectionStrategy, Component, effect, forwardRef, inject, input, model, output, untracked } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { ICodeEditor, MonacoConstructionOptions } from './types';
import type MonacoNamespace from 'monaco-editor';
import { ThemeService } from 'tableau-ui-angular/theme';
type Monaco = typeof MonacoNamespace;
declare let monaco: Monaco;

let monacoLoadPromise: Promise<void> | undefined = undefined;

@Component({
  selector: 'tab-monaco-editor',
  standalone: false,
  template: '',
  styles: `
    :host {
      display: block;
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
  private _editor: ICodeEditor | undefined;
  private readonly themeService = inject(ThemeService);

  // #region Inputs and Outputs
  /**
   * Sets the options for the monaco editor, such scrollbars, minimap, etc
   * @default {}
   */
  readonly $options = input<MonacoConstructionOptions>(
    {},
    {
      alias: 'options',
    },
  );
  /**
   * The URI of the current document.
   * This is used to identify the model in monaco.
   */
  readonly $uri = input.required<string>({
    alias: 'uri',
  });
  /**
   * The language of the current document.
   * This is used to set the language of the model in monaco.
   * For example, 'javascript', 'typescript', 'html', etc.
   */
  readonly $language = input.required<string>({
    alias: 'language',
  });

  /**
   * The value of the current document.
   * This can do two-way binding with the editor.
   */
  readonly $value = model<string>('', {
    alias: 'value',
  });

  /**
   * The theme of the monaco editor.
   * Can be 'auto', 'vs', 'vs-dark', 'hc-black', or 'hc-light'.
   * 'auto' will use the current library palette theme.
   * @default 'auto'
   */
  readonly $theme = input<'auto' | 'vs' | 'vs-dark' | 'hc-black' | 'hc-light'>('auto', {
    alias: 'theme',
  });

  /**
   * Only settable once.
   * Defines a function that is called when monaco is ready and before component init.
   * Use this to set language diagnostics, etc.
   */
  readonly $onMonacoLoad = input<(monaco: Monaco) => void>(undefined, {
    alias: 'onMonacoLoad',
  });

  /**
   * If true, the model will be disposed when the component is destroyed.
   * This is useful to avoid memory leaks when the editor is not used anymore.
   * @default true
   */
  readonly $disposeModelOnDestroy = input<boolean>(true, {
    alias: 'disposeModelOnDestroy',
  });

  /**
   * Output event that is emitted when the editor is loaded.
   */
  readonly editorLoaded = output<ICodeEditor>();

  // #endregion Inputs and Outputs
  readonly editorContainer = inject<ElementRef<HTMLElement>>(ElementRef);

  // #region Effects
  // When the option changes, re-initialize the entire editor
  readonly optionsChanged = effect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const options = this.$options(); // need this for the effect to trigger
    if (this._editor) {
      this._editor.dispose();
      this._editor = undefined;
      this.initEditor();
    }
  });
  // When the URI changes, update the editor to use the new URI if it's initialized
  readonly uriChanged = effect(() => {
    const uri = this.$uri();
    const language = untracked(() => this.$language());
    const value = untracked(() => this.$value());
    if (this._editor) {
      // update or create the model with the new URI
      const editorModel = this.updateOrCreateModel(monaco.Uri.parse(uri), language, value);
      this._editor.setModel(editorModel);
    }
  });
  // When the language changes, update the editor to use the new language if it's initialized
  readonly languageChanged = effect(() => {
    const language = this.$language();
    const uri = untracked(() => this.$uri());
    if (this._editor) {
      // update or create the model with the new language
      const editorModel = monaco.editor.getModel(monaco.Uri.parse(uri));
      if (!editorModel) {
        console.warn('Can not update language. Monaco editor model not found for URI:', uri);
      } else {
        monaco.editor.setModelLanguage(editorModel, language);
      }
      this._editor.setModel(editorModel);
    }
  });
  // When the value changes, update the editor to use the new value if it's initialized
  readonly valueChanged = effect(() => {
    const value = this.$value();
    const uri = untracked(() => this.$uri());
    if (this._editor) {
      // update or create the model with the new value
      const editorModel = monaco.editor.getModel(monaco.Uri.parse(uri));
      if (!editorModel) {
        console.warn('Can not update value. Monaco editor model not found for URI:', uri);
      } else {
        editorModel.setValue(value);
      }
    }
  });
  // When the theme changes, update the editor to use the new theme if it's initialized
  readonly themeChanged = effect(() => {
    const themeInput = this.$theme();
    const systemTheme = this.themeService.$appliedThemeMode();
    if (this._editor) {
      const theme = this.getMonacoTheme(themeInput, systemTheme);
      monaco.editor.setTheme(theme);
    }
  });

  // #endregion Effects
  ngAfterViewInit(): void {
    // if monaco already started loading, init the editor when it is loaded
    if (monacoLoadPromise) {
      void monacoLoadPromise.then(() => {
        this.initEditor();
      });
      return;
    }
    monacoLoadPromise = new Promise<void>(resolve => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      if (typeof (window as any).monaco === 'object') {
        this.initEditor();
        resolve();
        return;
      }
      const baseUrl = (document.head.getElementsByTagName('base').item(0)?.href ?? window.location.origin + '/') + 'monaco-edit/vs';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const onGotAmdLoader = (require?: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
        const usedRequire = require ?? (window as any).require;

        const requireConfig = { paths: { vs: baseUrl } };

        // Load monaco
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        usedRequire.config(requireConfig);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        usedRequire([`vs/editor/editor.main`], () => {
          this.initEditor();
          resolve();
        });
      };

      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      if (!(window as any).require) {
        const loaderScript: HTMLScriptElement = document.createElement('script');
        loaderScript.type = 'text/javascript';
        loaderScript.src = `${baseUrl}/loader.js`;
        loaderScript.addEventListener('load', () => {
          onGotAmdLoader();
        });
        document.body.appendChild(loaderScript);
        // Load AMD loader without over-riding node's require
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      } else if (!(window as any).require.config) {
        const src = `${baseUrl}/loader.js`;

        const loaderRequest = new XMLHttpRequest();
        loaderRequest.addEventListener('load', () => {
          const scriptElem = document.createElement('script');
          scriptElem.type = 'text/javascript';
          scriptElem.text = [
            // Monaco uses a custom amd loader that over-rides node's require.
            // Keep a reference to node's require so we can restore it after executing the amd loader file.
            'var nodeRequire = require;',
            loaderRequest.responseText.replace('"use strict";', ''),
            // Save Monaco's amd require and restore Node's require
            'var monacoAmdRequire = require;',
            'require = nodeRequire;',
            'require.nodeRequire = require;',
          ].join('\n');
          document.body.appendChild(scriptElem);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
          onGotAmdLoader((window as any).monacoAmdRequire);
        });
        loaderRequest.open('GET', src);
        loaderRequest.send();
      } else {
        onGotAmdLoader();
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onPropagateChange: (val: string) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onPropagateTouched: () => void = () => {};
  // #region ControlValueAccessor

  writeValue(val: string): void {
    this.$value.set(val);
  }
  registerOnChange(fn: (val: string) => void): void {
    this.onPropagateChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onPropagateTouched = fn;
  }
  // #endregion ControlValueAccessor

  private resizeObserver: ResizeObserver | undefined;
  protected initEditor() {
    this.destroyResizeObserver();
    const onLoad = this.$onMonacoLoad();
    if (onLoad) {
      onLoad(monaco);
    }

    // update or create the model
    const editorModel = this.updateOrCreateModel(monaco.Uri.parse(this.$uri()), this.$language(), this.$value());
    this._editor = monaco.editor.create(this.editorContainer.nativeElement, { ...this.$options(), model: editorModel });
    monaco.editor.setTheme(this.getMonacoTheme(this.$theme(), this.themeService.$appliedThemeMode()));
    // this._editor.setValue(this._value);

    this._editor.onDidChangeModelContent(() => {
      if (!this._editor) {
        return;
      }
      const value = this._editor.getValue() ?? '';
      this.$value.set(value);
      this.onPropagateChange(value);
    });

    this._editor.onDidBlurEditorText(() => {
      this.onPropagateTouched();
      if (this._editor) {
        this._editor.setSelection(new monaco.Selection(1, 1, 1, 1));
      }
    });

    this.resizeObserver = new ResizeObserver(() => {
      if (this._editor) {
        this._editor.layout();
      }
    });
    this.resizeObserver.observe(this.editorContainer.nativeElement);
    this.editorLoaded.emit(this._editor);
  }

  private updateOrCreateModel(uri: MonacoNamespace.Uri, language: string, value: string) {
    let editorModel = monaco.editor.getModel(uri);
    if (editorModel) {
      editorModel.setValue(value);
      if (editorModel.getLanguageId() !== language) {
        monaco.editor.setModelLanguage(editorModel, language);
      }
    } else {
      editorModel = monaco.editor.createModel(value, language, uri);
    }
    return editorModel;
  }

  private getMonacoTheme(themeInput: 'auto' | 'vs' | 'vs-dark' | 'hc-black' | 'hc-light', systemTheme: 'light' | 'dark') {
    if (themeInput === 'auto') {
      return systemTheme === 'dark' ? 'vs-dark' : 'vs';
    }
    return themeInput;
  }

  private destroyResizeObserver() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
    }
  }
  ngOnDestroy(): void {
    this.destroyResizeObserver();
    if (this._editor) {
      const editorModel = this._editor.getModel();
      if (editorModel != null && this.$disposeModelOnDestroy()) {
        // Dispose the model to avoid memory leaks
        editorModel.dispose();
      }
      this._editor.dispose();
      this._editor = undefined;
    }
  }
}
