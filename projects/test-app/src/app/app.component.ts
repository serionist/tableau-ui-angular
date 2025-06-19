import { ChangeDetectionStrategy, Component, computed, inject, viewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import type { Observable } from 'rxjs';
import { filter, map } from 'rxjs';
import { version as LibVersion } from '../../../component-library/package.json';
import { ThemeService } from 'tableau-ui-angular/theme';
import { CommonModule } from '@angular/common';
import { TableauUiNavBarModule } from 'tableau-ui-angular/nav-bar';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiFormFieldModule } from 'tableau-ui-angular/form-field';
import { TableauUiButtonToggleModule } from 'tableau-ui-angular/button-toggle';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import type { MenuDirective } from 'tableau-ui-angular/menu';
import { TableauUiMenuModule } from 'tableau-ui-angular/menu';
@Component({
    selector: 'app-root',
    imports: [CommonModule, RouterModule, TableauUiNavBarModule, TableauUiIconModule, TableauUiCommonModule, TableauUiMenuModule, TableauUiButtonModule, TableauUiButtonToggleModule, TableauUiFormFieldModule],
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
    public router = inject(Router);
    public route = inject(ActivatedRoute);
    readonly page$: Observable<string | null> = this.router.events.pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => this.findRouteData(this.route.root, 'page')),
    );

    readonly themeService = inject(ThemeService);

    constructor() {
        this.themeService.initialize();
    }

    version = LibVersion;
    // Recursive function to search route tree for specified data key
    private findRouteData(route: ActivatedRoute, key: string): string | null {
        let child: ActivatedRoute | null = route;
        while (child) {
            if (key in child.snapshot.data) {
                return child.snapshot.data[key] as string;
            }
            child = child.firstChild;
        }
        return null;
    }

    readonly $paletteMenu = viewChild.required<MenuDirective>('paletteMenu');
    readonly $paletteTheme = computed(() => this.themeService.$theme().mode);
    paletteThemeChange = (val: 'auto' | 'dark' | 'light') => {
        this.themeService.setColorMode(val);
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
