import { ChangeDetectionStrategy, Component, computed, PLATFORM_ID, ViewEncapsulation } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

// The library's styles, as an app imports them, in the page while it is rendered
@Component({
  template: '',
  styleUrl: '../../styles/lib-styles.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class LibStylesComponent {}

const KEY = 'tableau-ui-angular:theme';

describe('ThemeService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.removeItem(KEY);
    localStorage.removeItem('theme-config');
    for (const element of [document.documentElement, document.body]) {
      element.classList.remove('dark-mode');
      element.style.removeProperty('color-scheme');
    }
    document.documentElement.style.removeProperty('--twc-font-size-body');
  });

  // The server has no window: its fields read matchMedia and localStorage, so the demo app's shell could not prerender
  it('starts and initializes on the server without the window', () => {
    const matchMedia = vi.spyOn(window, 'matchMedia');
    const getItem = vi.spyOn(Storage.prototype, 'getItem');
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });

    const theme = TestBed.inject(ThemeService);
    theme.initialize();

    expect(matchMedia).not.toHaveBeenCalled();
    expect(getItem).not.toHaveBeenCalled();
    expect(setItem).not.toHaveBeenCalled();
    expect(theme.$theme()).toEqual({ fontSize: '12px', mode: 'auto' });
    expect(theme.$appliedThemeMode()).toBe('light');
  });

  it('applies the stored theme in the browser', () => {
    localStorage.setItem(KEY, JSON.stringify({ fontSize: '14px', mode: 'dark' }));

    const theme = TestBed.inject(ThemeService);
    theme.initialize();

    expect(theme.$appliedThemeMode()).toBe('dark');
    expect(document.body.classList.contains('dark-mode')).toBe(true);
    expect(document.documentElement.style.getPropertyValue('--twc-font-size-body')).toBe('14px');
  });

  // F122: the setters changed the theme object in place and emitted it again, so $theme kept the same object and
  // nothing that read it updated
  it('updates what reads $theme on each change', () => {
    const theme = TestBed.inject(ThemeService);
    const mode = computed(() => theme.$theme().mode);
    const fontSize = computed(() => theme.$theme().fontSize);
    expect([mode(), fontSize()]).toEqual(['auto', '12px']);

    theme.setColorMode('dark');
    expect(mode()).toBe('dark');

    theme.setFontSize('16px');
    expect([mode(), fontSize()]).toEqual(['dark', '16px']);
  });

  // F122: with nothing stored the theme was the default object itself, so a setter changed the default too
  it('resets to the default after a change', () => {
    const theme = TestBed.inject(ThemeService);
    theme.setColorMode('dark');
    theme.setFontSize('16px');

    theme.reset();

    expect(theme.$theme()).toEqual({ fontSize: '12px', mode: 'auto' });
  });

  // F128: a stored value that is no theme threw from the service's construction, so nothing that injects it rendered
  it.each([['not json'], ['null'], ['"dark"'], [JSON.stringify({ fontSize: 14, mode: 'black' })]])('starts from the default when storage holds %s', stored => {
    localStorage.setItem(KEY, stored);

    const theme = TestBed.inject(ThemeService);

    expect(theme.$theme()).toEqual({ fontSize: '12px', mode: 'auto' });
  });

  // F128: storage the browser blocks, as with site data turned off, throws on every read and write
  it('starts, applies and changes the theme when storage is blocked', () => {
    const blocked = () => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    };
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(blocked);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(blocked);

    const theme = TestBed.inject(ThemeService);
    theme.initialize();
    theme.setColorMode('dark');

    expect(theme.$theme()).toEqual({ fontSize: '12px', mode: 'dark' });
    expect(document.body.classList.contains('dark-mode')).toBe(true);
  });

  // F128: the key is the library's own, so another script's 'theme-config' is not overwritten
  it("stores the theme under the library's key, and reads the old key once", () => {
    localStorage.setItem('theme-config', JSON.stringify({ fontSize: '14px', mode: 'dark' }));

    const theme = TestBed.inject(ThemeService);
    theme.initialize();
    theme.setFontSize('16px');

    expect(theme.$theme()).toEqual({ fontSize: '16px', mode: 'dark' });
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual({ fontSize: '16px', mode: 'dark' });
    expect(JSON.parse(localStorage.getItem('theme-config')!)).toEqual({ fontSize: '14px', mode: 'dark' });
  });

  // F130: dark mode was set on the body alone, so the page's own background, its scrollbars and the variables on
  // :root stayed light
  it('sets dark mode on the root element, whose background the styles then make dark', async () => {
    localStorage.setItem(KEY, JSON.stringify({ fontSize: '12px', mode: 'dark' }));
    const fixture = TestBed.createComponent(LibStylesComponent);
    await fixture.whenStable();

    TestBed.inject(ThemeService).initialize();

    const root = document.documentElement;
    expect(root.classList.contains('dark-mode')).toBe(true);
    expect(root.style.colorScheme).toBe('dark');
    expect(getComputedStyle(root).getPropertyValue('--twc-color-base').trim()).toBe('rgb(27, 27, 27)');
    expect(getComputedStyle(root).backgroundColor).toBe('rgb(27, 27, 27)');

    fixture.destroy();
    // the styles leave the page with the component, so no other spec runs under them
    expect(getComputedStyle(root).getPropertyValue('--twc-color-base')).toBe('');
  });

  // F131: the rule read var(twc-low-dpi-font-family), without the dashes, which the browser drops as invalid
  it('gives screens of 120 dpi or less the low-DPI font', async () => {
    const fixture = TestBed.createComponent(LibStylesComponent);
    await fixture.whenStable();

    const lowDpi = Array.from(document.styleSheets)
      .flatMap(sheet => {
        try {
          return Array.from(sheet.cssRules);
        } catch {
          return []; // another origin's sheet, which the page may not read
        }
      })
      .filter((rule): rule is CSSMediaRule => rule instanceof CSSMediaRule && rule.conditionText.includes('resolution'))
      .flatMap(rule => Array.from(rule.cssRules))
      .filter((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule && rule.selectorText === 'body');

    expect(lowDpi.map(rule => rule.style.getPropertyValue('font-family'))).toEqual(['var(--twc-low-dpi-font-family)']);
  });
});
