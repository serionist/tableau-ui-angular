import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MonacoHelper } from '../../helpers/monaco.helper';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiMonacoModule } from 'tableau-ui-angular/monaco';

@Component({
    selector: 'app-local-development',
    imports: [TableauUiCommonModule, TableauUiMonacoModule],
    standalone: true,
    templateUrl: './local-development.component.html',
    styleUrl: './local-development.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocalDevelopmentComponent {
    options = MonacoHelper.options();

    angularJsonContent = `"projects": {
         "[your-app]": {
              "architect": {
                "build": {
                     "options": {
                          "preserveSymlinks": true
                     }
                },
                "serve": {
                     "options": {
                          "prebundle": {
                               "exclude": [
                                    "tableau-ui-angular"
                               ]
                          }
                     }
                }
              }
         }
}`;
    tsconfigJsonContent = `  "compilerOptions": {
        "paths": {
          "tableau-ui-angular": [
          "./node_modules/tableau-ui-angular"
          ]
     }
    }`;
}
