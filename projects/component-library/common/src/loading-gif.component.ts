import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'tab-loading-gif',
  standalone: false,
  templateUrl: './loading-gif.component.html',
  styles: `
    svg {
      margin: auto;
      display: block;
      shape-rendering: auto;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingGifComponent {
  readonly $color = input<string>('var(--twc-color-text)', {
    alias: 'color',
  });
  readonly $width = input<string>('24px', {
    alias: 'width',
  });
  readonly $height = input<string>('24px', {
    alias: 'height',
  });
}
