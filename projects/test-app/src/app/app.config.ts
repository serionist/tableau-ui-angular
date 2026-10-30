import type { ApplicationConfig } from '@angular/core';
import { inject, provideAppInitializer, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ThemeService } from 'tableau-ui-angular/theme';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    // Applies the stored theme before the first render, and keeps it applied; on the server it does nothing
    provideAppInitializer(() => {
      inject(ThemeService).initialize();
    }),
  ],
};
