import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiArrowScrollModule } from 'tableau-ui-angular/arrow-scroll';

@Component({
  selector: 'app-scroller-horizontal-example',
  imports: [TableauUiArrowScrollModule],
  templateUrl: './scroller-horizontal.example.html',
  styleUrl: './scroller-horizontal.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollerHorizontalExampleComponent {
  protected readonly items = Array.from({ length: 30 }, (_, index) => `Item ${index + 1}`);
}
