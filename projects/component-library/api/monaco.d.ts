// The public API of tableau-ui-angular/monaco, from its built typings. npm run api:update writes it; a change to it is named in the PR.

import * as i2 from '@angular/common';
import * as i0 from '@angular/core';
import { ElementRef, OnDestroy } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import MonacoNamespace from 'monaco-editor';

type ICodeEditor = MonacoNamespace.editor.ICodeEditor;

type Monaco = typeof MonacoNamespace;

type MonacoConstructionOptions = Omit<MonacoNamespace.editor.IStandaloneEditorConstructionOptions, 'value' | 'model' | 'language' | 'theme'> & MonacoNamespace.editor.ITextModelUpdateOptions;

export declare class MonacoEditorComponent implements OnDestroy, ControlValueAccessor {
  readonly $options: import('@angular/core').InputSignal<MonacoConstructionOptions>;
  readonly $uri: import('@angular/core').InputSignal<string>;
  readonly $language: import('@angular/core').InputSignal<string>;
  readonly $value: import('@angular/core').ModelSignal<string>;
  readonly $theme: import('@angular/core').InputSignal<'auto' | 'vs' | 'vs-dark' | 'hc-black' | 'hc-light'>;
  readonly $onMonacoLoad: import('@angular/core').InputSignal<((monaco: Monaco) => void) | undefined>;
  readonly $disposeModelOnDestroy: import('@angular/core').InputSignal<boolean>;
  readonly editorLoaded: import('@angular/core').OutputEmitterRef<MonacoNamespace.editor.ICodeEditor>;
  readonly editorContainer: ElementRef<HTMLElement>;
  constructor();
  readonly optionsChanged: import('@angular/core').EffectRef;
  readonly uriChanged: import('@angular/core').EffectRef;
  readonly languageChanged: import('@angular/core').EffectRef;
  readonly valueChanged: import('@angular/core').EffectRef;
  readonly themeChanged: import('@angular/core').EffectRef;
  writeValue(val: string | null): void;
  registerOnChange(fn: (val: string) => void): void;
  registerOnTouched(fn: () => void): void;
  setDisabledState(isDisabled: boolean): void;
  ngOnDestroy(): void;
  static ɵfac: i0.ɵɵFactoryDeclaration<MonacoEditorComponent, never>;
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MonacoEditorComponent,
    'tab-monaco-editor',
    never,
    {
      $options: {
        alias: 'options';
        required: false;
        isSignal: true;
      };
      $uri: {
        alias: 'uri';
        required: true;
        isSignal: true;
      };
      $language: {
        alias: 'language';
        required: true;
        isSignal: true;
      };
      $value: {
        alias: 'value';
        required: false;
        isSignal: true;
      };
      $theme: {
        alias: 'theme';
        required: false;
        isSignal: true;
      };
      $onMonacoLoad: {
        alias: 'onMonacoLoad';
        required: false;
        isSignal: true;
      };
      $disposeModelOnDestroy: {
        alias: 'disposeModelOnDestroy';
        required: false;
        isSignal: true;
      };
    },
    {
      $value: 'valueChange';
      editorLoaded: 'editorLoaded';
    },
    never,
    never,
    false,
    never
  >;
}

type MonacoOptions = MonacoNamespace.editor.IStandaloneCodeEditor;

interface MonacoTextModelConstructionOptions {
  initialValue: string;
  uri: MonacoNamespace.Uri;
  language: string;
}

export declare class TableauUiMonacoModule {
  static ɵfac: i0.ɵɵFactoryDeclaration<TableauUiMonacoModule, never>;
  static ɵmod: i0.ɵɵNgModuleDeclaration<TableauUiMonacoModule, [typeof MonacoEditorComponent], [typeof i2.CommonModule], [typeof MonacoEditorComponent]>;
  static ɵinj: i0.ɵɵInjectorDeclaration<TableauUiMonacoModule>;
}

export type { ICodeEditor, MonacoConstructionOptions, MonacoOptions, MonacoTextModelConstructionOptions };
