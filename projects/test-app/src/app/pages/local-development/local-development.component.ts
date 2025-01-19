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
  consumingLinkContent = `npm link tableau-ui-angular && cd node_modules/tableau-ui-angular && 
  npm install --omit=peer --omit=optional && cd ../..`;
  unlinkContent = `npm unlink --no-save tableau-ui-angular && npm install`;
}
