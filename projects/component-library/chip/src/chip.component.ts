import type { InputSignal } from '@angular/core';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { TooltipArgs } from 'tableau-ui-angular/tooltip';
import { generateRandomString } from 'tableau-ui-angular/utils';

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
  private readonly id = generateRandomString(16);
  // the content and the remove icon, which name the remove button together: "Remove Berlin"
  protected readonly contentId = `tab-chip-content-${this.id}`;
  protected readonly removeId = `tab-chip-remove-${this.id}`;
  /**
   * Show a remove button in the chip, named Remove and the chip's content for screen readers: "Remove Berlin".
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
