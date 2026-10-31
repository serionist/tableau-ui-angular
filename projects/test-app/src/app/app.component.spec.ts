import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { projects } from '../../../../angular.json';
import markSvg from '../../../../docs/assets/mark.svg?source' with { loader: 'text' };
import indexHtml from '../index.html?source' with { loader: 'text' };
import { AppComponent } from './app.component';
import { routes } from './app.routes';

// Each rectangle of a mark: its box, its corner, and whether it is a tint
function markRects(root: ParentNode): string[] {
  return Array.from(root.querySelectorAll('rect'), rect => {
    const box = ['x', 'y', 'width', 'height', 'rx'].map(name => rect.getAttribute(name)).join(' ');
    return `${box} ${rect.classList.contains('tile') || rect.hasAttribute('fill-opacity') ? 'tint' : 'solid'}`;
  });
}

describe('AppComponent', () => {
  it('links to every page from the nav bar', async () => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter(routes)],
    });
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    const links = Array.from(host.querySelectorAll('tab-nav-bar-button a[href]'), a => a.getAttribute('href'));
    expect(new Set(links)).toEqual(new Set(routes.map(route => `/${route.path}`)));
  });

  it("names the site in the nav bar's header beside the project's mark, and keeps the mark alone when the bar closes", async () => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter(routes)],
    });
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    const header = host.querySelector('tab-nav-bar-header');
    expect(header?.querySelector('.title')?.textContent).toBe('Tableau UI for Angular');
    // the mark is docs/assets/mark.svg's, which the favicon and the README's logo draw too
    const mark = header?.querySelector('svg.mark');
    expect(mark?.getAttribute('aria-hidden')).toBe('true');
    expect(markRects(mark!)).toEqual(markRects(new DOMParser().parseFromString(markSvg, 'image/svg+xml')));
    expect(markRects(mark!)).toHaveLength(6);

    host.querySelector<HTMLButtonElement>('.menu-toggle-button button')?.click();
    await fixture.whenStable();
    expect(header?.querySelector('.title')).toBeNull();
    expect(header?.querySelector('svg.mark')).toBe(mark);
  });

  it('uses the mark as the favicon, with an .ico for a browser that takes no SVG', () => {
    expect(projects['test-app'].architect.build.options.assets).toContainEqual({ glob: 'mark.svg', input: 'docs/assets', output: '/' });
    const icons = new DOMParser().parseFromString(indexHtml, 'text/html').querySelectorAll('link[rel="icon"]');
    // The .ico names 32x32 alone: Chromium keeps an .ico whose sizes cover 16 and 32 over the SVG, so a dark browser
    // would show the light .ico, never the mark's dark colours. The SVG names no size, so it fits every one.
    expect(Array.from(icons, link => [link.getAttribute('href'), link.getAttribute('type'), link.getAttribute('sizes')])).toEqual([
      ['favicon.ico', null, '32x32'],
      ['mark.svg', 'image/svg+xml', null],
    ]);
  });

  it('says in its footer that the library is not affiliated with Tableau or Salesforce', async () => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter(routes)],
    });
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();

    const footer = (fixture.nativeElement as HTMLElement).querySelector('footer');
    expect(footer?.textContent).toContain('Not affiliated with or endorsed by Tableau or Salesforce.');
  });
});
