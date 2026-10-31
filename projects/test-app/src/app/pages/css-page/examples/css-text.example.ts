import { ChangeDetectionStrategy, Component } from '@angular/core';

// The library's styles style the text; the component imports no module
@Component({
  selector: 'app-css-text-example',
  templateUrl: './css-text.example.html',
  styleUrl: './css-text.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CssTextExampleComponent {
  // The weights font-import gives Benton Sans
  protected readonly weights = [100, 400, 500, 700];
}
