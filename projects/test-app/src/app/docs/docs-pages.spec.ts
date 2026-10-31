import type { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { projects } from '../../../../../angular.json';
import { engines, scripts } from '../../../../../package.json';
import addBentonSans from '../../../../../Add-Benton-Sans.md?source' with { loader: 'text' };
import readme from '../../../../../README.md?source' with { loader: 'text' };
// The README's images, which it names by their URLs on main
import dashboardDarkPng from '../../../../../docs/assets/dashboard-dark.png?bytes' with { loader: 'binary' };
import dashboardLightPng from '../../../../../docs/assets/dashboard-light.png?bytes' with { loader: 'binary' };
import logoDarkSvg from '../../../../../docs/assets/logo-dark.svg?source' with { loader: 'text' };
import logoLightSvg from '../../../../../docs/assets/logo-light.svg?source' with { loader: 'text' };
import { assets, dest } from '../../../../component-library/ng-package.json';
import monacoEditorTs from '../../../../component-library/monaco/src/monaco-editor.component.ts?source' with { loader: 'text' };
import { peerDependencies } from '../../../../component-library/package.json';
// The scripts the package ships, read where the commands say they are: a moved script fails the build
import fontsScript from '../../../../component-library/styles/fonts/downloadFonts.js?source' with { loader: 'text' };
import iconsScript from '../../../../component-library/used-icons/scripts/update-icons.js?source' with { loader: 'text' };
// What npm run dev:link prints, the steps the local development page shows
import linkInfo from '../../../../../scripts/link-info.js?source' with { loader: 'text' };
import { dependencies, devDependencies } from '../../../package.json';
// The dev tools the icons page's scripts run, and the package's styles it uses
import { bin as chokidarBin } from '../../../../../node_modules/chokidar-cli/package.json';
import { bin as concurrentlyBin } from '../../../../../node_modules/concurrently/package.json';
import outlinedScss from '../../../../../node_modules/material-symbols/outlined.scss?source' with { loader: 'text' };
import roundedScss from '../../../../../node_modules/material-symbols/rounded.scss?source' with { loader: 'text' };
import sharpScss from '../../../../../node_modules/material-symbols/sharp.scss?source' with { loader: 'text' };
import stylesScss from '../../styles.scss?source' with { loader: 'text' };
import { routes } from '../app.routes';
import { BUTTONS_EXAMPLES } from '../pages/buttons-page/buttons.examples';
import { ButtonsPageComponent } from '../pages/buttons-page/buttons-page.component';
import { CHECKBOX_EXAMPLES } from '../pages/checkbox-page/checkbox.examples';
import { CheckboxPageComponent } from '../pages/checkbox-page/checkbox-page.component';
import { CHIP_EXAMPLES } from '../pages/chip-page/chip.examples';
import { ChipPageComponent } from '../pages/chip-page/chip-page.component';
import { CLIPBOARD_EXAMPLES } from '../pages/clipboard-page/clipboard.examples';
import { ClipboardPageComponent } from '../pages/clipboard-page/clipboard-page.component';
import { CSS_EXAMPLES } from '../pages/css-page/css.examples';
import { CssPageComponent } from '../pages/css-page/css-page.component';
import { FONT_IMPORT, fontFaces, ROBOTO_IMPORT, STYLES_USE } from '../pages/css-page/styles';
import { CDK_INSTALL, DASHBOARD_EXAMPLES, ENHANCED_TABLE_FILES } from '../pages/dashboard-page/dashboard.examples';
import { DashboardPageComponent } from '../pages/dashboard-page/dashboard-page.component';
import { EnhancedTableComponent } from '../pages/dashboard-page/examples/enhanced-table.component';
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
import { ICONS_EXAMPLES } from '../pages/icons-page/icons.examples';
import { IconsPageComponent } from '../pages/icons-page/icons-page.component';
import * as iconsSetup from '../pages/icons-page/setup';
import { LIST_EXAMPLES } from '../pages/list-page/list.examples';
import { ListPageComponent } from '../pages/list-page/list-page.component';
import * as linkSteps from '../pages/local-development/link-steps';
import { MENU_EXAMPLES } from '../pages/menu-page/menu.examples';
import { MenuPageComponent } from '../pages/menu-page/menu-page.component';
import { MONACO_EXAMPLES } from '../pages/monaco-page/monaco.examples';
import { MonacoPageComponent } from '../pages/monaco-page/monaco-page.component';
import { MONACO_ASSET } from '../pages/monaco-page/setup';
import { NAVBAR_EXAMPLES } from '../pages/navbar-page/navbar.examples';
import { NavbarPageComponent } from '../pages/navbar-page/navbar-page.component';
import { RADIO_BUTTONS_EXAMPLES } from '../pages/radio-buttons-page/radio-buttons.examples';
import { RadioButtonsPageComponent } from '../pages/radio-buttons-page/radio-buttons-page.component';
import { SCROLLER_EXAMPLES } from '../pages/scroller-page/scroller.examples';
import { ScrollerPageComponent } from '../pages/scroller-page/scroller-page.component';
import { SELECT_EXAMPLES } from '../pages/select-page/select.examples';
import { SelectPageComponent } from '../pages/select-page/select-page.component';
import { SNACKS_EXAMPLES } from '../pages/snacks-page/snacks.examples';
import { SnacksPageComponent } from '../pages/snacks-page/snacks-page.component';
import { TABCONTROL_EXAMPLES } from '../pages/tabcontrol-page/tabcontrol.examples';
import { TabcontrolPageComponent } from '../pages/tabcontrol-page/tabcontrol-page.component';
import { TABLE_EXAMPLES } from '../pages/table-page/table.examples';
import { TablePageComponent } from '../pages/table-page/table-page.component';
import { colorProperties, otherProperties } from '../pages/theming-page/theme-properties';
import { THEMING_EXAMPLES } from '../pages/theming-page/theming.examples';
import { ThemingPageComponent } from '../pages/theming-page/theming-page.component';
import { TOOLTIPS_EXAMPLES } from '../pages/tooltips-page/tooltips.examples';
import { TooltipsPageComponent } from '../pages/tooltips-page/tooltips-page.component';
import { TREE_EXAMPLES } from '../pages/tree-page/tree.examples';
import { TreePageComponent } from '../pages/tree-page/tree-page.component';
import { VIRTUALIZE_EXAMPLES } from '../pages/virtualize-page/virtualize.examples';
import { VirtualizePageComponent } from '../pages/virtualize-page/virtualize-page.component';
import { DocsCodeComponent } from './docs-code.component';
import { codeLanguage } from './docs-code-colours';
import type { DocsExample } from './docs-example';
import { DocsExampleComponent } from './docs-example.component';
import { MONACO_VS_PATH } from './docs-monaco.service';

// Each page with samples, which show their source, and the list of its samples. A new page with samples joins it
const PAGES: { name: string; page: Type<unknown>; examples: Record<string, DocsExample> }[] = [
  { name: 'getting started', page: GettingStartedPageComponent, examples: GETTING_STARTED_EXAMPLES },
  { name: 'dashboard', page: DashboardPageComponent, examples: DASHBOARD_EXAMPLES },
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
  { name: 'CSS & Fonts', page: CssPageComponent, examples: CSS_EXAMPLES },
  { name: 'icons', page: IconsPageComponent, examples: ICONS_EXAMPLES },
  { name: 'list', page: ListPageComponent, examples: LIST_EXAMPLES },
  { name: 'arrow scroller', page: ScrollerPageComponent, examples: SCROLLER_EXAMPLES },
  { name: 'tabs', page: TabcontrolPageComponent, examples: TABCONTROL_EXAMPLES },
  { name: 'tooltips', page: TooltipsPageComponent, examples: TOOLTIPS_EXAMPLES },
  { name: 'tree', page: TreePageComponent, examples: TREE_EXAMPLES },
  { name: 'virtualization', page: VirtualizePageComponent, examples: VIRTUALIZE_EXAMPLES },
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

  // The dashboard imports the enhanced table from its folder, so a copied dashboard needs its files
  it("shows the enhanced table's files on the dashboard page, every file the dashboard imports from its folder", async () => {
    const local = (ts: string) => [...ts.matchAll(/from '\.\/([^']+)'/g)].map(([, file]) => file);
    expect(local(DASHBOARD_EXAMPLES.dashboard.ts)).toEqual(['enhanced-table.component']);
    const [ts, html, scss] = ENHANCED_TABLE_FILES.map(file => file.source);
    expect(ENHANCED_TABLE_FILES.map(file => file.label)).toEqual(['enhanced-table.component.ts', 'enhanced-table.component.html', 'enhanced-table.component.scss']);
    expect(ts).toContain(`export class ${EnhancedTableComponent.name.replace(/^_/, '')}<`);
    expect(ts).toContain("templateUrl: './enhanced-table.component.html'");
    expect(ts).toContain("styleUrl: './enhanced-table.component.scss'");
    expect([html.trim(), scss.trim()].every(text => text.length > 0)).toBe(true);
    expect(local(ts)).toEqual([]);

    // what it moves columns with, which the page says to install, and the site has
    expect(ts).toContain("from '@angular/cdk/drag-drop'");
    // at the Angular major the library's peers name: the latest CDK would be a later Angular's
    expect(CDK_INSTALL).toBe(`npm install @angular/cdk@${/\d+/.exec(peerDependencies['@angular/core'])![0]}`);
    expect(Object.keys(dependencies)).toContain('@angular/cdk');

    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(DashboardPageComponent);
    await fixture.whenStable();
    const shown = fixture.debugElement.queryAll(By.directive(DocsCodeComponent)).map(element => (element.componentInstance as DocsCodeComponent).$source());
    expect(shown).toEqual(expect.arrayContaining([CDK_INSTALL, ts, html, scss]));
    fixture.destroy();
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

  // npm shows the README too, so its images are absolute URLs: the files in docs/assets, on main
  it('shows the logo and the dashboard in the README, light and dark, from docs/assets', () => {
    const assets = 'https://raw.githubusercontent.com/serionist/tableau-ui-angular/main/docs/assets/';
    const images = Array.from(readme.matchAll(/(?:src|srcset)="([^"]+)"/g), match => match[1]);
    expect(images).toEqual(['logo-dark.svg', 'logo-light.svg', 'dashboard-dark.png', 'dashboard-light.png'].map(file => assets + file));
    // the logos draw the name as outlines, so no font is needed
    for (const svg of [logoDarkSvg, logoLightSvg]) {
      expect(svg).toMatch(/^<svg /);
      expect(svg).not.toMatch(/<text|font-family|@font-face/);
    }
    // the screenshots: 1600 pixels wide, the width in a PNG's header, and under 300 kB
    for (const png of [dashboardDarkPng, dashboardLightPng]) {
      expect(new DataView(png.buffer, png.byteOffset).getUint32(16)).toBe(1600);
      expect(png.byteLength).toBeLessThan(300_000);
    }
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

  it("serves Monaco's files where the editor and the code blocks load them, with the angular.json entry the Monaco page shows", () => {
    const asset = JSON.parse(MONACO_ASSET) as { glob: string; input: string; output: string };
    expect(asset.input).toBe('node_modules/monaco-editor/min');
    expect(monacoEditorTs).toContain(`+ '${asset.output.replace(/^\//, '')}/vs'`);
    expect(MONACO_VS_PATH).toBe(`${asset.output.replace(/^\//, '')}/vs`);
    expect(projects['test-app'].architect.build.options.assets).toContainEqual(asset);
  });

  // A label that names no language leaves its block plain text
  it('labels every code block on every page with a language Monaco colours it in', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const labels = new Set<string>();
    for (const route of routes) {
      const page = (await (route.loadComponent as () => Promise<Type<unknown>>)()) as Type<unknown>;
      const fixture = TestBed.createComponent(page);
      await fixture.whenStable();
      for (const pre of (fixture.nativeElement as HTMLElement).querySelectorAll('app-docs-code pre')) {
        labels.add(pre.getAttribute('aria-label') ?? '');
      }
      fixture.destroy();
    }

    expect(labels.size).toBeGreaterThan(5);
    expect([...labels].filter(label => codeLanguage(label) === undefined)).toEqual([]);
  });

  it('runs the used-icons script on the icons page as on the getting started page and the site, with what the script reads', () => {
    const pageScripts = (JSON.parse(iconsSetup.ICONS_SCRIPTS) as { scripts: Record<string, string> }).scripts;
    const startedScripts = (JSON.parse(ICONS_SCRIPTS) as { scripts: Record<string, string> }).scripts;
    const output = 'public/icons';
    const command = `node node_modules/tableau-ui-angular/${ICONS_SCRIPT} src/icons.ts ${output}`;
    expect(pageScripts['icons']).toBe(command);
    expect(startedScripts['icons']).toBe(command);
    expect(pageScripts['prebuild']).toBe(startedScripts['prebuild']);
    expect(pageScripts['prebuild']).toBe('npm run icons');

    // the dev tools: the command installs the ones the site has, and the scripts run their binaries as the site's own do
    const [install, tools] = [iconsSetup.ICONS_TOOLS_INSTALL.slice(0, 23), iconsSetup.ICONS_TOOLS_INSTALL.slice(23).split(' ')];
    expect(install).toBe('npm install --save-dev ');
    expect(tools).toEqual(['chokidar-cli', 'concurrently']);
    expect(Object.keys(devDependencies)).toEqual(expect.arrayContaining(tools));
    const [chokidar, concurrently] = [Object.keys(chokidarBin)[0], Object.keys(concurrentlyBin)[0]];
    expect(pageScripts['icons:watch']).toBe(`npm run icons && ${chokidar} src/icons.ts -c "npm run icons"`);
    expect(scripts['test-app:watch-icons']).toMatch(new RegExp(` ${chokidar} "[^"]+" -c "npm run [\\w:-]+"$`));
    expect(pageScripts['start']).toBe(`${concurrently} "ng serve" "npm run icons:watch"`);
    expect(scripts.start).toMatch(new RegExp(`^${concurrently} "`));

    // the class the page names, which the script reads, the variable it says to set, the API the script asks without
    // it, and the CSS file it writes into the output folder, which the site's styles.scss uses
    expect(iconsSetup.ICONS_CLASS).toMatch(/^\w+$/);
    expect(iconsScript).toContain(`const { ${iconsSetup.ICONS_CLASS} } = loadTypeScriptFile(`);
    expect(iconsScript).toContain(`process.env.${iconsSetup.ICONS_CSS_URL_VARIABLE} || '${iconsSetup.ICONS_CSS_API}'`);
    expect(iconsScript).toContain(`path.join(outputFolder, '${iconsSetup.ICONS_CSS_FILE}')`);
    expect(iconsSetup.ICONS_CSS_USE).toBe(`@use '../${output}/${iconsSetup.ICONS_CSS_FILE}';`);
    expect(stylesScss).toContain(iconsSetup.ICONS_CSS_USE);

    // the package: the site has it, and its lines, commented; each style's file declares the font of its icon type
    expect(iconsSetup.MATERIAL_SYMBOLS_INSTALL).toBe('npm install material-symbols');
    expect(Object.keys(dependencies)).toContain('material-symbols');
    const styles: Record<string, string> = { rounded: roundedScss, outlined: outlinedScss, sharp: sharpScss };
    expect(iconsSetup.MATERIAL_SYMBOLS_USES.map(use => /^@use 'material-symbols\/(\w+)';$/.exec(use)?.[1])).toEqual(Object.keys(styles));
    for (const [style, scss] of Object.entries(styles)) {
      expect(stylesScss).toContain(`// @use 'material-symbols/${style}';`);
      expect(scss).toContain(`material-symbols-font('Material Symbols ${style[0].toUpperCase()}${style.slice(1)}')`);
    }
  });

  it("loads the styles and fonts on the CSS & Fonts page as the site's styles.scss does, and the font script downloads each file font-import loads", () => {
    for (const line of [STYLES_USE, FONT_IMPORT, ROBOTO_IMPORT]) {
      expect(stylesScss).toContain(line);
    }
    const faces = fontFaces();
    expect(faces.length).toBe(7);
    expect(faces.every(face => face.family && face.weight && face.style && face.file)).toBe(true);
    const loaded = new Set(faces.flatMap(face => [`${face.file}.woff2`, `${face.file}.woff`]));
    const downloaded = new Set([...fontsScript.matchAll(/'(BentonSans-[\w-]+\.woff2?)'/g)].map(([, file]) => file));
    expect(downloaded).toEqual(loaded);
  });

  it('shows the steps npm run dev:link prints on the local development page', () => {
    expect(linkSteps.DEV_LINK).toBe('npm run dev:link');
    expect(scripts['dev:link']).toContain('node scripts/link-info.js');
    // the JSON the page shows is in what the script prints, whitespace aside
    const squash = (text: string) => text.replace(/\s+/g, '');
    const { architect } = (JSON.parse(linkSteps.ANGULAR_JSON) as { projects: Record<string, { architect: unknown }> }).projects['[your-app]'];
    expect(squash(linkInfo)).toContain(JSON.stringify({ architect }).slice(1, -1));
    expect(squash(linkInfo)).toContain(JSON.stringify(JSON.parse(linkSteps.TSCONFIG_JSON)).slice(1, -1));
    expect(linkInfo).toContain(linkSteps.LINK_INSTALL);
    // the npx link line: the checkout's packages, then the library's build, where ng-package.json puts it
    expect(linkInfo).toContain(`npx link ${linkSteps.LINKED_PACKAGES.map(name => `\${modulePath("${name}")}`).join(' ')} \${distPath}`);
    expect(linkInfo).toContain("path.resolve(__dirname, '..', 'dist', 'component-library')");
    expect(dest).toBe('../../dist/component-library');
    expect(linkInfo).toMatch(new RegExp(`run:\\s+${linkSteps.UNLINK}\\s`));
  });
});
