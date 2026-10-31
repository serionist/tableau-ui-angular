import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiArrowScrollModule } from 'tableau-ui-angular/arrow-scroll';

@Component({
  selector: 'app-scroller-vertical-example',
  imports: [TableauUiArrowScrollModule],
  templateUrl: './scroller-vertical.example.html',
  styleUrl: './scroller-vertical.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollerVerticalExampleComponent {
  protected readonly lines = Array.from({ length: 30 }, (_, index) => `Line ${index + 1} of the content`);
}
