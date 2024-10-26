import { Component } from '@angular/core';
import { MonacoHelper } from '../../helpers/monaco.helper';

@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrl: './home-page.component.scss',
})
export class HomePageComponent {
    terminalOptions = MonacoHelper.getOptions('shell');
    tsOptions = MonacoHelper.getOptions('typescript');
    sampleTsCode = `import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TableauUiButtonModule } from 'tableau-ui-angular';

@Component({
selector: 'app-root',
standalone: true,
imports: [RouterOutlet, TableauUiButtonModule],
templateUrl: './app.component.html',
styleUrl: './app.component.scss'
})
export class AppComponent {
title = 'tableau-ui-angular-sample';
}
`;
    htmlOptions = MonacoHelper.getOptions('html');
  sampleHtmlCode = `<button color="primary" [loading]="false" type="button" [disabled]="false">
    This is a primary Tableau Button
  </button>`;
}
