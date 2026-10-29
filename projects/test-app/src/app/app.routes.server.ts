import type { ServerRoute } from '@angular/ssr';
import { RenderMode } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // The pages whose components render on the server are prerendered; the rest join as their components become safe
  // to render there, and render on the client until then.
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
  { path: '**', renderMode: RenderMode.Client },
];
