import { ChangeDetectionStrategy, Component, effect, inject, model } from '@angular/core';
import { SnackService } from 'component-library';

@Component({
    selector: 'app-buttons-page',
    standalone: false,
    templateUrl: './buttons-page.component.html',
    styleUrl: './buttons-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonsPageComponent {
    snack = inject(SnackService);

    buttonsLoading = {
        primary: false,
        secondary: false,
        error: false,
        plain: false,
    };
    async buttonClick(color: 'primary' | 'secondary' | 'error' | 'plain') {
        this.buttonsLoading[color] = true;
        await new Promise((resolve) => setTimeout(resolve, 2000));
        this.buttonsLoading[color] = false;
        console.log('Button clicked', color);
        this.snack.openSnack(`Button ${color} clicked`, 2000, color === 'error' ? 'error' : 'info');
    }

    readonly buttonToggleValue = model<string | undefined>('center');
    private initialButtonToggleValueChange = true;
    readonly buttonToggleChange = effect(() => {
        const val = this.buttonToggleValue();
        if (this.initialButtonToggleValueChange) {
            this.initialButtonToggleValueChange = false;
            return;
        }

        this.snack.openSnack('Button toggle value changed: ' + (val ?? '[undefined]'), 2000, 'info');
    });
}
