import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-tree-page',
    standalone: false,
    templateUrl: './tree-page.component.html',
    styleUrl: './tree-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreePageComponent {}
