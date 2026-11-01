import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
import { axeViolations } from '../../testing/axe';
import { TableauUiNavBarModule } from './tableau-ui-nav-bar.module';

@Component({
  imports: [TableauUiNavBarModule, TableauUiIconModule],
  template: `
    <tab-nav-bar [(expanded)]="$expanded">
      <tab-nav-bar-button text="Home" link="/home" [isActive]="true" (click)="clicks.push('Home')">
        <tab-icon value="home" />
      </tab-nav-bar-button>
      <tab-nav-bar-button text="Help" (click)="clicks.push('Help')">
        <tab-icon value="help" />
      </tab-nav-bar-button>
      <tab-nav-bar-button text="Admin" link="/admin" [disabled]="true" (click)="clicks.push('Admin')">
        <tab-icon value="lock" />
      </tab-nav-bar-button>
      <tab-nav-bar-button text="Settings" [disabled]="true" (click)="clicks.push('Settings')">
        <tab-icon value="settings" />
      </tab-nav-bar-button>
      @if ($later()) {
        <tab-nav-bar-button text="Later" link="/later">
          <tab-icon value="schedule" />
        </tab-nav-bar-button>
      }
    </tab-nav-bar>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class NavHostComponent {
  readonly $expanded = signal(true);
  readonly $later = signal(false);
  readonly clicks: string[] = [];
}

// An app shell shorter than its nav bar's buttons, which the bar scrolls
@Component({
  imports: [TableauUiNavBarModule, TableauUiIconModule],
  template: `
    <div style="display: flex; height: 200px">
      <tab-nav-bar [(expanded)]="$expanded">
        @for (page of pages; track page) {
          <tab-nav-bar-button [text]="page" [link]="'/' + page">
            <tab-icon value="article" />
          </tab-nav-bar-button>
        }
      </tab-nav-bar>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ShortShellComponent {
  readonly $expanded = signal(true);
  readonly pages = Array.from({ length: 40 }, (_, i) => `page-${i + 1}`);
}

// A shell with a logo above the buttons and a version below them, the footer only while the bar is expanded
@Component({
  imports: [TableauUiNavBarModule, TableauUiIconModule],
  template: `
    <tab-nav-bar #bar>
      @if (bar.$expanded()) {
        <tab-nav-bar-footer><span class="version">v1.2.3</span></tab-nav-bar-footer>
      }
      <tab-nav-bar-header><span class="logo">Logo</span></tab-nav-bar-header>
      <tab-nav-bar-button text="Home" link="/home">
        <tab-icon value="home" />
      </tab-nav-bar-button>
    </tab-nav-bar>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class BrandedShellComponent {}

// Two bars, one whose header follows it and one whose header the app holds open
@Component({
  imports: [TableauUiNavBarModule],
  template: `
    <tab-nav-bar class="follows" [(expanded)]="$expanded">
      <tab-nav-bar-header>Logo</tab-nav-bar-header>
    </tab-nav-bar>
    <tab-nav-bar class="held" [(expanded)]="$expanded">
      <tab-nav-bar-header [expanded]="$held()">Logo</tab-nav-bar-header>
    </tab-nav-bar>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HeaderShellComponent {
  readonly $expanded = signal(true);
  readonly $held = signal<boolean | undefined>(true);
}

describe('NavBarComponent', () => {
  beforeEach(() => {
    // any path navigates, so a link's click lands somewhere
    TestBed.configureTestingModule({ providers: [provideRouter([{ path: '**', children: [] }])] });
  });

  async function render() {
    const fixture = TestBed.createComponent(NavHostComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    // the link or button inside the tab-nav-bar-button whose text input is `text`
    const item = (text: string) => Array.from(host.querySelectorAll('tab-nav-bar-button')).find(button => button.getAttribute('text') === text)!.firstElementChild as HTMLElement;
    // the texts in sight
    const texts = () => Array.from(host.querySelectorAll('tab-nav-bar-button span:not(.collapsed)'), span => span.textContent.trim());
    const toggle = host.querySelector<HTMLButtonElement>('.menu-toggle-button button')!;
    return { fixture, host, item, texts, toggle, component: fixture.componentInstance };
  }

  // F69: the bar told its buttons its state once, after its content, and then only on its own toggle, so a button
  // added later or the app's [expanded] left them out of step
  it("keeps every button in step with the bar's expanded state", async () => {
    const { fixture, texts, toggle, component } = await render();
    expect(texts()).toEqual(['Home', 'Help', 'Admin', 'Settings']);

    component.$later.set(true);
    await fixture.whenStable();
    expect(texts()).toEqual(['Home', 'Help', 'Admin', 'Settings', 'Later']);

    component.$expanded.set(false);
    await fixture.whenStable();
    expect(texts()).toEqual([]);

    toggle.click();
    await fixture.whenStable();
    expect(component.$expanded()).toBe(true);
    expect(texts()).toEqual(['Home', 'Help', 'Admin', 'Settings', 'Later']);
  });

  // F70: an output named click fired with the native click, so a handler ran twice, and also when disabled; and with
  // no link the button was an <a> without href, which the keyboard can't reach
  it('runs (click) once, never while disabled, and is a button without a link', async () => {
    const { fixture, item, component } = await render();
    const router = TestBed.inject(Router);

    item('Home').click();
    item('Help').click();
    item('Admin').click();
    item('Settings').click();
    await fixture.whenStable();

    expect(component.clicks).toEqual(['Home', 'Help']);
    expect(router.url).toBe('/home');
    expect(item('Help').tagName).toBe('BUTTON');
    expect((item('Help') as HTMLButtonElement).type).toBe('button');
    item('Help').focus();
    expect(document.activeElement).toBe(item('Help'));
    expect(item('Settings').getAttribute('aria-disabled')).toBe('true');
    // a disabled link has no href, and says it is a disabled link
    expect(item('Admin').hasAttribute('href')).toBe(false);
    expect(item('Admin').getAttribute('role')).toBe('link');
    expect(item('Admin').getAttribute('aria-disabled')).toBe('true');
  });

  // A collapsed bar shows only icons, which are hidden from screen readers, so its links had no name; and its toggle
  // (F82) said nothing of the bar's state
  it('keeps each button named by its text when collapsed, and passes axe both ways', async () => {
    const { fixture, host, texts, toggle, component } = await render();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(await axeViolations(host)).toEqual([]);

    component.$expanded.set(false);
    await fixture.whenStable();

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(texts()).toEqual([]);
    expect(Array.from(host.querySelectorAll('tab-nav-bar-button span'), span => span.textContent.trim())).toEqual(['Home', 'Help', 'Admin', 'Settings']);
    expect(await axeViolations(host)).toEqual([]);
  });

  // The toggle keeps one name, and aria-expanded alone tells whether the bar is open; the active page's button says so
  it('names its toggle once, and marks the current page', async () => {
    const { fixture, item, toggle, component } = await render();
    const name = () => toggle.querySelector('tab-icon')?.getAttribute('aria-label');
    expect(name()).toBe('Menu');

    component.$expanded.set(false);
    await fixture.whenStable();

    expect(name()).toBe('Menu');
    expect(item('Home').getAttribute('aria-current')).toBe('page');
    expect(['Help', 'Admin', 'Settings'].map(text => item(text).getAttribute('aria-current'))).toEqual([null, null, null]);
  });

  // The collapsed text was placed against the page, so the hidden texts of the buttons below a short shell made the
  // page itself scroll, onto blank space
  it('keeps the page the same height when it collapses in a short shell', async () => {
    const fixture = TestBed.createComponent(ShortShellComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const expanded = document.documentElement.scrollHeight;

    fixture.componentInstance.$expanded.set(false);
    await fixture.whenStable();
    await new Promise(resolve => {
      requestAnimationFrame(resolve);
    });

    expect((fixture.nativeElement as HTMLElement).querySelectorAll('tab-nav-bar-button span.collapsed').length).toBe(40);
    expect(document.documentElement.scrollHeight).toBe(expanded);
  });

  it('shows its header above the buttons and its footer below them, wherever they sit in its content', async () => {
    const fixture = TestBed.createComponent(BrandedShellComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const top = (selector: string) => host.querySelector(selector)!.getBoundingClientRect().top;

    expect(top('.logo')).toBeLessThan(top('tab-nav-bar-button'));
    expect(top('.version')).toBeGreaterThan(top('tab-nav-bar-button'));

    host.querySelector<HTMLButtonElement>('.menu-toggle-button button')!.click();
    await fixture.whenStable();
    expect(host.querySelector('.version')).toBeNull();
    expect(host.querySelector('.logo')).not.toBeNull();
  });

  // The header's expanded input was read by nothing, and the header didn't follow the bar
  it("gives its header the bar's state as its expanded attribute, unless the header's own [expanded] sets it", async () => {
    const fixture = TestBed.createComponent(HeaderShellComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const header = (bar: string) => host.querySelector(`tab-nav-bar.${bar} tab-nav-bar-header`)!.getAttribute('expanded');
    expect([header('follows'), header('held')]).toEqual(['true', 'true']);

    host.querySelector<HTMLButtonElement>('tab-nav-bar.follows .menu-toggle-button button')!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.$expanded()).toBe(false);
    expect([header('follows'), header('held')]).toEqual(['false', 'true']);

    fixture.componentInstance.$held.set(undefined);
    await fixture.whenStable();
    expect(header('held')).toBe('false');
  });
});
