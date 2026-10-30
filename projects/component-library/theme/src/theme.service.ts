import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT, inject, Injectable, PLATFORM_ID } from '@angular/core';
import type { ThemeConfig } from './theme.config';
import { toSignal } from '@angular/core/rxjs-interop';
import type { Observable } from 'rxjs';
import { BehaviorSubject, combineLatest, map } from 'rxjs';

/**
 * The theme: the colour mode (`auto` follows the system's) and the font size, kept in the browser's storage.
 *
 * Call `initialize()` once when the app starts, in the browser, such as in the root component's constructor or in
 * `provideAppInitializer(() => inject(ThemeService).initialize())`. Until then the page stays light at the default font
 * size and no change is stored, though `$theme`, `$appliedThemeMode` and the setters work.
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  // The theme lives in the browser: its storage, its colour scheme and the page it styles. On the server the theme is
  // the default, the scheme light, and initialize() changes nothing.
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  // Namespaced, so another script's value under a common name is neither read nor overwritten
  private readonly themeKey = 'tableau-ui-angular:theme';
  // The key before 0.2.0, read when the new one holds nothing, so a user keeps the theme they chose
  private readonly legacyThemeKey = 'theme-config';
  private readonly defaultTheme: Readonly<ThemeConfig> = {
    fontSize: '12px',
    mode: 'auto',
  };

  private readonly _theme$ = new BehaviorSubject<ThemeConfig>(this.getInitialTheme());
  public get theme$(): Observable<ThemeConfig> {
    return this._theme$;
  }
  private readonly autoColor$ = new BehaviorSubject<'dark' | 'light'>(this.prefersDark()?.matches === true ? 'dark' : 'light');
  readonly $theme = toSignal(this._theme$, {
    initialValue: this._theme$.value,
  });

  readonly appliedThemeMode$ = combineLatest([this._theme$, this.autoColor$]).pipe(
    map(([theme, autoColor]) => {
      return this.getAppliedThemeMode(theme, autoColor);
    }),
  );
  readonly $appliedThemeMode = toSignal(this.appliedThemeMode$, { initialValue: this.getAppliedThemeMode(this._theme$.value, this.autoColor$.value) });

  private getAppliedThemeMode(theme: ThemeConfig, autoColor: 'dark' | 'light'): 'dark' | 'light' {
    return theme.mode === 'auto' ? autoColor : theme.mode;
  }
  private prefersDark(): MediaQueryList | undefined {
    return this.isBrowser ? this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)') : undefined;
  }
  /**
   * Applies the theme to the page and keeps it applied: the `dark-mode` class and `color-scheme` on the root element
   * and the body, the font size in `--twc-font-size-body`, a change of the system's mode while the mode is `auto`, and
   * each change stored for the next visit. Call it once, in the browser; on the server it does nothing.
   */
  initialize() {
    if (!this.isBrowser) {
      return;
    }
    // the injected document, which the rest of this method styles
    const { document } = this;
    this.prefersDark()?.addEventListener('change', e => {
      if (e.matches) {
        this.autoColor$.next('dark');
      } else {
        this.autoColor$.next('light');
      }
    });

    this._theme$.subscribe(theme => {
      this.storeTheme(theme);
    });

    combineLatest([this._theme$, this.autoColor$]).subscribe(([theme, autoColor]) => {
      const dark = this.getAppliedThemeMode(theme, autoColor) === 'dark';
      // The root element too, so the page's own background, its scrollbars and the variables set on :root follow
      for (const element of [document.documentElement, document.body]) {
        element.classList.toggle('dark-mode', dark);
        element.style.colorScheme = dark ? 'dark' : 'light';
      }
      const { fontSize } = theme;
      document.documentElement.style.setProperty('--twc-font-size-body', fontSize);
    });
  }

  // Each change is a new object, so $theme and the computeds that read it update
  setColorMode(mode: 'auto' | 'dark' | 'light') {
    this._theme$.next({ ...this._theme$.value, mode });
  }
  setFontSize(fontSize: string) {
    this._theme$.next({ ...this._theme$.value, fontSize });
  }
  reset() {
    this._theme$.next({ ...this.defaultTheme });
  }

  private getInitialTheme(): ThemeConfig {
    return this.readStoredTheme(this.themeKey) ?? this.readStoredTheme(this.legacyThemeKey) ?? { ...this.defaultTheme };
  }

  // A value that is no theme, or storage the browser blocks, gives no theme: the default applies, and nothing throws
  private readStoredTheme(key: string): ThemeConfig | undefined {
    if (!this.isBrowser) {
      return undefined;
    }
    let stored: unknown;
    try {
      const text = this.document.defaultView?.localStorage.getItem(key) ?? null;
      stored = text === null ? undefined : JSON.parse(text);
    } catch {
      return undefined;
    }
    if (typeof stored !== 'object' || stored === null) {
      return undefined;
    }
    const { fontSize, mode } = stored as Partial<Record<keyof ThemeConfig, unknown>>;
    return {
      fontSize: typeof fontSize === 'string' ? fontSize : this.defaultTheme.fontSize,
      mode: mode === 'auto' || mode === 'dark' || mode === 'light' ? mode : this.defaultTheme.mode,
    };
  }

  private storeTheme(theme: ThemeConfig) {
    try {
      this.document.defaultView?.localStorage.setItem(this.themeKey, JSON.stringify(theme));
    } catch {
      // blocked or full storage: the theme still applies, for this visit only
    }
  }
}
