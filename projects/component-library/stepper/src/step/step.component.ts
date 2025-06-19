import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tab-step',
  standalone: false,
  templateUrl: './step.component.html',
  styleUrl: './step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepComponent {}
