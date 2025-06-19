import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MonacoHelper } from '../../helpers/monaco.helper';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
import { TableauUiMonacoModule } from 'tableau-ui-angular/monaco';

@Component({
  selector: 'app-icons-page',
  imports: [TableauUiCommonModule, TableauUiIconModule, TableauUiMonacoModule],
  standalone: true,
  templateUrl: './icons-page.component.html',
  styleUrl: './icons-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconsPageComponent {
  options = MonacoHelper.options();

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
}`;

  fullConfigExample = `<tab-icon value="home" color="primary" type="Material Symbols Outlined"
[fill]="true" [weight]="100" [grade]="200" [opticalSizePx]="48"></tab-icon>`;
  localImportCode = `@use 'material-symbols/rounded'; // if you used icons with type: Material Symbols Rounded
@use 'material-symbols/outlined'; // if you used icons with type: Material Symbols Outlined
@use 'material-symbols/sharp'; // if you used icons with type: Material Symbols Sharp`;

  iconsTsCode = `import { UsedIcons } from "tableau-ui-angular/used-icons";

export class Icons extends UsedIcons {
    // Only override this, if you also use other fonts than the default 'Material Symbols Rounded'
    // In this example, we use all three fonts
    override fonts: ("Material Symbols Outlined" | "Material Symbols Rounded" | "Material Symbols Sharp")[] = [
        "Material Symbols Outlined", "Material Symbols Rounded", "Material Symbols Sharp"
    ]
    // Only override this, if any of your icons uses another weight than the default 400.
    // In this example, we use 100 and 700 weights in our consuming project
    override weights: (100 | 200 | 300 | 400 | 500 | 600 | 700)[] = [100,700];
    // Only override this, if any of your icons uses another grade than the default 0.
    // In this example, we use -25, 0 and 200 grades in our consuming project
    override grades: (-25 | 0 | 200)[] = [-25, 0, 200];
    // Only override this, if any of your icons uses another optical size than the default 24.
    // In this example, we use 20, 24 and 48 optical sizes in our consuming project
    override opticalSizes: (20 | 24 | 40 | 48)[] = [20, 24, 48];
    // Only override this, if any of your icons are filled. (Default is false)
    // In this example, we have both filled and outlined icons in our consuming project
    override fills: boolean[] = [false, true];

    // Add all icons you use in your consuming project here
    override usedIcons: string[] = [
        'add_circle',
        'do_not_disturb_on'
    ];

}`;

  iconsDownloadContent = `{
  ...
  "scripts": {
    ...
    "icons:download": "node node_modules/tableau-ui-angular/used-icons/scripts/update-icons.js src/icons.ts public/icons"
  }
}`;
  iconsWatchContent = `{
  ...
  "scripts": {
    ...
    "icons:watch": "npm run icons:download && npx chokidar \\"src/icons.ts\\" -c \\"npm run icons:download\\""
  }
}`;
  npmInstallContent = `{
  ...
  "scripts": {
    ...
    "build": "npm run icons:download && ng build"
  }
}`;
  ngServeContent = `{
  ...
  "scripts": {
    ...
    "start": "concurrently \\"ng serve\\" \\"npm run icons:watch\\""
  }
}`;
}
