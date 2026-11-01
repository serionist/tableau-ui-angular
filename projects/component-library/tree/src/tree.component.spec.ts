import { afterNextRender, ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { userEvent } from 'vitest/browser';
import { axeViolations } from '../../testing/axe';
import { TableauUiTreeModule } from './tableau-ui-tree.module';
import { TabTreeNodeComponent } from './tree-node.component';
import { TabTreeComponent } from './tree.component';

@Component({
  imports: [TableauUiTreeModule],
  template: `
    <tab-tree aria-label="Reports" gridLinesBorder="1px solid gray">
      <tab-tree-node [expanded]="true">
        Reports
        <tab-tree-node>Sales</tab-tree-node>
        <tab-tree-node>Costs</tab-tree-node>
      </tab-tree-node>
    </tab-tree>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ReportsTreeComponent {}

// Nodes that sit in others, and nodes that name their parent; Sales names none, Costs names Reports from outside it
@Component({
  imports: [TableauUiTreeModule],
  template: `
    <tab-tree aria-label="Teams" [hierarchyMode]="$mode()">
      <tab-tree-node hierarchyId="reports" [expanded]="true">
        Reports
        <tab-tree-node hierarchyId="sales">Sales</tab-tree-node>
      </tab-tree-node>
      <tab-tree-node hierarchyId="costs" hierarchyParentId="reports">Costs</tab-tree-node>
      <tab-tree-node [hierarchyId]="$teamId()" [expanded]="true">
        Team
        <tab-tree-node hierarchyId="ada">Ada</tab-tree-node>
      </tab-tree-node>
    </tab-tree>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ModesTreeComponent {
  readonly $mode = signal<'auto' | 'manual'>('auto');
  readonly $teamId = signal('team');
}

// Open and closed nodes on three levels, with a button before and after the tree for the Tab key
@Component({
  imports: [TableauUiTreeModule],
  template: `
    <button type="button">Before</button>
    <tab-tree aria-label="Files" [showRootGridLines]="true">
      <tab-tree-node [expanded]="$reportsOpen()">
        Reports
        <tab-tree-node [expanded]="true">
          Sales
          <tab-tree-node>Q1</tab-tree-node>
          <tab-tree-node>Q2</tab-tree-node>
        </tab-tree-node>
        @if ($costs()) {
          <tab-tree-node>Costs</tab-tree-node>
        }
      </tab-tree-node>
      <tab-tree-node [order]="$teamOrder()" (expandedChange)="teamChanges.push($event)">
        Team
        <tab-tree-node>Ada</tab-tree-node>
        <tab-tree-node>Bob</tab-tree-node>
      </tab-tree-node>
      @if ($archive()) {
        <tab-tree-node>Archive</tab-tree-node>
      }
    </tab-tree>
    <button type="button">After</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FilesTreeComponent {
  readonly $reportsOpen = signal(true);
  readonly $costs = signal(true);
  readonly $archive = signal(true);
  readonly $teamOrder = signal(0);
  readonly teamChanges: boolean[] = [];
}

// A node whose content holds a control
@Component({
  imports: [TableauUiTreeModule],
  template: `
    <tab-tree aria-label="Tasks">
      <tab-tree-node [expanded]="true">
        Tasks
        <tab-tree-node>Write <input aria-label="Note" /></tab-tree-node>
        <tab-tree-node>Review</tab-tree-node>
      </tab-tree-node>
    </tab-tree>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ControlTreeComponent {}

// A row's first word, or an element's text
function nameOf(element: Element | null) {
  return element?.getAttribute('role') === 'treeitem' ? element.querySelector('.header-content')!.textContent.trim().split(/\s+/)[0] : element?.textContent.trim();
}

// Each row's name, level, set size, position and expanded state
function treeItems(host: HTMLElement) {
  return Array.from(host.querySelectorAll('[role="treeitem"]'), row => [
    nameOf(row),
    row.getAttribute('aria-level'),
    row.getAttribute('aria-setsize'),
    row.getAttribute('aria-posinset'),
    row.getAttribute('aria-expanded'),
  ]);
}

describe('TabTreeComponent', () => {
  async function render() {
    const fixture = TestBed.createComponent(ReportsTreeComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const shown = () => Array.from(host.querySelectorAll('.header-content'), content => content.textContent.trim().split(/\s+/)[0]);
    return { fixture, host, shown };
  }

  // The server has no ResizeObserver and no layout: the tree observed itself after its content, and drew its grid
  // lines by measuring its nodes, so a page with a tree threw there
  it('renders on the server without observing or measuring', async () => {
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
    const measured = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => {
      throw new TypeError('getBoundingClientRect is not a function');
    });
    const globals = globalThis as { ngServerMode?: boolean };
    // Angular's own flag for server rendering, which afterNextRender reads
    globals.ngServerMode = true;
    try {
      const { host, shown } = await render();

      expect(shown()).toEqual(['Reports', 'Sales', 'Costs']);
      // the roles, states and the Tab stop render on the server too
      expect(host.querySelector('tab-tree')!.getAttribute('role')).toBe('tree');
      expect(treeItems(host)).toEqual([
        ['Reports', '1', '1', '1', 'true'],
        ['Sales', '2', '2', '1', null],
        ['Costs', '2', '2', '2', null],
      ]);
      expect(Array.from(host.querySelectorAll('[role="treeitem"]'), row => row.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
      expect(created).toEqual([]);
      expect(measured).not.toHaveBeenCalled();
    } finally {
      delete globals.ngServerMode;
      measured.mockRestore();
      vi.unstubAllGlobals();
    }
  });

  it('draws its grid lines in the browser, and passes axe', async () => {
    const { host, shown } = await render();

    expect(shown()).toEqual(['Reports', 'Sales', 'Costs']);
    await vi.waitFor(() => {
      expect(host.querySelectorAll('.grid-line').length).toBe(2);
    });
    expect(await axeViolations(host)).toEqual([]);
  });

  // hierarchyMode changed nothing: a nested node's parent id defaulted to the node it sat in, whatever the mode
  it("takes a node's parent from where it sits or from its hierarchyParentId in auto mode, and only from its hierarchyParentId in manual mode", async () => {
    const fixture = TestBed.createComponent(ModesTreeComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const shown = () => Array.from(host.querySelectorAll('.header-content'), content => content.textContent.trim().split(/\s+/)[0]);
    // each node's parent, by id; the tree draws its nodes from its registry, and projects none of their elements
    const tree = fixture.debugElement.query(By.directive(TabTreeComponent)).componentInstance as TabTreeComponent;
    const parents = () => Object.fromEntries(tree.registry.nodes().map(node => [node.$hierarchyId(), node.$parent()?.$hierarchyId() ?? null]));

    expect(parents()).toEqual({ reports: null, sales: 'reports', costs: 'reports', team: null, ada: 'team' });
    expect(shown()).toEqual(['Reports', 'Sales', 'Costs', 'Team', 'Ada']);

    fixture.componentInstance.$mode.set('manual');
    await fixture.whenStable();
    expect(parents()).toEqual({ reports: null, sales: null, costs: 'reports', team: null, ada: null });
    expect(shown()).toEqual(['Reports', 'Costs', 'Sales', 'Team', 'Ada']);

    fixture.componentInstance.$mode.set('auto');
    fixture.componentInstance.$teamId.set('people');
    await fixture.whenStable();
    expect(parents()).toEqual({ reports: null, sales: 'reports', costs: 'reports', people: null, ada: 'people' });
    expect(shown()).toEqual(['Reports', 'Sales', 'Costs', 'Team', 'Ada']);
  });

  // The treeitems' levels, sizes and positions follow the parents each mode gives, a hierarchyParentId's included
  it('gives each treeitem its level, set size and position among the siblings its hierarchyParentId gives it, in both modes', async () => {
    const fixture = TestBed.createComponent(ModesTreeComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;

    expect(treeItems(host)).toEqual([
      ['Reports', '1', '2', '1', 'true'],
      ['Sales', '2', '2', '1', null],
      ['Costs', '2', '2', '2', null],
      ['Team', '1', '2', '2', 'true'],
      ['Ada', '2', '1', '1', null],
    ]);

    // Sales and Ada name no parent, so they are at the top level; Team has no children, so it is neither open nor closed
    fixture.componentInstance.$mode.set('manual');
    await fixture.whenStable();
    expect(treeItems(host)).toEqual([
      ['Reports', '1', '4', '1', 'true'],
      ['Costs', '2', '1', '1', null],
      ['Sales', '1', '4', '2', null],
      ['Team', '1', '4', '3', null],
      ['Ada', '1', '4', '4', null],
    ]);
    expect(await axeViolations(host)).toEqual([]);
  });

  // #61: the tree was a run of buttons and text, with no tree roles, and its toggles didn't say whether they were open
  describe('as a tree view', () => {
    async function renderFiles() {
      const fixture = TestBed.createComponent(FilesTreeComponent);
      fixture.autoDetectChanges();
      await fixture.whenStable();
      const host = fixture.nativeElement as HTMLElement;
      const rows = () => Array.from(host.querySelectorAll<HTMLElement>('[role="treeitem"]'));
      const row = (name: string) => rows().find(element => nameOf(element) === name)!;
      const toggle = (name: string) => row(name).querySelector<HTMLElement>('.header-button')!;
      const tabStops = () =>
        rows()
          .filter(element => element.getAttribute('tabindex') === '0')
          .map(nameOf);
      const focused = () => nameOf(document.activeElement);
      const press = async (keys: string) => {
        await userEvent.keyboard(keys);
        await fixture.whenStable();
      };
      const button = (text: string) => Array.from(host.querySelectorAll<HTMLElement>('button')).find(element => element.textContent.trim() === text)!;
      return { fixture, host, component: fixture.componentInstance, rows, row, toggle, tabStops, focused, press, button };
    }

    it('is a named tree of treeitems with their levels, set sizes, positions and open states, level 1 at the top whatever showRootGridLines', async () => {
      const { host, rows } = await renderFiles();
      const tree = host.querySelector('tab-tree')!;

      expect(tree.getAttribute('role')).toBe('tree');
      expect(tree.getAttribute('aria-label')).toBe('Files');
      // the rows are the tree's own children, so the levels, sizes and positions carry the structure
      expect(rows().every(element => element.parentElement === tree)).toBe(true);
      expect(treeItems(host)).toEqual([
        ['Reports', '1', '3', '1', 'true'],
        ['Sales', '2', '2', '1', 'true'],
        ['Q1', '3', '2', '1', null],
        ['Q2', '3', '2', '2', null],
        ['Costs', '2', '2', '2', null],
        ['Team', '1', '3', '2', 'false'],
        ['Archive', '1', '3', '3', null],
      ]);
      expect(await axeViolations(host)).toEqual([]);
    });

    it('is one Tab stop, on the first node at the start', async () => {
      const { button, tabStops, focused } = await renderFiles();

      expect(tabStops()).toEqual(['Reports']);
      button('Before').focus();
      await userEvent.tab();
      expect(focused()).toBe('Reports');
      await userEvent.tab();
      expect(focused()).toBe('After');
      await userEvent.tab({ shift: true });
      expect(focused()).toBe('Reports');
    });

    it('moves to the next and previous shown node with Down and Up, and to the first and last with Home and End', async () => {
      const { row, tabStops, focused, press } = await renderFiles();
      row('Reports').focus();

      const visited: (string | undefined)[] = [];
      for (let i = 0; i < 7; i++) {
        await press('{ArrowDown}');
        visited.push(focused());
      }
      // Team's children are hidden, and Down stops at the last node
      expect(visited).toEqual(['Sales', 'Q1', 'Q2', 'Costs', 'Team', 'Archive', 'Archive']);
      expect(tabStops()).toEqual(['Archive']);

      await press('{ArrowUp}');
      expect(focused()).toBe('Team');
      await press('{Home}');
      expect(focused()).toBe('Reports');
      await press('{ArrowUp}');
      expect(focused()).toBe('Reports');
      await press('{End}');
      expect(focused()).toBe('Archive');
      expect(tabStops()).toEqual(['Archive']);
    });

    it('opens a closed node with Right and moves into an open one; closes an open node with Left and moves from a child to its parent', async () => {
      const { component, row, rows, focused, press } = await renderFiles();
      row('Team').focus();

      await press('{ArrowRight}');
      expect(row('Team').getAttribute('aria-expanded')).toBe('true');
      expect(focused()).toBe('Team');
      expect(rows().map(nameOf)).toContain('Ada');
      await press('{ArrowRight}');
      expect(focused()).toBe('Ada');
      // a node without children opens nothing
      await press('{ArrowRight}');
      expect(focused()).toBe('Ada');

      await press('{ArrowLeft}');
      expect(focused()).toBe('Team');
      expect(row('Team').getAttribute('aria-expanded')).toBe('true');
      await press('{ArrowLeft}');
      expect(row('Team').getAttribute('aria-expanded')).toBe('false');
      expect(focused()).toBe('Team');
      expect(rows().map(nameOf)).not.toContain('Ada');
      // a closed node at the top level has no parent to move to
      await press('{ArrowLeft}');
      expect(focused()).toBe('Team');
      // the keys open and close a node as a click does, so expandedChange emits
      expect(component.teamChanges).toEqual([true, false]);
    });

    it('opens and closes a node with Enter, which does nothing on a node without children', async () => {
      const { component, row, rows, focused, press } = await renderFiles();
      row('Team').focus();

      await press('{Enter}');
      expect(row('Team').getAttribute('aria-expanded')).toBe('true');
      await press('{Enter}');
      expect(row('Team').getAttribute('aria-expanded')).toBe('false');
      expect(component.teamChanges).toEqual([true, false]);

      const before = rows().map(nameOf);
      row('Q1').focus();
      await press('{Enter}');
      expect(rows().map(nameOf)).toEqual(before);
      expect(focused()).toBe('Q1');
    });

    it('moves to the next shown node whose text starts with the character typed, wrapping', async () => {
      const { row, focused, press } = await renderFiles();
      row('Reports').focus();

      await press('q');
      expect(focused()).toBe('Q1');
      await press('q');
      expect(focused()).toBe('Q2');
      // Ada starts with A too, but Team is closed
      await press('a');
      expect(focused()).toBe('Archive');
      await press('R');
      expect(focused()).toBe('Reports');
      // nothing starts with z
      await press('z');
      expect(focused()).toBe('Reports');
    });

    it('moves the focus to a node that closes with the focus in its child, from the app or the toggle', async () => {
      const { fixture, component, row, rows, toggle, tabStops, focused } = await renderFiles();
      row('Q2').focus();

      component.$reportsOpen.set(false);
      await fixture.whenStable();
      await vi.waitFor(() => {
        expect(focused()).toBe('Reports');
      });
      expect(rows().map(nameOf)).toEqual(['Reports', 'Team', 'Archive']);
      expect(tabStops()).toEqual(['Reports']);

      component.$reportsOpen.set(true);
      await fixture.whenStable();
      row('Q1').focus();
      // the toggle's mousedown is cancelled, so the focus stays in Q1 until the click
      await userEvent.click(toggle('Sales'));
      await fixture.whenStable();
      expect(focused()).toBe('Sales');
      expect(row('Sales').getAttribute('aria-expanded')).toBe('false');
      expect(tabStops()).toEqual(['Sales']);
    });

    it('moves the focus to the shown node before a focused node that goes', async () => {
      const { fixture, component, row, tabStops, focused } = await renderFiles();
      row('Archive').focus();

      component.$archive.set(false);
      await fixture.whenStable();
      await vi.waitFor(() => {
        expect(focused()).toBe('Team');
      });
      expect(tabStops()).toEqual(['Team']);
    });

    it('hides the toggle and never focuses it; a click on it still opens and closes the node', async () => {
      const { fixture, host, row, toggle, focused, button } = await renderFiles();
      const focusedToggles: string[] = [];
      for (const element of host.querySelectorAll('.header-button')) {
        expect(element.getAttribute('aria-hidden')).toBe('true');
        expect(element.getAttribute('tabindex')).toBe('-1');
        element.addEventListener('focus', () => focusedToggles.push(element.id));
      }
      button('Before').focus();

      await userEvent.click(toggle('Team'));
      await fixture.whenStable();
      expect(row('Team').getAttribute('aria-expanded')).toBe('true');
      expect(focused()).toBe('Team');
      await userEvent.click(toggle('Team'));
      await fixture.whenStable();
      expect(row('Team').getAttribute('aria-expanded')).toBe('false');
      expect(focused()).toBe('Team');
      expect(focusedToggles).toEqual([]);
    });

    // A click on a toggle focused the hidden button in Chromium, and left the Tab stop where it was
    it('moves on from a clicked node with Down, and Tab out and back in lands on the node it moved to', async () => {
      const { fixture, row, toggle, tabStops, focused, press } = await renderFiles();

      await userEvent.click(row('Costs').querySelector('.header-content')!);
      await fixture.whenStable();
      expect(focused()).toBe('Costs');
      await press('{ArrowDown}');
      expect(focused()).toBe('Team');
      await userEvent.tab();
      expect(focused()).toBe('After');
      await userEvent.tab({ shift: true });
      expect(focused()).toBe('Team');

      await userEvent.click(toggle('Sales'));
      await fixture.whenStable();
      expect(focused()).toBe('Sales');
      await press('{ArrowDown}');
      expect(focused()).toBe('Costs');
      expect(tabStops()).toEqual(['Costs']);
    });

    // An assistive technology activates a node with a click on its row: VoiceOver on iOS, TalkBack, Switch Control and
    // Voice Control can't reach the hidden toggle
    it('opens and closes a node on a click on its row itself, as assistive technologies send it, and not on a click on its content', async () => {
      const { fixture, component, row, focused, button } = await renderFiles();
      button('Before').focus();

      row('Team').click();
      await fixture.whenStable();
      expect(row('Team').getAttribute('aria-expanded')).toBe('true');
      expect(focused()).toBe('Team');
      row('Team').click();
      await fixture.whenStable();
      expect(row('Team').getAttribute('aria-expanded')).toBe('false');
      expect(component.teamChanges).toEqual([true, false]);

      // the pointer on the node's text focuses it, and toggles nothing
      button('Before').focus();
      await userEvent.click(row('Team').querySelector('.header-content')!);
      await fixture.whenStable();
      expect(focused()).toBe('Team');
      expect(row('Team').getAttribute('aria-expanded')).toBe('false');
      row('Team').querySelector<HTMLElement>('.header-content')!.click();
      await fixture.whenStable();
      expect(row('Team').getAttribute('aria-expanded')).toBe('false');

      // a drag that selects the node's text and ends on its row toggles nothing; a selection elsewhere doesn't stop a click
      const selection = document.getSelection()!;
      const range = document.createRange();
      range.selectNodeContents(row('Team').querySelector('.header-content')!);
      selection.removeAllRanges();
      selection.addRange(range);
      row('Team').click();
      await fixture.whenStable();
      expect(row('Team').getAttribute('aria-expanded')).toBe('false');
      range.selectNodeContents(button('After'));
      selection.removeAllRanges();
      selection.addRange(range);
      row('Team').click();
      await fixture.whenStable();
      expect(row('Team').getAttribute('aria-expanded')).toBe('true');
      selection.removeAllRanges();

      // a node without children only takes the focus
      row('Archive').click();
      await fixture.whenStable();
      expect(focused()).toBe('Archive');
      expect(row('Archive').hasAttribute('aria-expanded')).toBe(false);
    });

    // The rows were tracked by their place, so a node added or removed above the focused one rebuilt its row and dropped
    // the focus to the body
    it('keeps the focus on a node, in the same row, when a node above it goes or comes, and the siblings left count again', async () => {
      const { fixture, component, row, rows } = await renderFiles();
      const team = row('Team');
      team.focus();

      component.$costs.set(false);
      await fixture.whenStable();
      expect(rows().map(nameOf)).not.toContain('Costs');
      // the row is the same element: a row rebuilt for its new place would have lost the focus
      expect(document.activeElement).toBe(team);
      expect(row('Sales').getAttribute('aria-setsize')).toBe('1');

      component.$costs.set(true);
      await fixture.whenStable();
      expect(rows().map(nameOf)).toContain('Costs');
      expect(document.activeElement).toBe(team);
      expect(row('Costs').getAttribute('aria-posinset')).toBe('2');
    });

    // Moving the focused element in the page drops the focus to the body, in Chromium and Firefox alike. With Team first,
    // the template moves Reports' rows after Team's, rather than Team's before them.
    it('puts the focus back on a node whose row the template moves', async () => {
      const { fixture, component, host, row, rows, focused } = await renderFiles();
      const reports = row('Reports');
      reports.focus();
      const moved: Node[] = [];
      const observer = new MutationObserver(records => moved.push(...records.flatMap(record => Array.from(record.removedNodes))));
      observer.observe(host.querySelector('tab-tree')!, { childList: true });

      component.$teamOrder.set(-1);
      await fixture.whenStable();
      observer.disconnect();
      expect(rows().map(nameOf)).toEqual(['Team', 'Reports', 'Sales', 'Q1', 'Q2', 'Costs', 'Archive']);
      // the template moved Reports' own row, which dropped the focus, and the tree put it back
      expect(moved).toContain(reports);
      expect(row('Reports')).toBe(reports);
      expect(focused()).toBe('Reports');
    });

    it('leaves the focus where the app moves it after removing the focused node', async () => {
      const { fixture, component, row, button } = await renderFiles();
      row('Archive').focus();

      component.$archive.set(false);
      // an app that moves the focus once the page renders, as to an Undo button
      afterNextRender(() => button('After').focus(), { injector: fixture.componentRef.injector });
      await fixture.whenStable();
      expect(document.activeElement).toBe(button('After'));
    });

    it('cancels the arrows where they move nothing, and leaves keys with Alt, Ctrl or Meta to the browser', async () => {
      const { row, focused } = await renderFiles();
      const keydown = (name: string, init: KeyboardEventInit) => {
        const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
        row(name).dispatchEvent(event);
        return event.defaultPrevented;
      };

      row('Archive').focus();
      expect(keydown('Archive', { key: 'ArrowDown' })).toBe(true);
      expect(focused()).toBe('Archive');
      row('Q1').focus();
      expect(keydown('Q1', { key: 'ArrowRight' })).toBe(true);
      expect(focused()).toBe('Q1');
      // Alt+Left is the browser's Back; without Alt, Left would move to Sales
      expect(keydown('Q1', { key: 'ArrowLeft', altKey: true })).toBe(false);
      expect(keydown('Q1', { key: 'ArrowLeft', ctrlKey: true })).toBe(false);
      expect(keydown('Q1', { key: 'ArrowLeft', metaKey: true })).toBe(false);
      expect(focused()).toBe('Q1');
    });

    it("leaves the keys of a control in a node's content to the control, which keeps its own Tab stop", async () => {
      const fixture = TestBed.createComponent(ControlTreeComponent);
      fixture.autoDetectChanges();
      await fixture.whenStable();
      const host = fixture.nativeElement as HTMLElement;
      const input = host.querySelector('input')!;
      input.focus();

      await userEvent.keyboard('{ArrowDown}{Home}r');
      await fixture.whenStable();
      expect(document.activeElement).toBe(input);
      expect(input.value).toBe('r');
      // the node the control sits in takes the tree's Tab stop, just before the control
      expect(Array.from(host.querySelectorAll('[role="treeitem"]'), row => row.getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);
      await userEvent.tab({ shift: true });
      expect(nameOf(document.activeElement)).toBe('Write');
      expect(await axeViolations(host)).toEqual([]);
    });
  });

  // I9: the node offered forms a value accessor with no writeValue, so a form control on it threw a TypeError
  it('offers forms no value accessor on a node', async () => {
    const { fixture } = await render();
    const node = fixture.debugElement.query(By.directive(TabTreeNodeComponent));

    expect(node.injector.get(NG_VALUE_ACCESSOR, null)).toBeNull();
  });
});
