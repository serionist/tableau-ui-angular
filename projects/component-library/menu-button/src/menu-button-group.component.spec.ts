import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { userEvent } from 'vitest/browser';
import { DialogService, TableauUiDialogModule } from 'tableau-ui-angular/dialog';
import { TableauUiMenuModule } from 'tableau-ui-angular/menu';
import { axeViolations } from '../../testing/axe';
import { movePointerAway } from '../../testing/pointer';
import { MenuButtonGroupComponent } from './menu-button-group.component';
import { TableauUiMenuButtonModule } from './tableau-ui-menu-button.module';

@Component({
  imports: [TableauUiMenuModule, TableauUiMenuButtonModule],
  template: `
    <button type="button" [attachedMenu]="fileMenu">File</button>
    <ng-template #fileMenu="buttonMenu" buttonMenu>
      <tab-menu-button-group>
        @for (item of $items(); track item) {
          <tab-menu-button (clicked)="clicks.push(item)">{{ item }}</tab-menu-button>
        }
        <tab-menu-button [disabled]="true">Locked</tab-menu-button>
        <tab-menu-button [loading]="$saving()" (clicked)="clicks.push('Save')">Save</tab-menu-button>
        <tab-menu-button>
          Export
          <tab-menu-button (clicked)="clicks.push('PDF')">PDF</tab-menu-button>
          <tab-menu-button (clicked)="clicks.push('CSV')">CSV</tab-menu-button>
        </tab-menu-button>
      </tab-menu-button-group>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FileMenuComponent {
  readonly $items = signal(['New']);
  readonly $saving = signal(false);
  readonly clicks: string[] = [];
}

@Component({
  imports: [TableauUiMenuModule, TableauUiMenuButtonModule],
  template: `
    <button type="button" [attachedMenu]="recentMenu">Recent</button>
    <ng-template #recentMenu="buttonMenu" buttonMenu>
      <tab-menu-button-group>
        @for (item of $items(); track item) {
          <tab-menu-button>{{ item }}</tab-menu-button>
        }
      </tab-menu-button-group>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class RecentMenuComponent {
  // still loading
  readonly $items = signal<string[]>([]);
}

@Component({
  imports: [TableauUiMenuButtonModule],
  template: `
    <tab-menu-button-group>
      <tab-menu-button>Open</tab-menu-button>
    </tab-menu-button-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StandaloneMenuComponent {}

// A menu item that asks first, in a confirmation, as the docs dashboard's Reset does
@Component({
  imports: [TableauUiMenuModule, TableauUiMenuButtonModule, TableauUiDialogModule],
  template: `
    <button type="button" [attachedMenu]="resetMenu">Reset</button>
    <ng-template #resetMenu="buttonMenu" buttonMenu>
      <tab-menu-button-group>
        <tab-menu-button (clicked)="reset()">Reset to the default layout</tab-menu-button>
      </tab-menu-button-group>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ResetMenuComponent {
  private readonly dialogs = inject(DialogService);
  answer: Promise<boolean> | undefined;
  protected reset() {
    this.answer = this.dialogs.openConfirmationMessageDialog('Reset the layout?', 'This clears the layout you saved.', 'error', 'Reset', 'Cancel', 'cancel');
  }
}

describe('MenuButtonGroupComponent', () => {
  // a pointer left over an opening dropdown or menu would move its highlight
  beforeEach(movePointerAway);

  async function render<T>(component: new () => T) {
    const fixture = TestBed.createComponent(component);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const trigger = host.querySelector<HTMLButtonElement>('button')!;
    const group = () => document.querySelector<HTMLElement>('tab-menu-button-group');
    const groups = () => Array.from(document.querySelectorAll<HTMLElement>('.menu-group'));
    // an item's own text, without its submenu's arrow icon
    const name = (button: Element | null | undefined) => button?.querySelector('.button-content')?.textContent.trim();
    const item = (text: string) => Array.from(document.querySelectorAll<HTMLElement>('.menu-button')).find(button => name(button) === text)!;
    const active = () => name(document.getElementById(group()?.getAttribute('aria-activedescendant') ?? ''));
    // opens the menu, and waits for focus, and for the highlight focus gives the first item when there is one
    const open = async (first?: string) => {
      trigger.click();
      await fixture.whenStable();
      await vi.waitFor(() => {
        expect(document.activeElement).toBe(group());
        expect(active()).toBe(first);
      });
    };
    return { fixture, host, trigger, group, groups, item, active, open, component: fixture.componentInstance };
  }

  afterEach(() => {
    // a menu left open by a failed test would steal the next one's focus
    document.querySelectorAll('.dialog-container, .dialog-backdrop').forEach(element => element.remove());
  });

  // F42: the focused group had no menu role and no aria-activedescendant, so arrowing announced nothing
  it('is a menu whose aria-activedescendant follows the highlight, with menu items and a named submenu', async () => {
    const { fixture, trigger, group, groups, item, active, open, component } = await render(FileMenuComponent);
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    await open('New');

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(group()!.getAttribute('role')).toBe('menu');
    expect(['New', 'Locked', 'Save', 'Export'].map(name => item(name).getAttribute('role'))).toEqual(['menuitem', 'menuitem', 'menuitem', 'menuitem']);
    expect(item('Locked').getAttribute('aria-disabled')).toBe('true');
    expect(item('Export').getAttribute('aria-haspopup')).toBe('menu');
    expect(item('Export').getAttribute('aria-expanded')).toBe('false');

    // focus puts the highlight on the first item
    expect(active()).toBe('New');

    // the disabled item is skipped
    await userEvent.keyboard('{ArrowDown}');
    await fixture.whenStable();
    expect(active()).toBe('Save');

    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowRight}');
    await fixture.whenStable();
    expect(groups().length).toBe(2);
    expect(groups()[1].getAttribute('role')).toBe('menu');
    expect(groups()[1].getAttribute('aria-labelledby')).toBe(item('Export').id);
    expect(item('Export').getAttribute('aria-expanded')).toBe('true');
    expect(active()).toBe('PDF');

    await userEvent.keyboard('{Enter}');
    await fixture.whenStable();
    expect(component.clicks).toEqual(['PDF']);
    expect(group()).toBeNull();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  // F40: the stack was spliced in place, so the pure pipe kept a closed submenu on screen
  it('takes a closed submenu off the screen', async () => {
    const { fixture, groups, item, active, open } = await render(FileMenuComponent);
    await open('New');
    await userEvent.keyboard('{ArrowUp}');
    await userEvent.keyboard('{ArrowRight}');
    await fixture.whenStable();
    expect(groups().length).toBe(2);

    await userEvent.keyboard('{ArrowLeft}');
    await fixture.whenStable();

    expect(groups().length).toBe(1);
    expect(item('Export').getAttribute('aria-expanded')).toBe('false');
    expect(active()).toBe('Export');
  });

  // F39: each group subscribed to its menu's opened output again on every init and never let go, and the menu outlives
  // the groups it opens
  it('lets go of its menu when it is closed', async () => {
    const updates = vi.spyOn(MenuButtonGroupComponent.prototype, 'updateSizes');
    try {
      const { fixture, open } = await render(FileMenuComponent);
      await open('New');
      const first = updates.mock.contexts[0];
      await userEvent.keyboard('{Escape}');
      await fixture.whenStable();

      updates.mockClear();
      await open('New');

      expect(updates.mock.contexts.length).toBeGreaterThan(0);
      expect(updates.mock.contexts).not.toContain(first);
    } finally {
      updates.mockRestore();
    }
  });

  // F59: the keys the menu took still scrolled the page under it
  it('keeps the keys it handles from scrolling the page', async () => {
    const { group, open } = await render(FileMenuComponent);
    await open('New');
    // whether the menu took the key, so the browser does nothing with it
    const taken = (key: string) => !group()!.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

    // from New down to Save and Export, Space into its submenu, back out, in again, and up past the top of the submenu
    expect(['ArrowDown', 'ArrowDown', ' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp'].map(taken)).toEqual([true, true, true, true, true, true]);
  });

  // F60: an item still loading could be run again from the keyboard
  it('treats an item that is loading as disabled', async () => {
    const { fixture, item, open, component } = await render(FileMenuComponent);
    component.$saving.set(true);
    await open('New');

    // from New past Locked and the loading Save to Export, whose submenu Enter opens
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');
    await fixture.whenStable();
    expect(component.clicks).toEqual([]);

    item('Save').click();
    await fixture.whenStable();
    expect(component.clicks).toEqual([]);
    expect(item('Save').getAttribute('aria-disabled')).toBe('true');
  });

  // A screen reader may move focus onto an item itself; Enter then runs that item, not the one the menu highlights
  // The confirmation took the menu's group as the element to give focus back to, and the menu closed with it, so focus
  // fell to the page's top once the confirmation closed
  it("gives focus back to the menu's button when a confirmation its item opened closes, from the keyboard and the pointer", async () => {
    const { fixture, trigger, open, component } = await render(ResetMenuComponent);
    const cancel = () => Array.from(document.querySelectorAll<HTMLButtonElement>('dialog button')).find(button => button.textContent.trim() === 'Cancel');

    trigger.focus();
    await open('Reset to the default layout');
    await userEvent.keyboard('{Enter}');
    await fixture.whenStable();
    expect(document.activeElement).toBe(cancel());
    expect(document.querySelector('tab-menu-button-group')).toBeNull();
    await userEvent.keyboard('{Enter}');
    await expect(component.answer).resolves.toBe(false);
    expect(document.activeElement).toBe(trigger);

    await userEvent.click(trigger);
    await fixture.whenStable();
    await userEvent.click(Array.from(document.querySelectorAll<HTMLElement>('.menu-button')).find(button => button.textContent.includes('Reset to the default layout'))!);
    await fixture.whenStable();
    await userEvent.click(cancel()!);
    await expect(component.answer).resolves.toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it('runs an item that has focus itself on Enter', async () => {
    const { fixture, item, open, component } = await render(FileMenuComponent);
    await open('New');

    item('Save').focus();
    await userEvent.keyboard('{Enter}');
    await fixture.whenStable();

    expect(component.clicks).toEqual(['Save']);
  });

  // Round 1, B4: focus moving onto a submenu's item counted as leaving the menu, which closed the submenu under it
  it('runs a submenu item that has focus itself', async () => {
    const { fixture, item, active, open, component } = await render(FileMenuComponent);
    await open('New');
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowRight}');
    await fixture.whenStable();
    expect(active()).toBe('PDF');

    item('PDF').focus();
    await fixture.whenStable();
    await userEvent.keyboard('{Enter}');
    await fixture.whenStable();

    expect(component.clicks).toEqual(['PDF']);
  });

  // An item that is loading takes no highlight from the mouse either
  it('does not highlight a loading item under the mouse', async () => {
    const { fixture, item, active, open, component } = await render(FileMenuComponent);
    component.$saving.set(true);
    await open('New');

    item('Save').dispatchEvent(new MouseEvent('mouseenter'));
    await fixture.whenStable();

    expect(active()).toBe('New');
  });

  // F61: a menu with no items yet threw on focus and on every arrow key
  it('opens a menu whose items are still loading', async () => {
    const { fixture, group, active, open, component } = await render(RecentMenuComponent);
    await open();

    await userEvent.keyboard('{ArrowDown}');
    await fixture.whenStable();
    expect(group()!.getAttribute('aria-activedescendant')).toBeNull();

    // items that arrive while the menu has focus get the highlight focus gives
    component.$items.set(['Report.twbx', 'Sales.twbx']);
    await fixture.whenStable();
    await vi.waitFor(() => {
      expect(active()).toBe('Report.twbx');
    });
    await userEvent.keyboard('{ArrowDown}');
    await fixture.whenStable();
    expect(active()).toBe('Sales.twbx');
  });

  // The server has no ResizeObserver and no layout: the group built and measured its menus after its view; and, round 1,
  // B3, it measured on teardown too, which threw outside the render and stopped the prerender
  it('renders and is destroyed on the server without building or measuring its menus', async () => {
    const created: string[] = [];
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor() {
          created.push('ResizeObserver');
        }
        observe() {
          // records only
        }
        disconnect() {
          // records only
        }
      },
    );
    // the server's DOM has no layout
    const measure = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => {
      throw new TypeError('getBoundingClientRect is not a function');
    });
    const globals = globalThis as { ngServerMode?: boolean };
    // Angular's own flag for server rendering, which afterNextRender reads
    globals.ngServerMode = true;
    try {
      const { fixture, host } = await render(StandaloneMenuComponent);

      expect(created).toEqual([]);
      expect(host.querySelector('tab-menu-button-group')!.getAttribute('role')).toBe('menu');
      fixture.destroy();
      expect(measure).not.toHaveBeenCalled();
    } finally {
      delete globals.ngServerMode;
      measure.mockRestore();
      vi.unstubAllGlobals();
    }
  });

  it('passes axe with a submenu open', async () => {
    const { fixture, host, open } = await render(FileMenuComponent);
    await open('New');
    await userEvent.keyboard('{ArrowUp}');
    await userEvent.keyboard('{ArrowRight}');
    await fixture.whenStable();

    expect(await axeViolations(host)).toEqual([]);
  });
});
