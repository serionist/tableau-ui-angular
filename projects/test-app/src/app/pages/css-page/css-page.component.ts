import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MonacoHelper } from '../../helpers/monaco.helper';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiMonacoModule } from 'tableau-ui-angular/monaco';

@Component({
    selector: 'app-css-page',
    imports: [TableauUiCommonModule, TableauUiMonacoModule],
    standalone: true,
    templateUrl: './css-page.component.html',
    styleUrl: './css-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CssPageComponent {
    options = MonacoHelper.options();
    code: string = '@use "tableau-ui-angular/styles/lib-styles" as libStyles;';
}
