import { Injectable } from '@angular/core';
import type { ThemeConfig } from './theme.config';
import { toSignal } from '@angular/core/rxjs-interop';
import type { Observable } from 'rxjs';
import { BehaviorSubject, combineLatest } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    private readonly themeKey = 'theme-config';
    private readonly defaultTheme: ThemeConfig = {
        fontSize: '12px',
        mode: 'auto',
    };

    private readonly _theme$ = new BehaviorSubject<ThemeConfig>(this.getInitialTheme());
    public get theme$(): Observable<ThemeConfig> {
        return this._theme$;
    }
    private readonly autoColor$ = new BehaviorSubject<'dark' | 'light'>(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    readonly $theme = toSignal(this._theme$, {
        initialValue: this._theme$.value,
    });

    initialize() {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (e.matches) {
                this.autoColor$.next('dark');
            } else {
                this.autoColor$.next('light');
            }
        });

        this._theme$.subscribe((theme) => {
            localStorage.setItem(this.themeKey, JSON.stringify(theme));
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
                    }
                    break;
                case 'light':
                    {
                        if (document.body.classList.contains('dark-mode')) {
                            document.body.classList.remove('dark-mode');
                        }
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
        const storedTheme = localStorage.getItem(this.themeKey);
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
