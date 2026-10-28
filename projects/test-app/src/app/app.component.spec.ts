import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { routes } from './app.routes';

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
});
