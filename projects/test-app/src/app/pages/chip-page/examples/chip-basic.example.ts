import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiChipModule } from 'tableau-ui-angular/chip';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
import type { TooltipArgs } from 'tableau-ui-angular/tooltip';

@Component({
  selector: 'app-chip-basic-example',
  imports: [TableauUiButtonModule, TableauUiChipModule, TableauUiIconModule],
  templateUrl: './chip-basic.example.html',
  styleUrl: './chip-basic.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipBasicExampleComponent {
  // A chip's remove button only emits removed: the app takes the chip away
  protected readonly $removable = signal(true);
  protected readonly $withTooltip = signal(true);

  // The remove button's tooltip: a text, or a template with its context
  protected readonly removeTooltip: TooltipArgs<undefined> = { template: 'Remove this chip', context: undefined };

  protected reset() {
    this.$removable.set(true);
    this.$withTooltip.set(true);
  }
}
