import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiTooltipModule } from 'tableau-ui-angular/tooltip';

@Component({
    selector: 'app-tooltips-page',
    imports: [TableauUiTooltipModule, TableauUiButtonModule, TableauUiCommonModule],
    standalone: true,
    templateUrl: './tooltips-page.component.html',
    styleUrl: './tooltips-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipsPageComponent {}
