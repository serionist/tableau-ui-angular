import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiArrowScrollModule } from 'tableau-ui-angular/arrow-scroll';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
@Component({
    selector: 'app-scroller-page',
    imports: [TableauUiArrowScrollModule, TableauUiIconModule, TableauUiCommonModule],
    standalone: true,
    templateUrl: './scroller-page.component.html',
    styleUrl: './scroller-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollerPageComponent {}
