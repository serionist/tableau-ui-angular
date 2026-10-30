import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
import { SnackService } from 'tableau-ui-angular/snack';

type Color = 'error' | 'plain' | 'primary' | 'secondary';

@Component({
  selector: 'app-button-icons-example',
  imports: [TableauUiButtonModule, TableauUiIconModule],
  templateUrl: './button-icons.example.html',
  styleUrl: './button-icons.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonIconsExampleComponent {
  private readonly snacks = inject(SnackService);

  protected readonly repo = 'https://github.com/serionist/tableau-ui-angular';
  protected readonly layouts = ['icon', 'small-icon'] as const;
  protected readonly colors: readonly Color[] = ['plain', 'secondary', 'primary', 'error'];
  protected readonly $loading = signal<Record<Color, boolean>>({ plain: false, secondary: false, primary: false, error: false });

  // Shows the button loading for two seconds, then a snack
  protected async work(color: Color) {
    this.$loading.update(loading => ({ ...loading, [color]: true }));
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.$loading.update(loading => ({ ...loading, [color]: false }));
    this.snacks.openSnack(`${color} button clicked`, 2000, color === 'error' ? 'error' : 'info');
  }
}
