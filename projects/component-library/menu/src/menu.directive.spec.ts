import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axeViolations } from '../../testing/axe';
import { movePointerAway } from '../../testing/pointer';
import { TableauUiMenuModule } from './tableau-ui-menu.module';

@Component({
  imports: [TableauUiMenuModule],
  template: `
    @if ($shown()) {
      <button type="button" [attachedMenu]="help" [autoOpenClose]="$auto()">Help</button>
      <ng-template #help="menu" menu>
        <a href="#docs">Read the docs</a>
      </ng-template>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HelpComponent {
  readonly $shown = signal(true);
  readonly $auto = signal(true);
}

describe('MenuDirective', () => {
  // a pointer left over an opening dropdown or menu would move its highlight
  beforeEach(movePointerAway);

  async function render() {
    const fixture = TestBed.createComponent(HelpComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const popup = () => document.querySelector<HTMLElement>('.dialog-container');
    return { fixture, host, trigger: host.querySelector('button')!, popup, component: fixture.componentInstance };
  }

  afterEach(() => {
    document.querySelectorAll('.dialog-container, .dialog-backdrop').forEach(element => element.remove());
  });

  // The element a menu is attached to says whether its popup is open; only a button menu, of menu items, is a menu
  it('tells assistive technology whether its popup is open', async () => {
    const { fixture, trigger, popup } = await render();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-haspopup')).toBeNull();

    trigger.click();
    await fixture.whenStable();
    expect(popup()?.textContent).toContain('Read the docs');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    document.querySelector<HTMLElement>('.dialog-backdrop')!.click();
    await fixture.whenStable();
    expect(popup()).toBeNull();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  // F57: bind made a new handler each time, so removeEventListener missed and autoOpenClose could not be turned off
  it('stops opening on click once autoOpenClose is turned off', async () => {
    const { fixture, trigger, popup, component } = await render();
    component.$auto.set(false);
    await fixture.whenStable();

    trigger.click();
    await fixture.whenStable();

    expect(popup()).toBeNull();
  });

  // F52: an open menu outlived its owner after a route change, backdrop included
  it('closes when it is destroyed', async () => {
    const { fixture, trigger, popup, component } = await render();
    trigger.click();
    await fixture.whenStable();
    expect(popup()).not.toBeNull();

    component.$shown.set(false);
    await fixture.whenStable();

    expect(popup()).toBeNull();
    expect(document.querySelector('.dialog-backdrop')).toBeNull();
  });

  it('passes axe, closed and open', async () => {
    const { fixture, host, trigger } = await render();
    expect(await axeViolations(host)).toEqual([]);

    trigger.click();
    await fixture.whenStable();

    expect(await axeViolations(host)).toEqual([]);
  });
});
