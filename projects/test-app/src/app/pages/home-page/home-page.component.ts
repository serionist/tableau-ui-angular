import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MonacoHelper } from '../../helpers/monaco.helper';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiMonacoModule } from 'tableau-ui-angular/monaco';
@Component({
    selector: 'app-home-page',
    imports: [TableauUiCommonModule, TableauUiMonacoModule],
    standalone: true,
    templateUrl: './home-page.component.html',
    styleUrl: './home-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
    options = MonacoHelper.options();
    // terminalOptions = MonacoHelper.getOptions('shell');
    // tsOptions = MonacoHelper.getOptions('typescript');
    sampleTsCode = `import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';

@Component({
selector: 'app-root',
standalone: true,
imports: [RouterOutlet, TableauUiButtonModule],
templateUrl: './app.component.html',
styleUrl: './app.component.scss'
})
export class AppComponent {
title = 'tableau-ui-angular-sample';
}`;
    // htmlOptions = MonacoHelper.getOptions('html');
    sampleHtmlCode = `<button color="primary" [loading]="false" type="button" [disabled]="false">
    This is a primary Tableau Button
</button>`;
}
