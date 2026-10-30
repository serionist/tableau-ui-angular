import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiButtonToggleModule } from 'tableau-ui-angular/button-toggle';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiFormFieldModule } from 'tableau-ui-angular/form-field';
import { ThemeService } from 'tableau-ui-angular/theme';

@Component({
  selector: 'app-theme-switcher-example',
  imports: [TableauUiButtonModule, TableauUiButtonToggleModule, TableauUiCommonModule, TableauUiFormFieldModule],
  templateUrl: './theme-switcher.example.html',
  styleUrl: './theme-switcher.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeSwitcherExampleComponent {
  protected readonly theme = inject(ThemeService);

  protected readonly $mode = computed(() => this.theme.$theme().mode);
  protected readonly $fontSize = computed(() => parseInt(this.theme.$theme().fontSize, 10));

  // 'auto' follows the system's mode, and $appliedThemeMode says which one shows
  protected setMode(mode: 'auto' | 'dark' | 'light' | undefined) {
    if (mode) {
      this.theme.setColorMode(mode);
    }
  }

  // The base size, in --twc-font-size-body; the library's other sizes are relative to it
  protected setFontSize(event: Event) {
    const size = Number((event.target as HTMLInputElement).value);
    if (size >= 10 && size <= 24) {
      this.theme.setFontSize(`${size}px`);
    }
  }
}
