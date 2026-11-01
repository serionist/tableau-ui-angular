import { ChangeDetectionStrategy, Component, signal, ViewEncapsulation } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { page, userEvent } from 'vitest/browser';
import { axeViolations } from '../../testing/axe';
import { inEachMode } from '../../testing/contrast';
import { focusRingShown } from '../../testing/focus-ring';
import { TableauUiTabgroupModule } from './tableau-ui-tab-group.module';

@Component({
  imports: [TableauUiTabgroupModule],
  template: `
    <div [style.height]="$spacer()"></div>
    <tab-group (tabSelected)="selected.push($event.key)">
      @for (name of $tabs(); track name) {
        <tab [key]="name" (afterActivate)="activated.push(name)">
          <span tab-header>{{ name }}</span>
          <p>{{ name }} content</p>
        </tab>
      }
    </tab-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TabsHostComponent {
  readonly $spacer = signal('0px');
  readonly $tabs = signal(['General', 'Sharing', 'History']);
  readonly selected: (string | undefined)[] = [];
  readonly activated: string[] = [];
}

// Sheets, two of them disabled, between two buttons, in a box as wide as the test sets; their strip fits the page. The
// specs load no icon font, so the scroll arrows are small, or their ligatures' text would fill a narrow box
@Component({
  imports: [TableauUiTabgroupModule],
  template: `
    <button type="button">Before</button>
    <div [style.width]="$width()">
      <tab-group headerPadding="0.25rem 0.5rem" scrollArrowsIconSize="0.25rem" [label]="$label()" [autoSelectFirstTab]="$autoSelect()" (tabSelected)="selected.push($event.key)">
        @for (name of tabs; track name) {
          <tab [key]="name" [disabled]="name === 'Draft' || name === 'Archive'" (afterActivate)="activated.push(name)">
            <span tab-header>{{ name }}</span>
            <p>{{ name }} content</p>
          </tab>
        }
      </tab-group>
    </div>
    <button type="button">After</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class SheetsComponent {
  readonly tabs = ['Draft', 'General', 'Sharing', 'Archive', 'History'];
  readonly $label = signal<string | undefined>('Sheets');
  readonly $autoSelect = signal(true);
  readonly $width = signal('auto');
  readonly selected: (string | undefined)[] = [];
  readonly activated: string[] = [];
}

// The library's styles, as an app imports them, while a fixture of it lives: the theme's colours in both modes
@Component({
  template: '',
  styleUrl: '../../styles/lib-styles.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class LibraryStylesComponent {}

describe('TabGroupComponent', () => {
  async function render(setUp?: (component: TabsHostComponent) => void) {
    const fixture = TestBed.createComponent(TabsHostComponent);
    setUp?.(fixture.componentInstance);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const shown = () => Array.from(host.querySelectorAll<HTMLElement>('.tab-content'), content => content.style.display !== 'none' && content.textContent.trim()).filter(Boolean);
    const header = (name: string) => Array.from(host.querySelectorAll<HTMLElement>('.tab')).find(tab => tab.textContent.trim() === name)!;
    return { fixture, host, shown, header, component: fixture.componentInstance };
  }

  afterEach(() => {
    window.scrollTo(0, 0);
  });

  // The server has no layout: selecting the first tab scrolled it into view there, and told the tab it was active on the
  // next animation frame
  it('renders on the server with its first tab selected', async () => {
    const scrolled = vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(() => {
      throw new TypeError('scrollIntoView is not a function');
    });
    const globals = globalThis as { ngServerMode?: boolean };
    // Angular's own flag for server rendering, which afterNextRender reads
    globals.ngServerMode = true;
    try {
      const { host, shown, component } = await render();

      expect(shown()).toEqual(['General content']);
      expect(component.selected).toEqual(['General']);
      // the roles and states render on the server too
      expect(Array.from(host.querySelectorAll('[role="tab"]'), tab => tab.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false']);
      expect(scrolled).not.toHaveBeenCalled();
      // the tab is told once its content is drawn, which the server never does
      expect(component.activated).toEqual([]);
    } finally {
      delete globals.ngServerMode;
      scrolled.mockRestore();
    }
  });

  // F85: selecting the first tab on load scrolled it into view, which scrolled the page down to the tabs
  it('leaves the page where it is when it selects its first tab', async () => {
    const { shown } = await render(host => {
      host.$spacer.set('3000px');
    });
    await new Promise(resolve => {
      setTimeout(resolve, 300);
    });

    expect(shown()).toEqual(['General content']);
    expect(window.scrollY).toBe(0);
  });

  // F84: the first tab was selected once, after the view: tabs that came later had none selected
  it('selects the first tab of tabs that come later', async () => {
    const { fixture, shown, component } = await render(host => {
      host.$tabs.set([]);
    });
    expect(shown()).toEqual([]);

    component.$tabs.set(['General', 'Sharing']);
    await fixture.whenStable();

    expect(shown()).toEqual(['General content']);
    expect(component.selected).toEqual(['General']);
  });

  // F84: closing the selected last tab left an index past the end, so no tab showed
  it('selects the last tab when the selected last tab closes', async () => {
    const { fixture, shown, header, component } = await render();
    header('History').click();
    await fixture.whenStable();
    expect(shown()).toEqual(['History content']);

    component.$tabs.set(['General', 'Sharing']);
    await fixture.whenStable();

    expect(shown()).toEqual(['Sharing content']);
    expect(component.selected.at(-1)).toBe('Sharing');
  });

  it('selects a tab on a click or on Enter, and passes axe', async () => {
    const { fixture, host, shown, header, component } = await render();
    component.selected.length = 0;

    header('Sharing').click();
    header('History').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await fixture.whenStable();

    expect(shown()).toEqual(['History content']);
    expect(component.selected).toEqual(['Sharing', 'History']);
    // once its content has rendered
    await vi.waitFor(() => {
      expect(component.activated).toEqual(['General', 'Sharing', 'History']);
    });
    expect(await axeViolations(host)).toEqual([]);
  });

  describe('as the tabs pattern', () => {
    async function sheets(setUp?: (component: SheetsComponent) => void) {
      const fixture = TestBed.createComponent(SheetsComponent);
      setUp?.(fixture.componentInstance);
      fixture.autoDetectChanges();
      await fixture.whenStable();
      const host = fixture.nativeElement as HTMLElement;
      const tabs = () => Array.from(host.querySelectorAll<HTMLElement>('[role="tab"]'));
      const tab = (name: string) => tabs().find(element => element.textContent.trim() === name)!;
      const panels = () => Array.from(host.querySelectorAll<HTMLElement>('[role="tabpanel"]'));
      const shown = () =>
        panels()
          .filter(panel => panel.style.display !== 'none')
          .map(panel => panel.textContent.trim());
      const stops = () => tabs().map(element => element.tabIndex);
      const button = (text: string) => Array.from(host.querySelectorAll('button')).find(element => element.textContent === text)!;
      return { fixture, host, tabs, tab, panels, shown, stops, button, component: fixture.componentInstance };
    }
    const focused = () => document.activeElement?.textContent.trim();

    it('is a tablist named by its label, each tab selected or not, disabled or not, controlling its panel, which it names', async () => {
      const { fixture, host, tabs, tab, panels, component } = await sheets();

      expect(page.getByRole('tablist', { name: 'Sheets', exact: true }).element()).toBe(host.querySelector('.tab-headers'));
      expect(page.getByRole('tab').elements()).toEqual(tabs());
      expect(page.getByRole('tab', { selected: true }).element()).toBe(tab('General'));
      expect(tabs().map(element => element.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false', 'false', 'false']);
      expect(tabs().map(element => element.getAttribute('aria-disabled'))).toEqual(['true', null, null, 'true', null]);
      // each tab controls its own panel, which its tab names
      expect(tabs().map(element => document.getElementById(element.getAttribute('aria-controls')!))).toEqual(panels());
      expect(panels().map(panel => document.getElementById(panel.getAttribute('aria-labelledby')!))).toEqual(tabs());
      expect(new Set([...tabs(), ...panels()].map(element => element.id)).size).toBe(10);
      expect(panels().map(panel => panel.tabIndex)).toEqual([0, 0, 0, 0, 0]);
      // the hidden panels are out of the accessibility tree
      expect(page.getByRole('tabpanel').element()).toBe(panels()[1]);
      expect(page.getByRole('tabpanel', { name: 'General', exact: true }).element()).toBe(panels()[1]);
      expect(await axeViolations(host)).toEqual([]);

      // a label with no words names nothing
      component.$label.set('  ');
      await fixture.whenStable();
      expect(host.querySelector('.tab-headers')!.hasAttribute('aria-label')).toBe(false);
    });

    it('is one Tab stop, the selected tab, followed by its panel', async () => {
      const { stops, tab, panels, button } = await sheets();
      expect(stops()).toEqual([-1, 0, -1, -1, -1]);

      button('Before').focus();
      await userEvent.tab();
      expect(document.activeElement).toBe(tab('General'));
      await userEvent.tab();
      expect(document.activeElement).toBe(panels()[1]);
      await userEvent.tab();
      expect(document.activeElement).toBe(button('After'));
      await userEvent.tab({ shift: true });
      await userEvent.tab({ shift: true });
      expect(document.activeElement).toBe(tab('General'));
    });

    // With none selected the strip had no Tab stop
    it('puts the Tab stop on the first enabled tab while none is selected, which Enter selects', async () => {
      const { fixture, stops, tab, shown, button, component } = await sheets(sheet => {
        sheet.$autoSelect.set(false);
      });
      expect(shown()).toEqual([]);
      expect(stops()).toEqual([-1, 0, -1, -1, -1]);

      button('Before').focus();
      await userEvent.tab();
      expect(document.activeElement).toBe(tab('General'));
      expect(component.selected).toEqual([]);

      await userEvent.keyboard('{Enter}');
      await fixture.whenStable();
      expect(component.selected).toEqual(['General']);
      expect(shown()).toEqual(['General content']);
      expect(tab('General').getAttribute('aria-selected')).toBe('true');
    });

    it('moves to the next or previous enabled tab on Right and Left, wrapping, to the first or last on Home and End, and selects each', async () => {
      const { fixture, stops, tab, shown, button, component } = await sheets();
      button('Before').focus();
      await userEvent.tab();
      component.selected.length = 0;
      const moves: (string | undefined)[][] = [];

      for (const key of ['{ArrowRight}', '{ArrowRight}', '{ArrowRight}', '{ArrowLeft}', '{ArrowLeft}', '{Home}', '{End}']) {
        await userEvent.keyboard(key);
        await fixture.whenStable();
        moves.push([focused(), shown()[0]]);
      }

      // Archive and Draft are disabled, so the keys pass them
      expect(moves).toEqual([
        ['Sharing', 'Sharing content'],
        ['History', 'History content'],
        ['General', 'General content'],
        ['History', 'History content'],
        ['Sharing', 'Sharing content'],
        ['General', 'General content'],
        ['History', 'History content'],
      ]);
      expect(component.selected).toEqual(['Sharing', 'History', 'General', 'History', 'Sharing', 'General', 'History']);
      expect(stops()).toEqual([-1, -1, -1, -1, 0]);
      expect(tab('History').getAttribute('aria-selected')).toBe('true');
      await vi.waitFor(() => {
        expect(component.activated.at(-1)).toBe('History');
      });
    });

    it('leaves an arrow with Alt, Ctrl or Meta to the browser', async () => {
      const { fixture, tab, component } = await sheets();
      component.selected.length = 0;

      for (const modifier of ['altKey', 'ctrlKey', 'metaKey']) {
        const key = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true, [modifier]: true });
        tab('General').dispatchEvent(key);
        await fixture.whenStable();
        expect(key.defaultPrevented, modifier).toBe(false);
      }
      expect(component.selected).toEqual([]);
    });

    // Firefox made the strip a Tab stop of its own once it overflowed, before the selected tab
    it('is one Tab stop in a narrow strip too, and scrolls the tab the keys move to into it, never the page', async () => {
      const { tab, button } = await sheets(sheet => {
        sheet.$width.set('14rem');
      });
      const strip = tab('General').closest<HTMLElement>('.scroll-container')!;
      expect(strip.scrollWidth).toBeGreaterThan(strip.clientWidth);
      button('Before').focus();
      await userEvent.tab();
      expect(document.activeElement).toBe(tab('General'));
      const start = strip.scrollLeft;

      await userEvent.keyboard('{End}');

      await vi.waitFor(() => {
        const [shown, box] = [tab('History').getBoundingClientRect(), strip.getBoundingClientRect()];
        expect(shown.right).toBeLessThanOrEqual(box.right + 1);
        expect(shown.left).toBeGreaterThanOrEqual(box.left - 1);
      });
      expect(strip.scrollLeft).toBeGreaterThan(start);
      expect(window.scrollY).toBe(0);
    });

    it('shows a focus ring on all four edges of the panel that takes focus', async () => {
      TestBed.createComponent(LibraryStylesComponent);
      const { panels, button } = await sheets();
      button('Before').focus();
      await userEvent.tab();
      // none before it has focus
      expect(await focusRingShown(panels()[1])).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });

      await userEvent.tab();

      expect(panels()[1].matches(':focus-visible')).toBe(true);
      await inEachMode(async mode => {
        expect(await focusRingShown(panels()[1]), mode).toEqual({ top: 1, right: 1, bottom: 1, left: 1 });
      });
    });
  });
});
