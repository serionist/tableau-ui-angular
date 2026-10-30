import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { DocsCodeComponent } from '../../docs/docs-code.component';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, TableauUiCommonModule, DocsCodeComponent],
  templateUrl: './home-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {}
