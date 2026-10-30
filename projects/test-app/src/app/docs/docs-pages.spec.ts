import type { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { projects } from '../../../../../angular.json';
import { engines } from '../../../../../package.json';
import addBentonSans from '../../../../../Add-Benton-Sans.md?source' with { loader: 'text' };
import readme from '../../../../../README.md?source' with { loader: 'text' };
import { assets } from '../../../../component-library/ng-package.json';
import monacoEditorTs from '../../../../component-library/monaco/src/monaco-editor.component.ts?source' with { loader: 'text' };
import { peerDependencies } from '../../../../component-library/package.json';
// The scripts the package ships, read where the commands say they are: a moved script fails the build
import fontsScript from '../../../../component-library/styles/fonts/downloadFonts.js?source' with { loader: 'text' };
import iconsScript from '../../../../component-library/used-icons/scripts/update-icons.js?source' with { loader: 'text' };
import stylesScss from '../../styles.scss?source' with { loader: 'text' };
import { BUTTONS_EXAMPLES } from '../pages/buttons-page/buttons.examples';
import { ButtonsPageComponent } from '../pages/buttons-page/buttons-page.component';
import { CHECKBOX_EXAMPLES } from '../pages/checkbox-page/checkbox.examples';
import { CheckboxPageComponent } from '../pages/checkbox-page/checkbox-page.component';
import { CHIP_EXAMPLES } from '../pages/chip-page/chip.examples';
import { ChipPageComponent } from '../pages/chip-page/chip-page.component';
import { CLIPBOARD_EXAMPLES } from '../pages/clipboard-page/clipboard.examples';
import { ClipboardPageComponent } from '../pages/clipboard-page/clipboard-page.component';
import { DATE_PICKER_EXAMPLES } from '../pages/date-picker-page/date-picker.examples';
import { DatePickerPageComponent } from '../pages/date-picker-page/date-picker-page.component';
import { DIALOGS_EXAMPLES } from '../pages/dialogs-page/dialogs.examples';
import { DialogsPageComponent } from '../pages/dialogs-page/dialogs-page.component';
import { DRAWER_EXAMPLES } from '../pages/drawer-page/drawer.examples';
import { DrawerPageComponent } from '../pages/drawer-page/drawer-page.component';
import { EXPANSION_PANEL_EXAMPLES } from '../pages/expansion-page/expansion-panel.examples';
import { ExpansionPageComponent } from '../pages/expansion-page/expansion-page.component';
import { FORM_FIELDS_EXAMPLES } from '../pages/form-fields-page/form-fields.examples';
import { FormFieldsPageComponent } from '../pages/form-fields-page/form-fields-page.component';
import { FONTS_COMMAND, FONTS_SCRIPT, ICONS_SCRIPT, ICONS_SCRIPTS } from '../pages/getting-started-page/commands';
import { GETTING_STARTED_EXAMPLES } from '../pages/getting-started-page/getting-started.examples';
import { GettingStartedPageComponent } from '../pages/getting-started-page/getting-started-page.component';
import { MENU_EXAMPLES } from '../pages/menu-page/menu.examples';
import { MenuPageComponent } from '../pages/menu-page/menu-page.component';
import { MONACO_EXAMPLES } from '../pages/monaco-page/monaco.examples';
import { MonacoPageComponent } from '../pages/monaco-page/monaco-page.component';
import { MONACO_ASSET } from '../pages/monaco-page/setup';
import { NAVBAR_EXAMPLES } from '../pages/navbar-page/navbar.examples';
import { NavbarPageComponent } from '../pages/navbar-page/navbar-page.component';
import { RADIO_BUTTONS_EXAMPLES } from '../pages/radio-buttons-page/radio-buttons.examples';
import { RadioButtonsPageComponent } from '../pages/radio-buttons-page/radio-buttons-page.component';
import { SELECT_EXAMPLES } from '../pages/select-page/select.examples';
import { SelectPageComponent } from '../pages/select-page/select-page.component';
import { SNACKS_EXAMPLES } from '../pages/snacks-page/snacks.examples';
import { SnacksPageComponent } from '../pages/snacks-page/snacks-page.component';
import { TABLE_EXAMPLES } from '../pages/table-page/table.examples';
import { TablePageComponent } from '../pages/table-page/table-page.component';
import { colorProperties, otherProperties } from '../pages/theming-page/theme-properties';
import { THEMING_EXAMPLES } from '../pages/theming-page/theming.examples';
import { ThemingPageComponent } from '../pages/theming-page/theming-page.component';
import type { DocsExample } from './docs-example';
import { DocsExampleComponent } from './docs-example.component';

// Each page whose samples show their source, with the list of its samples. A page converted to samples joins it
const PAGES: { name: string; page: Type<unknown>; examples: Record<string, DocsExample> }[] = [
  { name: 'getting started', page: GettingStartedPageComponent, examples: GETTING_STARTED_EXAMPLES },
  { name: 'theming', page: ThemingPageComponent, examples: THEMING_EXAMPLES },
  { name: 'buttons', page: ButtonsPageComponent, examples: BUTTONS_EXAMPLES },
  { name: 'checkbox', page: CheckboxPageComponent, examples: CHECKBOX_EXAMPLES },
  { name: 'select', page: SelectPageComponent, examples: SELECT_EXAMPLES },
  { name: 'form fields', page: FormFieldsPageComponent, examples: FORM_FIELDS_EXAMPLES },
  { name: 'table', page: TablePageComponent, examples: TABLE_EXAMPLES },
  { name: 'dialogs', page: DialogsPageComponent, examples: DIALOGS_EXAMPLES },
  { name: 'chips', page: ChipPageComponent, examples: CHIP_EXAMPLES },
  { name: 'clipboard', page: ClipboardPageComponent, examples: CLIPBOARD_EXAMPLES },
  { name: 'date picker', page: DatePickerPageComponent, examples: DATE_PICKER_EXAMPLES },
  { name: 'drawer', page: DrawerPageComponent, examples: DRAWER_EXAMPLES },
  { name: 'expansion panel', page: ExpansionPageComponent, examples: EXPANSION_PANEL_EXAMPLES },
  { name: 'menu', page: MenuPageComponent, examples: MENU_EXAMPLES },
  { name: 'Monaco', page: MonacoPageComponent, examples: MONACO_EXAMPLES },
  { name: 'nav bar', page: NavbarPageComponent, examples: NAVBAR_EXAMPLES },
  { name: 'radio groups', page: RadioButtonsPageComponent, examples: RADIO_BUTTONS_EXAMPLES },
  { name: 'snackbar', page: SnacksPageComponent, examples: SNACKS_EXAMPLES },
];

describe('The docs pages', () => {
  describe.each(PAGES)('the $name page', ({ page, examples }) => {
    // A sample's TS names its template and styles files, so each one it names must have its text here, and no other
    it.each(Object.entries(examples))('has the text of every file of its %s sample', (_, example) => {
      expect(example.ts.trim()).not.toBe('');
      // the TS shown is the running component's; the build names a decorated class with a leading underscore
      expect(example.ts).toContain(`export class ${example.component.name.replace(/^_/, '')} `);

      const templateFile = /templateUrl:\s*'\.\/([^']+)'/.exec(example.ts)?.[1];
      if (templateFile) {
        expect(example.html?.trim(), `the text of ${templateFile}`).toBeTruthy();
      } else {
        expect(example.html, 'no template file, so no HTML').toBeUndefined();
      }

      const stylesFile = /styleUrls?:\s*\[?\s*'\.\/([^']+)'/.exec(example.ts)?.[1];
      if (stylesFile) {
        expect(example.scss?.trim(), `the text of ${stylesFile}`).toBeTruthy();
      } else {
        expect(example.scss, 'no styles file, so no SCSS').toBeUndefined();
      }
    });

    it('shows each of its samples with the text of its files', async () => {
      TestBed.configureTestingModule({ providers: [provideRouter([])] });
      const fixture = TestBed.createComponent(page);
      await fixture.whenStable();

      const shown = fixture.debugElement.queryAll(By.directive(DocsExampleComponent));
      expect(new Set(shown.map(element => (element.componentInstance as DocsExampleComponent).$example()))).toEqual(new Set(Object.values(examples)));
      for (const element of shown) {
        const code = Array.from((element.nativeElement as HTMLElement).querySelectorAll('pre'), pre => pre.textContent.trim());
        expect(code.length).toBeGreaterThan(0);
        expect(code.every(text => text.length > 0)).toBe(true);
      }
      fixture.destroy();
    });
  });

  it("lists every one of the theme's colours, and the other custom properties, from the library's SCSS", () => {
    const colors = colorProperties();
    expect(colors.length).toBeGreaterThan(30);
    expect(colors.every(color => color.name.startsWith('--twc-') && color.light && color.dark)).toBe(true);
    expect(colors.find(color => color.name === '--twc-color-primary')).toMatchObject({ swatch: true });
    expect(otherProperties().map(property => property.name)).toContain('--twc-font-size-body');
  });

  // The README's example is code this build compiles: the getting started page's first sample and the site's styles import
  it("has the README's example compile, as the getting started page's sample and the site's own styles import", () => {
    expect(readme).toContain(GETTING_STARTED_EXAMPLES.firstButton.ts.trim());
    const stylesImport = /^@use '[^']+';/m.exec(stylesScss.replace(' as libStyles', ''))?.[0];
    expect(stylesImport).toBe("@use 'tableau-ui-angular/styles/lib-styles';");
    expect(readme).toContain(stylesImport);
  });

  it("has the README name each peer with the package's range, and the Node range the repo builds on", () => {
    for (const [name, range] of Object.entries(peerDependencies)) {
      expect(readme).toContain(`\`${name}\``);
      expect(readme).toContain(`\`${range}\``);
    }
    // a table cell escapes the range's pipes
    expect(readme).toContain(`\`${engines.node.replaceAll('|', '\\|')}\``);
  });

  it('runs each shipped script by its path in the package, on the getting started page and in Add-Benton-Sans.md', () => {
    expect(fontsScript).toContain('function downloadFonts');
    expect(iconsScript).toContain('function updateIcons');
    // read above at these paths in the library, which the package ships each script's folder at
    expect([FONTS_SCRIPT, ICONS_SCRIPT]).toEqual(['styles/fonts/downloadFonts.js', 'used-icons/scripts/update-icons.js']);
    for (const script of [FONTS_SCRIPT, ICONS_SCRIPT]) {
      expect(assets.some(asset => asset.input === asset.output && script.startsWith(`${asset.output.replace(/^\.\//, '')}/`))).toBe(true);
    }
    expect(FONTS_COMMAND).toContain(`node node_modules/tableau-ui-angular/${FONTS_SCRIPT} `);
    expect(ICONS_SCRIPTS).toContain(`node node_modules/tableau-ui-angular/${ICONS_SCRIPT} `);
    expect(addBentonSans).toContain(FONTS_COMMAND);
  });

  it("serves Monaco's files where the editor loads them, with the angular.json entry the Monaco page shows", () => {
    expect(monacoEditorTs).toContain("+ 'monaco-edit/vs'");
    expect(projects['test-app'].architect.build.options.assets).toContainEqual(JSON.parse(MONACO_ASSET));
  });
});
