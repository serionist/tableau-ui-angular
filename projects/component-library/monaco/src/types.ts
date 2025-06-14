import type MonacoNamespace from 'monaco-editor';

export type MonacoConstructionOptions = Omit<MonacoNamespace.editor.IStandaloneEditorConstructionOptions, 'value' | 'model' | 'language' | 'theme'> & MonacoNamespace.editor.ITextModelUpdateOptions;

export interface MonacoTextModelConstructionOptions {
    initialValue: string;
    uri: MonacoNamespace.Uri;
    language: string;
}

export type MonacoOptions = MonacoNamespace.editor.IStandaloneCodeEditor;
export type ICodeEditor = MonacoNamespace.editor.ICodeEditor;
