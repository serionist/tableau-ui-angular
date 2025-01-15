import { Component } from '@angular/core';
import { MonacoHelper } from '../../helpers/monaco.helper';

@Component({
    selector: 'app-icons-page',
    templateUrl: './icons-page.component.html',
    styleUrl: './icons-page.component.scss',
    standalone: false
})
export class IconsPageComponent {
  htmlOptions = MonacoHelper.getOptions('html');
  tsOptions = MonacoHelper.getOptions('typescript');
  scssOptions = MonacoHelper.getOptions('scss');
  terminalOptions = MonacoHelper.getOptions('shell');

  localModuleCode = `import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TableauUiIconModule } from 'tableau-ui-angular';

@Component({
selector: 'app-root',
standalone: true,
imports: [RouterOutlet, TableauUiIconModule],
templateUrl: './app.component.html',
styleUrl: './app.component.scss'
})
export class AppComponent {
}
`;

dynamicModuleCode = ` imports: [
        TableauUiIconModule.forRoot({ enableDynamicIcons: true, enableDynamicIconsLocalStorageCache: true }),
    ]`;
providersCode = `imports: [
        TableauUiIconModule
        // TableauUiAllModule
    ],
providers: [
    {
        provide: ICON_CONFIG,
        useValue: {
            enableDynamicIcons: true,
            enableDynamicIconsLocalStorageCache: true
        }
    }
]`;
}
