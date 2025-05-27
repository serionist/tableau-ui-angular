import {
    effect,
    inject,
    Injectable,
    Injector,
    Renderer2,
    signal,
} from '@angular/core';
import { ThemeConfig } from './theme.config';
import { toObservable } from '@angular/core/rxjs-interop';

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    private readonly themeKey = 'theme-config';
    private readonly injector = inject(Injector);
    readonly theme = signal<ThemeConfig>(this.getInitialTheme(), {
        equal: (a, b) => a.mode === b.mode && a.fontSize === b.fontSize,
    });

    private readonly autoColor = signal<'light' | 'dark'>(
        window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
    );

    initialize() {
        window
            .matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', (e) => {
                if (e.matches) {
                    this.autoColor.set('dark');
                } else {
                    this.autoColor.set('light');
                }
            });

        effect(
            () => {
                const theme = this.theme();
                console.log('Theme changed, saving:', theme);
                localStorage.setItem(this.themeKey, JSON.stringify(theme));
                document.documentElement.style.setProperty(
                    '--twc-font-size',
                    theme.fontSize
                );
            },
            {
                injector: this.injector,
            }
        );
        effect(() => {
            const theme = this.theme();
            const autoColor = this.autoColor();
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
        });
    }

    private getInitialTheme(): ThemeConfig {
        const storedTheme = localStorage.getItem(this.themeKey);
        let themeConfig: ThemeConfig;
        if (storedTheme) {
            const t = JSON.parse(storedTheme) as Partial<ThemeConfig>;
            t.fontSize = t.fontSize ?? '12px';
            t.mode = t.mode ?? 'auto';
            return t as ThemeConfig;
        } else {
            return {
                fontSize: '12px',
                mode: 'auto',
            };
        }
    }
}
