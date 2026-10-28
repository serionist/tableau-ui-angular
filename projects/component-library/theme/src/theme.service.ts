import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT, inject, Injectable, PLATFORM_ID } from '@angular/core';
import type { ThemeConfig } from './theme.config';
import { toSignal } from '@angular/core/rxjs-interop';
import type { Observable } from 'rxjs';
import { BehaviorSubject, combineLatest, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  // The theme lives in the browser: its storage, its colour scheme and the page it styles. On the server the theme is
  // the default, the scheme light, and initialize() changes nothing.
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly themeKey = 'theme-config';
  private readonly defaultTheme: ThemeConfig = {
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
      document.defaultView?.localStorage.setItem(this.themeKey, JSON.stringify(theme));
      document.documentElement.style.setProperty('--twc-font-size', theme.fontSize);
    });

    combineLatest([this._theme$, this.autoColor$]).subscribe(([theme, autoColor]) => {
      const color = theme.mode === 'auto' ? autoColor : theme.mode;
      switch (color) {
        case 'dark':
          {
            if (!document.body.classList.contains('dark-mode')) {
              document.body.classList.add('dark-mode');
            }
            document.body.style.colorScheme = 'dark';
          }
          break;
        case 'light':
          {
            if (document.body.classList.contains('dark-mode')) {
              document.body.classList.remove('dark-mode');
            }
            document.body.style.colorScheme = 'light';
          }
          break;
      }
      const { fontSize } = theme;
      document.documentElement.style.setProperty('--twc-font-size-body', fontSize);
    });
  }

  setColorMode(mode: 'auto' | 'dark' | 'light') {
    const theme = this._theme$.value;
    theme.mode = mode;
    this._theme$.next(theme);
  }
  setFontSize(fontSize: string) {
    const theme = this._theme$.value;
    theme.fontSize = fontSize;
    this._theme$.next(theme);
  }
  reset() {
    this._theme$.next(this.defaultTheme);
  }

  private getInitialTheme(): ThemeConfig {
    const storedTheme = this.isBrowser ? (this.document.defaultView?.localStorage.getItem(this.themeKey) ?? null) : null;
    if (storedTheme !== null) {
      const t = JSON.parse(storedTheme) as Partial<ThemeConfig>;
      t.fontSize = t.fontSize ?? '12px';
      t.mode = t.mode ?? 'auto';
      return t as ThemeConfig;
    } else {
      return this.defaultTheme;
    }
  }
}
