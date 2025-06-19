import type { WritableSignal } from '@angular/core';
import { ChangeDetectionStrategy, Component, effect, inject, model, signal } from '@angular/core';

import { SnackService } from 'tableau-ui-angular/snack';

import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
import { TableauUiButtonToggleModule } from 'tableau-ui-angular/button-toggle';

@Component({
  selector: 'app-buttons-page',
  imports: [TableauUiCommonModule, TableauUiButtonModule, TableauUiIconModule, TableauUiButtonToggleModule],
  standalone: true,
  templateUrl: './buttons-page.component.html',
  styleUrl: './buttons-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonsPageComponent {
  snack = inject(SnackService);

  readonly $primaryLoading = signal(false);
  readonly $secondaryLoading = signal(false);
  readonly $errorLoading = signal(false);
  readonly $plainLoading = signal(false);
  async buttonClick(color: 'error' | 'plain' | 'primary' | 'secondary') {
    let s: WritableSignal<boolean>;
    switch (color) {
      case 'error':
        s = this.$errorLoading;
        break;
      case 'plain':
        s = this.$plainLoading;
        break;
      case 'primary':
        s = this.$primaryLoading;
        break;
      case 'secondary':
        s = this.$secondaryLoading;
        break;
      default:
        throw new Error('Unknown color');
    }
    s.set(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    s.set(false);
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
