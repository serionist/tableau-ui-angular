import { ChangeDetectionStrategy, Component, effect, inject, model } from '@angular/core';

import { SnackService } from 'tableau-ui-angular/snack';

import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';

@Component({
    selector: 'app-buttons-page',
    imports: [TableauUiCommonModule, TableauUiButtonModule, TableauUiIconModule],
    standalone: true,
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
    async buttonClick(color: 'error' | 'plain' | 'primary' | 'secondary') {
        this.buttonsLoading[color] = true;
        await new Promise((resolve) => setTimeout(resolve, 2000));
        this.buttonsLoading[color] = false;
        console.log('Button clicked', color);
        this.snack.openSnack(`Button ${color} clicked`, 2000, color === 'error' ? 'error' : 'info');
    }

    readonly buttonToggleValue = model<string>('left');
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
