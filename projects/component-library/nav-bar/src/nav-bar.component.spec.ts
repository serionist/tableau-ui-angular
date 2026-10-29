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
      <tab-nav-bar-button text="Home" link="/home" (click)="clicks.push('Home')">
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
});
