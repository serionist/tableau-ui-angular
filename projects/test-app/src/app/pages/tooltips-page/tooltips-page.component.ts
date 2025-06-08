import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-tooltips-page',
    standalone: false,
    templateUrl: './tooltips-page.component.html',
    styleUrl: './tooltips-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipsPageComponent {}
