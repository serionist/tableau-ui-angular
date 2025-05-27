import {
    effect,
    EffectRef,
    inject,
    Injectable,
    Injector,
    Renderer2,
    signal,
} from '@angular/core';
import { ThemeConfig } from './theme.config';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, combineLatest } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    private readonly themeKey = 'theme-config';
    private readonly theme$ = new BehaviorSubject<ThemeConfig>(
        this.getInitialTheme()
    );
    private readonly autoColor$ = new BehaviorSubject<'light' | 'dark'>(
        window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
    );
    readonly theme = toSignal(this.theme$, {
        initialValue: this.theme$.value
    });

    initialize() {
        window
            .matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', (e) => {
                if (e.matches) {
                    this.autoColor$.next('dark');
                } else {
                    this.autoColor$.next('light');
                }
            });

        this.theme$.subscribe((theme) => {
            console.log('Theme changed, saving:', theme);
            localStorage.setItem(this.themeKey, JSON.stringify(theme));
            document.documentElement.style.setProperty(
                '--twc-font-size',
                theme.fontSize
            );
        });

        combineLatest([this.theme$, this.autoColor$]).subscribe(
            ([theme, autoColor]) => {
                const color = theme.mode === 'auto' ? autoColor : theme.mode;
                switch (color) {
                    case 'dark':
                        {
                            if (
                                !document.body.classList.contains('dark-mode')
                            ) {
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
                const fontSize = theme.fontSize;
                document.documentElement.style.setProperty(
                    '--twc-font-size-body',
                    fontSize
                );
            }
        );
    }

    setColorMode(mode: 'light' | 'dark' | 'auto') {
        const theme = this.theme$.value;
        theme.mode = mode;
        this.theme$.next(theme)
    };
    setFontSize(fontSize: string) {
        const theme = this.theme$.value;
        theme.fontSize = fontSize;
        this.theme$.next(theme);
    }
    reset() {
        this.theme$.next(this.defaultTheme);
    }

    private readonly defaultTheme: ThemeConfig = {
        fontSize: '12px',
        mode: 'auto',
    };
    private getInitialTheme(): ThemeConfig {
        const storedTheme = localStorage.getItem(this.themeKey);
        if (storedTheme) {
            const t = JSON.parse(storedTheme) as Partial<ThemeConfig>;
            t.fontSize = t.fontSize ?? '12px';
            t.mode = t.mode ?? 'auto';
            return t as ThemeConfig;
        } else {
            return this.defaultTheme;
        }
    }
}
