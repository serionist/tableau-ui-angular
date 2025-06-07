import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-tabcontrol-page',
    standalone: false,
    templateUrl: './tabcontrol-page.component.html',
    styleUrl: './tabcontrol-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabcontrolPageComponent {}
