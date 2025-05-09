import { Component } from '@angular/core';
import { MonacoHelper } from '../../helpers/monaco.helper';

@Component({
  selector: 'app-local-development',
  templateUrl: './local-development.component.html',
  styleUrl: './local-development.component.scss',
  standalone: false
})
export class LocalDevelopmentComponent {
  terminalOptions = MonacoHelper.getOptions('shell');
  tsOptions = MonacoHelper.getOptions('typescript');
  jsonOptions = MonacoHelper.getOptions('json');

  angularJsonContent = `"projects": {
         "[your-app]": {
              "architect": {
                "build": {
                     "options": {
                          "preserveSymlinks": true
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
