import { Component } from '@angular/core';
import { MonacoHelper } from '../../helpers/monaco.helper';

@Component({
    selector: 'app-css-page',
    templateUrl: './css-page.component.html',
    styleUrl: './css-page.component.scss',
    standalone: false
})
export class CssPageComponent {
    scssOptions = MonacoHelper.getOptions('scss');
    terminalOptions = MonacoHelper.getOptions('shell');
    code: string = '@use "tableau-ui-angular/styles/lib-styles" as libStyles;';

}
