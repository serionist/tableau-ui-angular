import type { ServerRoute } from '@angular/ssr';
import { RenderMode } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    // Every route renders on the client until the app shell can render on the server: its theme service reads window
    path: '**',
    renderMode: RenderMode.Client,
  },
];
