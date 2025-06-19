import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import type { StepComponent } from '../step/step.component';

@Component({
  selector: 'tab-stepper',
  standalone: false,
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepperComponent {
  /**
   * The orientation of the stepper.
   * @default 'horizontal'
   */
  readonly $orientation = input<'horizontal' | 'vertical'>('horizontal', {
    alias: 'orientation',
  });

  /**
   * Whether the validity of a step needs to be checked before moving to the next step.
   * If set to true, the stepper will not allow moving to the next step until the current step is valid.
   * @default false
   */
  readonly $linear = input<boolean>(false, {
    alias: 'linear',
  });

  /**
   * The index of the currently selected step.
   * This is used to control the active step in the stepper.
   * When it's -1, it selects the first navigable step.
   * Allows for two way data binding.
   * @default -1 (no step selected)
   */
  readonly $selectedIndex = model<number>(-1, {
    alias: 'selectedIndex',
  });

  /**
   * The anumation duration in milliseconds for the stepper transitions.
   * @default 300
   */
  readonly $animationDuration = input<number>(300, {
    alias: 'animationDuration',
  });

  /**
   * The position of the stepper label. relative to the stepper icon.
   * Only applicable when the stepper is horizontal.
   * @default 'right'
   */
  readonly $labelPosition = input<'right' | 'bottom'>('right', {
    alias: 'labelPosition',
  });

  /**
   * Event emitted when the selected step changes.
   */
  readonly selectedStepChanged = output<StepComponent>();
}
