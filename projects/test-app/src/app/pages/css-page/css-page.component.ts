import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MonacoHelper } from '../../helpers/monaco.helper';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';

@Component({
    selector: 'app-css-page',
    imports: [TableauUiCommonModule],
    standalone: true,
    templateUrl: './css-page.component.html',
    styleUrl: './css-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CssPageComponent {
    scssOptions = MonacoHelper.getOptions('scss');
    terminalOptions = MonacoHelper.getOptions('shell');
    code: string = '@use "tableau-ui-angular/styles/lib-styles" as libStyles;';
}
