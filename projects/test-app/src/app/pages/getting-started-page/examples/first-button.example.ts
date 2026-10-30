import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';

@Component({
  selector: 'app-first-button',
  imports: [TableauUiButtonModule],
  template: `<button color="primary" (click)="$count.set($count() + 1)">Clicked {{ $count() }} times</button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FirstButtonComponent {
  protected readonly $count = signal(0);
}
