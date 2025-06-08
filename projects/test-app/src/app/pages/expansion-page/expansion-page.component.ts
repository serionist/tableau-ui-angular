import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SnackService } from 'component-library';

@Component({
    selector: 'app-buttons-page',
    standalone: false,
    templateUrl: './expansion-page.component.html',
    styleUrl: './expansion-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpansionPageComponent {
    snack = inject(SnackService);
    specialButtonClick(e: Event) {
        e.stopPropagation();
        e.preventDefault();
        this.snack.openSnack('Button clicked', 5000);
    }
}
