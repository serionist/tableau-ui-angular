import type { OnDestroy } from '@angular/core';
import { afterNextRender, DOCUMENT, ElementRef, ErrorHandler, signal } from '@angular/core';
import { ChangeDetectionStrategy, Component, effect, forwardRef, inject, input, model, output, untracked } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { ICodeEditor, MonacoConstructionOptions } from './types';
import type MonacoNamespace from 'monaco-editor';
import { ThemeService } from 'tableau-ui-angular/theme';
type Monaco = typeof MonacoNamespace;
declare let monaco: Monaco;

// Monaco's AMD loader, as loader.js defines it
interface AmdRequire {
  (modules: string[], onLoad: () => void, onError: (error: unknown) => void): void;
  config?: (config: { paths: Record<string, string> }) => void;
}
type MonacoWindow = Window & { monaco?: unknown; require?: AmdRequire; monacoAmdRequire?: AmdRequire };

// One load for the page, which every editor waits for. A load that fails is reported once, by the editor that started
// it, and forgotten, so the next editor tries again.
let monacoLoadPromise: Promise<void> | undefined = undefined;

async function loadMonaco(document: Document, errorHandler: ErrorHandler): Promise<void> {
  monacoLoadPromise ??= startMonacoLoad(document).catch((error: unknown) => {
    monacoLoadPromise = undefined;
    errorHandler.handleError(error);
    throw error;
  });
  return monacoLoadPromise;
}

async function startMonacoLoad(document: Document): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const view = document.defaultView as MonacoWindow | null;
    if (!view) {
      reject(new Error('Monaco needs a window to load in'));
      return;
    }
    if (typeof view.monaco === 'object') {
      resolve();
      return;
    }
    const baseUrl = (document.head.getElementsByTagName('base').item(0)?.href ?? view.location.origin + '/') + 'monaco-edit/vs';
    const failed = (what: string, cause?: unknown) => {
      reject(new Error(`Monaco failed to load: ${what}. Is node_modules/monaco-editor/min served at monaco-edit?`, { cause }));
    };
    const onGotAmdLoader = (amdRequire = view.require) => {
      if (typeof amdRequire?.config !== 'function') {
        failed(`${baseUrl}/loader.js defined no AMD loader`);
        return;
      }
      amdRequire.config({ paths: { vs: baseUrl } });
      amdRequire(
        ['vs/editor/editor.main'],
        () => {
          resolve();
        },
        (error: unknown) => {
          failed(`${baseUrl}/editor/editor.main.js`, error);
        },
      );
    };

    if (!view.require) {
      const loaderScript: HTMLScriptElement = document.createElement('script');
      loaderScript.type = 'text/javascript';
      loaderScript.src = `${baseUrl}/loader.js`;
      loaderScript.addEventListener('load', () => {
        onGotAmdLoader();
      });
      loaderScript.addEventListener('error', () => {
        failed(loaderScript.src);
      });
      document.body.appendChild(loaderScript);
      // Load AMD loader without over-riding node's require
    } else if (!view.require.config) {
      const src = `${baseUrl}/loader.js`;

      const loaderRequest = new XMLHttpRequest();
      loaderRequest.addEventListener('load', () => {
        if (loaderRequest.status < 200 || loaderRequest.status >= 300) {
          failed(`${src} answered ${loaderRequest.status}`);
          return;
        }
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
        onGotAmdLoader(view.monacoAmdRequire);
      });
      loaderRequest.addEventListener('error', () => {
        failed(src);
      });
      loaderRequest.open('GET', src);
      loaderRequest.send();
    } else {
      onGotAmdLoader();
    }
  });
}

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
export class MonacoEditorComponent implements OnDestroy, ControlValueAccessor {
  private _editor: ICodeEditor | undefined;
  private readonly themeService = inject(ThemeService);
  private readonly document = inject(DOCUMENT);
  private readonly errorHandler = inject(ErrorHandler);
  // Set by the form: a disabled editor is read-only
  private readonly $disabled = signal(false);
  // Monaco's first load can end after the editor is gone, which then must not be created
  private destroyed = false;
  // True while the editor's text is set from the app or the form, so the change Monaco reports for it is not the user's
  private settingText = false;

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
   *
   * Monaco has one theme for the whole page: the editor that sets it last sets it for every editor. Give the editors
   * on a page the same theme.
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
   * If true, the model will be disposed when the component is destroyed, and the old one when `uri` changes.
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

  constructor() {
    // Monaco loads, and the editor lays out, in the browser only, after the first render, so the page with the editor
    // can be rendered on the server
    afterNextRender(() => {
      loadMonaco(this.document, this.errorHandler).then(
        () => {
          if (!this.destroyed) {
            this.initEditor();
          }
        },
        () => {
          // the load reported its failure itself; the editor stays empty
        },
      );
    });
  }

  // #region Effects
  // When the option changes, re-initialize the entire editor
  readonly optionsChanged = effect(() => {
    this.$options();
    // untracked: the new editor reads the value and the other inputs, and a keystroke must not rebuild it
    untracked(() => {
      if (this._editor) {
        this._editor.dispose();
        this._editor = undefined;
        this.initEditor();
      }
    });
  });
  // When the URI changes, update the editor to use the new URI if it's initialized
  readonly uriChanged = effect(() => {
    const uri = this.$uri();
    const language = untracked(() => this.$language());
    const value = untracked(() => this.$value());
    if (this._editor) {
      const previousModel = this._editor.getModel();
      // update or create the model with the new URI
      const editorModel = this.updateOrCreateModel(monaco.Uri.parse(uri), language, value);
      this._editor.setModel(editorModel);
      // The editor no longer shows the old document: it goes, as on destroy, unless the app keeps its models
      if (previousModel && previousModel !== editorModel && untracked(() => this.$disposeModelOnDestroy())) {
        previousModel.dispose();
      }
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
    const value = this.$value() ?? '';
    const uri = untracked(() => this.$uri());
    if (this._editor) {
      // update or create the model with the new value
      const editorModel = monaco.editor.getModel(monaco.Uri.parse(uri));
      if (!editorModel) {
        console.warn('Can not update value. Monaco editor model not found for URI:', uri);
      } else if (editorModel.getValue() !== value) {
        // setValue clears the undo stack and moves the cursor to the start, so skip it for the text the user just typed
        this.setText(editorModel, value);
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
  // A disabled form control is read-only, and so is an editor whose options say so
  private readonly readOnlyChanged = effect(() => {
    const readOnly = this.isReadOnly();
    untracked(() => {
      this._editor?.updateOptions({ readOnly });
    });
  });

  // #endregion Effects

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onPropagateChange: (val: string) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onPropagateTouched: () => void = () => {};
  // #region ControlValueAccessor

  writeValue(val: string | null): void {
    // forms write null on reset, and Monaco throws on a null value
    this.$value.set(val ?? '');
  }
  registerOnChange(fn: (val: string) => void): void {
    this.onPropagateChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onPropagateTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.$disabled.set(isDisabled);
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
    this._editor = monaco.editor.create(this.editorContainer.nativeElement, { ...this.$options(), readOnly: this.isReadOnly(), model: editorModel });
    monaco.editor.setTheme(this.getMonacoTheme(this.$theme(), this.themeService.$appliedThemeMode()));

    this._editor.onDidChangeModelContent(() => {
      // a change the app or the form made is theirs already: neither the value nor the form hears of it again
      if (!this._editor || this.settingText) {
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
      this.setText(editorModel, value);
      if (editorModel.getLanguageId() !== language) {
        monaco.editor.setModelLanguage(editorModel, language);
      }
    } else {
      editorModel = monaco.editor.createModel(value, language, uri);
    }
    return editorModel;
  }

  // The text from the app or the form, which Monaco reports as a change of content like a keystroke
  private setText(editorModel: MonacoNamespace.editor.ITextModel, value: string) {
    this.settingText = true;
    try {
      editorModel.setValue(value);
    } finally {
      this.settingText = false;
    }
  }

  private isReadOnly() {
    return this.$disabled() || this.$options().readOnly === true;
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
    this.destroyed = true;
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
