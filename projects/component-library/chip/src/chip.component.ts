import type { InputSignal } from '@angular/core';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { TooltipArgs } from 'tableau-ui-angular/tooltip';

@Component({
  selector: 'tab-chip',
  standalone: false,
  templateUrl: './chip.component.html',
  styleUrl: './chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.selected]': '$selected()',
    '[class.disabled]': '$disabled()',
  },
})
export class ChipComponent {
  /**
   * Show a remove icon in the chip.
   */
  readonly $allowRemove = input<boolean>(false, {
    alias: 'allowRemove',
  });
  readonly $removeTooltip: InputSignal<TooltipArgs<unknown> | undefined> = input<TooltipArgs<unknown> | undefined>(undefined, {
    alias: 'removeTooltip',
  });
  /**
   * Highlight the chip.
   * This is used to indicate that the chip is selected.
   */
  readonly $selected = input<boolean>(false, {
    alias: 'selected',
  });

  readonly $disabled = input<boolean>(false, {
    alias: 'disabled',
  });

  /**
   * Event called when remove is clicked
   */
  readonly removed = output();
}
