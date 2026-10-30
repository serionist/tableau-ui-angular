// The public API of tableau-ui-angular/theme, from its built typings. npm run api:update writes it; a change to it is named in the PR.

import * as i0 from '@angular/core';
import { Observable } from 'rxjs';

interface ThemeConfig {
  fontSize: string;
  mode: 'auto' | 'dark' | 'light';
}

export declare class ThemeService {
  get theme$(): Observable<ThemeConfig>;
  readonly $theme: import('@angular/core').Signal<ThemeConfig>;
  readonly appliedThemeMode$: Observable<'dark' | 'light'>;
  readonly $appliedThemeMode: import('@angular/core').Signal<'dark' | 'light'>;
  initialize(): void;
  setColorMode(mode: 'auto' | 'dark' | 'light'): void;
  setFontSize(fontSize: string): void;
  reset(): void;
  static ɵfac: i0.ɵɵFactoryDeclaration<ThemeService, never>;
  static ɵprov: i0.ɵɵInjectableDeclaration<any>;
}

export type { ThemeConfig };
