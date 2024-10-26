import { Component } from '@angular/core';
import { TableauUiCommonModule } from '../../../../component-library/src/public-api';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { min } from 'rxjs';

@Component({
    selector: 'app-css-page',
    templateUrl: './css-page.component.html',
    styleUrl: './css-page.component.scss',
})
export class CssPageComponent {
    scssOptions = {
        theme: 'vs-dark',
        language: 'scss',
        lineNumbers: 'off',
        readOnly: true,
        folding: false,
        lineDecorationsWidth: 5,
        lineNumbersMinChars: 0,
        minimap: {
            enabled: false,
        },
    };
    terminalOptions = { ...this.scssOptions, language: 'shell' };
    code: string = '@import "tableau-ui-angular/styles/lib-styles";';

    getEditorOptions(lang: string) {
      
    }
}
