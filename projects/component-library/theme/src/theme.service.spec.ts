import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.removeItem('theme-config');
    document.body.classList.remove('dark-mode');
    document.body.style.removeProperty('color-scheme');
    document.documentElement.style.removeProperty('--twc-font-size');
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
    localStorage.setItem('theme-config', JSON.stringify({ fontSize: '14px', mode: 'dark' }));

    const theme = TestBed.inject(ThemeService);
    theme.initialize();

    expect(theme.$appliedThemeMode()).toBe('dark');
    expect(document.body.classList.contains('dark-mode')).toBe(true);
    expect(document.documentElement.style.getPropertyValue('--twc-font-size-body')).toBe('14px');
  });
});
