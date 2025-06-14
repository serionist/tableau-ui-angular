import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MonacoHelper } from '../../helpers/monaco.helper';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiMonacoModule } from 'tableau-ui-angular/monaco';

@Component({
    selector: 'app-monaco-page',
    imports: [TableauUiCommonModule, TableauUiMonacoModule],
    standalone: true,
    templateUrl: './monaco-page.component.html',
    styleUrl: './monaco-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonacoPageComponent {
    options = MonacoHelper.options();

    angularjson = `{
  "projects": {
    "[my-project]": {
      "architect": {
        "build": {
          "options": {
            "assets": [
              { "glob": "**/*", "input": "node_modules/monaco-editor/min", "output": "/monaco-edit" }
            ]
          }
        }
      }
    }
  }
}`;
}
