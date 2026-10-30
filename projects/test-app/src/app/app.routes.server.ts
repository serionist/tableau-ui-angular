import type { ServerRoute } from '@angular/ssr';
import { RenderMode } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Every page is prerendered: its components render on the server. A path the app has no page for renders on the
  // client, from the shell.
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'local-development', renderMode: RenderMode.Prerender },
  { path: 'checkbox', renderMode: RenderMode.Prerender },
  { path: 'radios', renderMode: RenderMode.Prerender },
  { path: 'form-fields', renderMode: RenderMode.Prerender },
  { path: 'select', renderMode: RenderMode.Prerender },
  { path: 'list', renderMode: RenderMode.Prerender },
  { path: 'chips', renderMode: RenderMode.Prerender },
  { path: 'menu', renderMode: RenderMode.Prerender },
  { path: 'date-picker', renderMode: RenderMode.Prerender },
  { path: 'buttons', renderMode: RenderMode.Prerender },
  { path: 'dialogs', renderMode: RenderMode.Prerender },
  { path: 'snackbar', renderMode: RenderMode.Prerender },
  { path: 'tooltips', renderMode: RenderMode.Prerender },
  { path: 'expansion-panel', renderMode: RenderMode.Prerender },
  { path: 'tabcontrol', renderMode: RenderMode.Prerender },
  { path: 'navbar', renderMode: RenderMode.Prerender },
  { path: 'tree', renderMode: RenderMode.Prerender },
  { path: 'drawer', renderMode: RenderMode.Prerender },
  { path: 'scroller', renderMode: RenderMode.Prerender },
  { path: 'table', renderMode: RenderMode.Prerender },
  { path: 'virtualize', renderMode: RenderMode.Prerender },
  { path: 'monaco', renderMode: RenderMode.Prerender },
  { path: 'css', renderMode: RenderMode.Prerender },
  { path: 'icons', renderMode: RenderMode.Prerender },
  { path: 'clipboard', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Client },
];
