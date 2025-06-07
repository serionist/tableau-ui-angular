import { ChangeDetectionStrategy, Component, computed, inject, OnInit, TemplateRef, viewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet, RouterState } from '@angular/router';
import { filter, map, Observable, switchMap } from 'rxjs';
import { version as LibVersion } from '../../../component-library/package.json';
import { MenuComponent, ThemeService } from 'component-library';

@Component({
    selector: 'app-root',
    standalone: false,
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
    public router = inject(Router);
    public route = inject(ActivatedRoute);
    readonly page$: Observable<string> = this.router.events.pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => this.findRouteData(this.route.root, 'page')),
    );

    readonly themeService = inject(ThemeService);

    constructor() {
        this.themeService.initialize();
    }

    version = LibVersion;
    // Recursive function to search route tree for specified data key
    private findRouteData(route: ActivatedRoute, key: string): any {
        let child = route;
        while (child) {
            if (child.snapshot.data && key in child.snapshot.data) {
                return child.snapshot.data[key];
            }
            child = child.firstChild!;
        }
        return null;
    }

    readonly $paletteMenu = viewChild.required<MenuComponent>('paletteMenu');
    readonly $paletteTheme = computed(() => this.themeService.$theme().mode);
    paletteThemeChange = (theme: 'light' | 'dark' | 'auto') => {
        this.themeService.setColorMode(theme);
    };
    readonly $paletteFontSize = computed(() => +this.themeService.$theme().fontSize.replace('px', ''));
    setPaletteFontSize = (event: Event) => {
        const size = +(event.target as HTMLInputElement).value;
        if (size < 10 || size > 24) {
            return;
        }
        this.themeService.setFontSize(size + 'px');
    };
}
