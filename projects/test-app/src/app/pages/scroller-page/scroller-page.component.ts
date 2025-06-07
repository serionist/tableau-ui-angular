import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SnackService } from 'component-library';

@Component({
    selector: 'app-scroller-page',
    standalone: false,
    templateUrl: './scroller-page.component.html',
    styleUrl: './scroller-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollerPageComponent {}
