import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { CONTRAST_PAIRS } from '../../../../../component-library/testing/contrast-pairs';
import appConfigTs from '../../app.config.ts?source' with { loader: 'text' };
import { DocsCodeComponent } from '../../docs/docs-code.component';
import { DocsExampleComponent } from '../../docs/docs-example.component';
import { colorProperties, otherProperties } from './theme-properties';
import { THEMING_EXAMPLES } from './theming.examples';

@Component({
  selector: 'app-theming-page',
  imports: [TableauUiCommonModule, DocsCodeComponent, DocsExampleComponent],
  templateUrl: './theming-page.component.html',
  styleUrl: './theming-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemingPageComponent {
  protected readonly examples = THEMING_EXAMPLES;
  protected readonly appConfigTs = appConfigTs;
  protected readonly colors = colorProperties();
  protected readonly others = otherProperties();
  // The list the library's contrast spec reads, so the page shows the pairs it checks
  protected readonly contrastPairs = CONTRAST_PAIRS;
}
