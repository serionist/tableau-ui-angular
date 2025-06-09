import type { ApplicationConfig } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { ThemeService } from 'tableau-ui-angular/theme';

export const appConfig: ApplicationConfig = {
    providers: [provideZonelessChangeDetection(), provideRouter(routes), ThemeService],
};
