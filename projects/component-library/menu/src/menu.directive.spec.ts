import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { tabbable } from 'tabbable';
import { userEvent } from 'vitest/browser';
import { TableauUiButtonToggleModule } from 'tableau-ui-angular/button-toggle';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { DialogService } from 'tableau-ui-angular/dialog';
import { axeViolations } from '../../testing/axe';
import { movePointerAway } from '../../testing/pointer';
import { TableauUiMenuModule } from './tableau-ui-menu.module';

// A colour mode toggle, and a menu whose items change it, as the docs site's theming page has them
@Component({
  imports: [TableauUiMenuModule, TableauUiButtonToggleModule, TableauUiCommonModule],
  template: `
    <button type="button" class="before">Before</button>
    <tab-button-toggle aria-label="Colour mode" [(selectedValue)]="$mode">
      <tab-option value="light" text="Light" />
      <tab-option value="dark" text="Dark" />
    </tab-button-toggle>
    <button type="button" class="palette" [attachedMenu]="palette">Palette</button>
    <ng-template #palette="menu" menu>
      <button type="button" class="dark" (click)="$mode.set('dark')">Dark mode</button>
      <button type="button" class="light" (click)="$mode.set('light')">Light mode</button>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PaletteComponent {
  readonly $mode = signal<string | undefined>('light');
}

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

// A filter menu with a date, and a button that opens an app's dialog while the menu stays open
@Component({
  imports: [TableauUiMenuModule],
  template: `
    <button type="button" class="filters" [attachedMenu]="filters">Filters</button>
    <ng-template #filters="menu" menu>
      <input type="date" class="from" aria-label="From" />
      <button type="button" class="help" (click)="help()">Help</button>
    </ng-template>
    <button type="button" class="after">After</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FiltersComponent {
  private readonly dialogs = inject(DialogService);
  protected help() {
    this.dialogs.openDialog(NoteComponent, undefined);
  }
}

// An app's dialog that doesn't keep focus
@Component({
  selector: 'tab-test-note',
  template: `<button type="button" class="got-it">Got it</button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class NoteComponent {}

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

  async function renderPalette() {
    const fixture = TestBed.createComponent(PaletteComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const element = (selector: string) => document.querySelector<HTMLElement>(selector)!;
    // the toggle's Tab stops, by their text
    const stops = () => tabbable(host.querySelector('tab-button-toggle')!).map(stop => stop.textContent.trim());
    return { fixture, host, element, stops };
  }

  // Tab stayed in a menu because its trap set every Tab stop of the page to -1
  it('keeps Tab in an open menu, wrapping at either end, and leaves the Tab stops of the page as they are', async () => {
    const { fixture, element } = await renderPalette();
    await userEvent.click(element('.palette'));
    await fixture.whenStable();
    expect(element('.before').tabIndex).toBe(0);

    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(element('.dark'));
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(element('.light'));
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(element('.dark'));
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
    expect(document.activeElement).toBe(element('.light'));

    await userEvent.keyboard('{Escape}');
    await fixture.whenStable();
    expect(document.querySelector('.dialog-container')).toBeNull();
    expect(document.activeElement).toBe(element('.palette'));
  });

  // #125: the trap wrote the old Tab stops back as the menu closed, so a toggle whose value changed meanwhile kept its
  // old stop beside its new one
  it('leaves one Tab stop in a button toggle whose value changed while a menu was open', async () => {
    const { fixture, element, stops } = await renderPalette();
    expect(stops()).toEqual(['Light']);
    await userEvent.click(element('.palette'));
    await fixture.whenStable();

    await userEvent.click(element('.dark'));
    await fixture.whenStable();
    expect(stops()).toEqual(['Dark']);
    await userEvent.keyboard('{Escape}');
    await fixture.whenStable();

    expect(stops()).toEqual(['Dark']);
    element('.before').focus();
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement?.textContent.trim()).toBe('Dark');
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(element('.palette'));
  });

  // The trap moved Tab itself from stop to stop, so a date input's own fields lost it, and a dialog opened from the
  // menu, which doesn't keep focus, couldn't be reached
  it("leaves Tab to a date input's own fields in a menu, and takes it on to a dialog opened from the menu", async () => {
    const fixture = TestBed.createComponent(FiltersComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const element = (selector: string) => document.querySelector<HTMLElement>(selector)!;
    await userEvent.click(element('.filters'));
    await fixture.whenStable();

    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(element('.from'));
    // the date's fields take Tab, then the button after it
    let presses = 0;
    while (document.activeElement === element('.from') && presses < 5) {
      await userEvent.keyboard('{Tab}');
      presses++;
    }
    expect(document.activeElement).toBe(element('.help'));
    expect(presses).toBeGreaterThan(1);

    // Tab wraps at the menu's ends, with nothing opened above it
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(element('.from'));
    element('.help').focus();
    await userEvent.click(element('.help'));
    await fixture.whenStable();
    // the dialog the menu opened is next, then the menu's first again; Shift+Tab goes back
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(element('.got-it'));
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(element('.from'));
    element('.help').focus();
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(element('.got-it'));
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
    expect(document.activeElement).toBe(element('.help'));
    expect(element('.after').tabIndex).toBe(0);
  });

  it('passes axe, closed and open', async () => {
    const { fixture, host, trigger } = await render();
    expect(await axeViolations(host)).toEqual([]);

    trigger.click();
    await fixture.whenStable();

    expect(await axeViolations(host)).toEqual([]);
  });
});
