import type { MonacoConstructionOptions } from 'tableau-ui-angular/monaco';

export class MonacoHelper {
  static getOptions(lang: string) {
    return {
      theme: 'vs-dark',
      language: lang,
      lineNumbers: 'off',
      readOnly: true,
      folding: false,
      lineDecorationsWidth: 5,
      lineNumbersMinChars: 0,
      minimap: {
        enabled: false,
      },
    };
  }
  static options(): MonacoConstructionOptions {
    return {
      lineNumbers: 'off',
      readOnly: true,
      folding: false,
      lineDecorationsWidth: 0,
      lineNumbersMinChars: 0,
      glyphMargin: false,
      minimap: {
        enabled: false,
      },
      padding: {
        top: 0,
        bottom: 0,
      },
      scrollbar: {
        horizontal: 'hidden',
        vertical: 'hidden',
        useShadows: false,
        alwaysConsumeMouseWheel: false,
        verticalScrollbarSize: 0,
        horizontalScrollbarSize: 0,
      },
      renderLineHighlight: 'none',
      scrollBeyondLastLine: false,
      overviewRulerLanes: 0,
      hideCursorInOverviewRuler: true,
      overviewRulerBorder: false,
      renderValidationDecorations: 'off',
    };
  }
}
