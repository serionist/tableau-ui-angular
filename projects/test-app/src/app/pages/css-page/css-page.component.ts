import { Component } from '@angular/core';
import { TableauUiCommonModule } from '../../../../../component-library/src/public-api';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { min } from 'rxjs';
import { MonacoHelper } from '../../helpers/monaco.helper';

@Component({
    selector: 'app-css-page',
    templateUrl: './css-page.component.html',
    styleUrl: './css-page.component.scss',
})
export class CssPageComponent {
    scssOptions = MonacoHelper.getOptions('scss');
    terminalOptions = MonacoHelper.getOptions('shell');
    code: string = '@import "tableau-ui-angular/styles/lib-styles";';

    getEditorOptions(lang: string) {
      
    }
}