import { ChangeDetectionStrategy, Component } from '@angular/core';
import type { IconParams } from 'tableau-ui-angular/icon';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';

@Component({
  selector: 'app-icon-style-example',
  imports: [TableauUiIconModule],
  templateUrl: './icon-style.example.html',
  styleUrl: './icon-style.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconStyleExampleComponent {
  protected readonly types = ['Material Symbols Rounded', 'Material Symbols Outlined', 'Material Symbols Sharp'] as const;
  protected readonly weights = [100, 400, 700] as const;
  protected readonly grades = [-25, 0, 200] as const;
  protected readonly opticalSizes = [20, 24, 40, 48] as const;

  // Every parameter at once; each one it sets wins over its own input
  protected readonly params: IconParams = { color: 'primary', type: 'Material Symbols Outlined', fill: true, weight: 100, grade: 200, opticalSizePx: 48 };
}
