import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { SnackService } from 'tableau-ui-angular/snack';

type Color = 'error' | 'plain' | 'primary' | 'secondary';

@Component({
  selector: 'app-button-stroked-example',
  imports: [TableauUiButtonModule],
  templateUrl: './button-stroked.example.html',
  styleUrl: './button-stroked.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonStrokedExampleComponent {
  private readonly snacks = inject(SnackService);

  protected readonly $loading = signal<Record<Color, boolean>>({ plain: false, secondary: false, primary: false, error: false });

  // Shows the button loading for two seconds, then a snack
  protected async work(color: Color) {
    this.$loading.update(loading => ({ ...loading, [color]: true }));
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.$loading.update(loading => ({ ...loading, [color]: false }));
    this.snacks.openSnack(`${color} button clicked`, 2000, color === 'error' ? 'error' : 'info');
  }
}
