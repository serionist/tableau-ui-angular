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
  { path: '**', renderMode: RenderMode.Client },
];
