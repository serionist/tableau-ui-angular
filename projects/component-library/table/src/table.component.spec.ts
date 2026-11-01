import { ChangeDetectionStrategy, Component, effect, PLATFORM_ID, signal, viewChild, ViewEncapsulation } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { page, userEvent } from 'vitest/browser';
import { TableauUiButtonToggleModule } from 'tableau-ui-angular/button-toggle';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import type { Primitive } from 'tableau-ui-angular/types';
import type { DataOptions, DataRowCss, DataSort } from 'tableau-ui-angular/virtualize';
import { axeViolations } from '../../testing/axe';
import { backgroundUnder, contrast, inEachMode } from '../../testing/contrast';
import { whileLoadsFail } from '../../testing/failing-loads';
import { focusRingShown } from '../../testing/focus-ring';
import type { Person } from '../../testing/people';
import { PEOPLE, PeopleServer } from '../../testing/people';
import { movePointerAway } from '../../testing/pointer';
import type { CellContext } from './defs/cell-def/cell-context';
import type { SelectionOptions } from './selection/selection-options';
import { MultiSelectionOptions, SingleSelectionOptions } from './selection/selection-options';
import { TableauUiTableModule } from './tableau-ui-table.module';
import { TableComponent } from './table.component';

@Component({
  imports: [TableauUiTableModule],
  template: `
    <tab-table #table style="height: 300px" sortMode="multi" [dataOptions]="$options()" [(sort)]="$sort" [dataRowCss]="$rowCss()" [selectionOptions]="$selection()" [(selectedRows)]="$selected">
      <ng-container tabColumnDef="id" [width]="$columnWidth()">
        <ng-template [tabHeaderDef]="table">Id</ng-template>
        <ng-template let-ctx [tabCellDef]="table">{{ ctx.row.id }}</ng-template>
      </ng-container>
      <ng-container tabColumnDef="name" [width]="$columnWidth()" [cellClass]="cellClass">
        <ng-template [tabHeaderDef]="table">Name</ng-template>
        <ng-template let-ctx [tabCellDef]="table">{{ ctx.row.name }}</ng-template>
      </ng-container>
      <ng-container tabColumnDef="profile" [width]="$columnWidth()" [sortable]="false">
        <ng-template [tabHeaderDef]="table">Profile</ng-template>
        <ng-template let-ctx [tabCellDef]="table" [textClamping]="false">
          <a [href]="'#person-' + ctx.row.id">Profile</a>
          <input type="checkbox" [attr.aria-label]="'Follow ' + ctx.row.name" />
        </ng-template>
      </ng-container>
    </tab-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PeopleTableComponent {
  readonly server = new PeopleServer();
  readonly $options = signal<DataOptions<Person>>(this.server.incremental);
  readonly $sort = signal<DataSort[]>([]);
  readonly $rowCss = signal<DataRowCss>({ height: '20px', lineHeight: '20px', padding: '0 8px' });
  readonly $selection = signal<SelectionOptions | undefined>(undefined);
  readonly $selected = signal(new Map<Primitive, Person>());
  // each column's width: flexible, filling the table, or a CSS length
  readonly $columnWidth = signal<number | string>(1);
  // the rows the name column's cellClass function was given
  readonly classed: unknown[] = [];
  readonly cellClass = (ctx: CellContext<Person>) => {
    this.classed.push(ctx.row);
    return undefined;
  };
  readonly table = viewChild.required<TableComponent<Person>>(TableComponent);
}

// An app that resets its table from an effect of its own when its filter changes, with a button toggle in a cell
@Component({
  imports: [TableauUiTableModule, TableauUiButtonToggleModule, TableauUiCommonModule],
  template: `
    <tab-table #table style="height: 300px" [dataOptions]="server.incremental" [selectionOptions]="$selection()" [(selectedRows)]="$selected">
      <ng-container tabColumnDef="name">
        <ng-template [tabHeaderDef]="table">Name</ng-template>
        <ng-template let-ctx [tabCellDef]="table">{{ ctx.row.name }}</ng-template>
      </ng-container>
      <ng-container tabColumnDef="priority" [sortable]="false">
        <ng-template [tabHeaderDef]="table">Priority</ng-template>
        <ng-template let-ctx [tabCellDef]="table" [textClamping]="false">
          <tab-button-toggle selectedValue="low" (selectedValueChange)="priorities.push($event)">
            <tab-option value="low" text="Low" />
            <tab-option value="high" text="High" />
          </tab-button-toggle>
        </ng-template>
      </ng-container>
    </tab-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FilteredTableComponent {
  readonly server = new PeopleServer();
  readonly $filter = signal('');
  readonly $selection = signal<SelectionOptions>(new MultiSelectionOptions('none'));
  readonly $selected = signal(new Map<Primitive, Person>());
  readonly priorities: unknown[] = [];
  readonly table = viewChild.required<TableComponent<Person>>(TableComponent);
  readonly refilter = effect(() => {
    this.$filter();
    void this.table().reset();
  });
}

describe('TableComponent', () => {
  // a pointer left over a cell would open its tooltip
  beforeEach(movePointerAway);

  async function render(setUp?: (component: PeopleTableComponent) => void) {
    const fixture = TestBed.createComponent(PeopleTableComponent);
    const component = fixture.componentInstance;
    setUp?.(component);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('tab-table')!;
    const rows = () => Array.from(host.querySelectorAll<HTMLElement>('.data-rows .row'));
    const cell = (row: HTMLElement, column: string) => row.querySelector<HTMLElement>(`.cell[data-column-id="${column}"]`)!;
    // the names the rows show, in order
    const names = () =>
      rows()
        .map(row => cell(row, 'name').textContent.trim())
        .filter(text => text !== '');
    const header = (column: string) => host.querySelector<HTMLElement>(`.column-header[data-column-id="${column}"] .header-button`)!;
    const selectedIds = () => [...component.$selected().keys()];
    // lets the answers' promises run and the page render
    const settle = async () => {
      await new Promise(resolve => setTimeout(resolve));
      await fixture.whenStable();
    };
    const { server } = component;
    // loads, answering each request
    const load = async () => {
      const loading = component.table().load();
      await server.answerAll(settle);
      return loading;
    };
    const scrollTo = async (top: number) => {
      host.scrollTop = top;
      host.dispatchEvent(new Event('scroll'));
      await server.answerAll(settle);
    };
    return { fixture, component, host, server, rows, cell, names, header, selectedIds, settle, load, scrollTo };
  }

  // An app's effect that calls reset() made the reset's own reads and writes of the blocks its own, so it ran again on
  // each, and resets piled up; it also took the selection options as its input, so they reset the data again
  describe('reset from an app effect', () => {
    async function renderFiltered() {
      const fixture = TestBed.createComponent(FilteredTableComponent);
      fixture.autoDetectChanges();
      await fixture.whenStable();
      const component = fixture.componentInstance;
      const host = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('tab-table')!;
      const settle = async () => {
        await new Promise(resolve => setTimeout(resolve));
        await fixture.whenStable();
      };
      const loading = component.table().load();
      await component.server.answerAll(settle);
      await loading;
      return { fixture, component, host, settle };
    }

    it('resets once for each change the effect sees', async () => {
      const { component, settle } = await renderFiltered();
      const { server } = component;
      const requested = server.requests.length;

      component.$filter.set('Person 1');
      await settle();
      await settle();

      expect(server.requests.length - requested).toBe(1);
      await server.answerAll(settle);
      const answered = server.requests.length;

      // the selection options are no input of the app's effect
      component.$selection.set(new SingleSelectionOptions());
      await settle();
      await settle();
      expect(server.requests).toHaveLength(answered);
    });

    // a button toggle's options have no role, so a click on one also replaced the row selection
    it('leaves a click on a button toggle in a cell to the toggle', async () => {
      const { component, host, settle } = await renderFiltered();
      const row = host.querySelectorAll('.data-rows .row')[1];
      const high = Array.from(row.querySelectorAll<HTMLElement>('tab-button-toggle .option')).find(option => option.textContent.trim() === 'High')!;

      high.click();
      await settle();

      expect(component.priorities).toEqual(['high']);
      expect([...component.$selected().keys()]).toEqual([]);
    });
  });

  // F3: the row metrics came from spreading getComputedStyle(), which copies no named property in Firefox, so the
  // height was undefined, load() threw and every table showed "No data available"
  it('shows its rows in every browser', async () => {
    const { host, names, load } = await render();

    expect(await load()).toBe(true);

    expect(names().slice(0, 3)).toEqual(['Person 1', 'Person 2', 'Person 3']);
    expect(host.textContent).not.toContain('No data available');
  });

  // F94: a cell's width was its header's minus the padding, which under a border-box reset (Tailwind's, Bootstrap's)
  // made each cell narrower than its header, and the columns drifted
  it('keeps each cell as wide as its header under a border-box reset', async () => {
    const reset = document.createElement('style');
    reset.textContent = '*, ::before, ::after { box-sizing: border-box; }';
    document.head.append(reset);
    try {
      const { host, rows, load } = await render();
      await load();
      const widths = (elements: Iterable<Element>) => Array.from(elements, element => Math.round(element.getBoundingClientRect().width));

      await vi.waitFor(() => {
        expect(widths(rows()[0].querySelectorAll('.cell'))).toEqual(widths(host.querySelectorAll('.column-header')));
      });
    } finally {
      reset.remove();
    }
  });

  // A cell took its header's width, and the rows counted in the table's width, so the widest the columns had been held
  // the table open: its flexible columns widened with it but never narrowed, and it scrolled sideways
  it('narrows and widens its flexible columns with the table', async () => {
    const { host, rows, load } = await render();
    await load();
    const columnRow = host.querySelector<HTMLElement>('.column-row')!;
    const widths = (elements: Iterable<Element>) => Array.from(elements, element => Math.round(element.getBoundingClientRect().width));

    for (const width of [900, 400, 900]) {
      host.style.width = `${width}px`;
      await vi.waitFor(() => {
        // the columns fill the table and no more, and the cells keep to their headers
        expect(Math.round(columnRow.getBoundingClientRect().width), `${width}px`).toBe(host.clientWidth);
        expect(host.scrollWidth, `${width}px`).toBe(host.clientWidth);
        expect(widths(rows()[0].querySelectorAll('.cell')), `${width}px`).toEqual(widths(host.querySelectorAll('.column-header')));
      });
    }
  });

  // The header row stretched to the table's width, and the rows stayed as wide as their cells, so their rule and a
  // selected row's highlight ended short of the header's
  it('stretches its rows to its width, as its header row, when its columns are narrower', async () => {
    const { host, rows, cell, settle, load } = await render(c => {
      c.$columnWidth.set('100px');
      c.$selection.set(new SingleSelectionOptions());
    });
    host.style.width = '600px';
    await load();

    cell(rows()[1], 'name').click();
    await settle();

    const width = host.querySelector('.column-row')!.getBoundingClientRect().width;
    expect(width).toBe(host.clientWidth);
    expect(rows()[0].getBoundingClientRect().width).toBe(width);
    expect(host.querySelector('.row.selected')!.getBoundingClientRect().width).toBe(width);
  });

  it('scrolls sideways under fixed columns wider than it, its rows as wide as its header row', async () => {
    const { host, rows, load } = await render(c => {
      c.$columnWidth.set('300px');
    });
    host.style.width = '600px';
    await load();
    const widths = (elements: Iterable<Element>) => Array.from(elements, element => Math.round(element.getBoundingClientRect().width));

    await vi.waitFor(() => {
      // three columns of 300 px, the header row and the rows as wide as them, the cells on their headers
      expect(host.querySelector('.column-row')!.getBoundingClientRect().width).toBe(900);
      expect(rows()[0].getBoundingClientRect().width).toBe(900);
      expect(widths(rows()[0].querySelectorAll('.cell'))).toEqual(widths(host.querySelectorAll('.column-header')));
      expect(host.clientWidth).toBeLessThan(900);
      expect(host.scrollWidth).toBe(900);
    });
  });

  // A row was drawn its height tall, its cells' vertical padding spilling over the next row, but counted with that
  // padding, so the space kept for the rows not drawn didn't match them
  it("draws each row as tall as its cells' height and vertical padding", async () => {
    const { host, rows, load } = await render(c => {
      c.$rowCss.set({ height: '40px', lineHeight: '20px', padding: '5px 8px' });
    });
    await load();
    const top = (row: HTMLElement) => row.getBoundingClientRect().top;

    expect(rows()[0].getBoundingClientRect().height).toBe(50);
    expect(top(rows()[1]) - top(rows()[0])).toBe(50);
    // 100 rows of 50 px: the rows drawn and the space kept for the rest
    expect(host.querySelector('.data-rows')!.getBoundingClientRect().height).toBe(5000);
    // the clamp holds the lines of the cell's height, inside its padding
    expect(host.querySelector<HTMLElement>('.line-clamp')!.style.getPropertyValue('-webkit-line-clamp')).toBe('2');
  });

  // F92: load() let the inputs' changes through only once its first block came, so a sort clicked while it loaded
  // showed its arrow over unsorted rows
  it('sorts by a header clicked while it first loads', async () => {
    const { component, server, names, header, settle } = await render();

    const loading = component.table().load();
    await settle();
    header('name').click();
    await server.answerAll(settle);

    expect(await loading).toBe(true);
    expect(component.$sort()).toEqual([{ property: 'name', direction: 'asc' }]);
    expect(names().slice(0, 3)).toEqual(['Person 1', 'Person 10', 'Person 100']);
  });

  // F91: reset(true) reset twice, once itself and once for the sort it cleared; the first, cancelled, let scrolling
  // through, which found no rows yet and dropped the second's block, leaving "No data available"
  it('shows its rows after reset(true) on a scrolled table', async () => {
    const { component, server, names, settle, load, scrollTo, host } = await render(c => {
      c.$sort.set([{ property: 'id', direction: 'desc' }]);
    });
    await load();
    await scrollTo(600);
    const requested = server.requests.length;

    void component.table().reset(true);
    await settle();
    // one reset, though it cleared the sort, which a change to resets on its own
    expect(server.requests.length - requested).toBe(1);
    // the rows go while the first block reloads, so the browser scrolls back up
    host.dispatchEvent(new Event('scroll'));
    await server.answerAll(settle);

    expect(component.$sort()).toEqual([]);
    expect(names().slice(0, 2)).toEqual(['Person 1', 'Person 2']);
    expect(host.textContent).not.toContain('No data available');
  });

  // F93: with row selection, every click in a row was cancelled, the selection checkbox's own included, so it never
  // toggled; nor did a link or a native checkbox in a cell work
  describe('with row selection', () => {
    async function renderSelectable() {
      const rendered = await render(c => {
        c.$selection.set(new MultiSelectionOptions('none'));
      });
      await rendered.load();
      return rendered;
    }

    it('selects a row by its checkbox', async () => {
      const { rows, selectedIds, settle } = await renderSelectable();

      rows()[1].querySelector<HTMLElement>('.cell.check-select .box')!.click();
      await settle();

      expect(selectedIds()).toEqual([2]);
      expect(rows()[1].querySelector<HTMLInputElement>('.cell.check-select input')!.checked).toBe(true);
    });

    it('selects a row by a click on it', async () => {
      const { rows, cell, selectedIds, settle } = await renderSelectable();

      cell(rows()[2], 'name').click();
      await settle();

      expect(selectedIds()).toEqual([3]);
      expect(rows()[2].classList).toContain('selected');
    });

    it('lets a link in a cell work, and selects nothing', async () => {
      const { rows, cell, selectedIds, settle } = await renderSelectable();
      let prevented: boolean | undefined;
      // after the table had the click: whether it was cancelled; then cancelled here, so the page stays
      const watch = (event: Event) => {
        prevented = event.defaultPrevented;
        event.preventDefault();
      };
      document.addEventListener('click', watch);
      try {
        cell(rows()[0], 'profile').querySelector('a')!.click();
        await settle();
      } finally {
        document.removeEventListener('click', watch);
      }

      expect(prevented).toBe(false);
      expect(selectedIds()).toEqual([]);
    });

    it('lets a native checkbox in a cell toggle, and selects nothing', async () => {
      const { rows, cell, selectedIds, settle } = await renderSelectable();
      const follow = cell(rows()[0], 'profile').querySelector('input')!;

      follow.click();
      await settle();

      expect(follow.checked).toBe(true);
      expect(selectedIds()).toEqual([]);
    });

    // F99: a row still loading is an empty placeholder, which reached the app's getRowKey and cellClass and could be
    // selected
    it('gives the app only rows that have loaded', async () => {
      const { component, host, rows, cell, selectedIds, settle } = await renderSelectable();
      host.scrollTop = 1500;
      host.dispatchEvent(new Event('scroll'));
      await settle();
      const loadingRow = rows().find(row => row.querySelector('.status.loader'))!;

      cell(loadingRow, 'id').dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true }));
      await settle();

      expect(selectedIds()).toEqual([]);
      expect(component.classed.filter(row => typeof (row as Partial<Person>).id !== 'number')).toEqual([]);
    });

    // F100: a ctrl-click added the row to the app's own Map before copying it
    it("leaves the app's selection Map as it was", async () => {
      const { component, rows, cell, selectedIds, settle } = await renderSelectable();
      const appSelection = new Map<Primitive, Person>([[1, PEOPLE[0]]]);
      component.$selected.set(appSelection);
      await settle();

      cell(rows()[1], 'name').dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true }));
      await settle();

      expect(selectedIds()).toEqual([1, 2]);
      expect([...appSelection.keys()]).toEqual([1]);
    });

    // F102: the selection options were an input of the reset, so changing them loaded every row again
    it('keeps its rows when the app changes the selection options', async () => {
      const { component, server, settle } = await renderSelectable();
      const requested = server.requests.length;

      component.$selection.set(new SingleSelectionOptions());
      await settle();

      expect(server.requests).toHaveLength(requested);
      expect(server.waiting).toEqual([]);
    });

    it('passes axe', async () => {
      const { fixture } = await renderSelectable();

      // the header row has no row role (#64); the selection column's checkboxes and header have no name (#66)
      expect(
        await axeViolations(fixture.nativeElement as HTMLElement, {
          'aria-required-children': '#64',
          'aria-required-parent': '#64',
          label: '#66',
          'empty-table-header': '#66',
        }),
      ).toEqual([]);
    });
  });

  // F103: the header checkbox's effect read the data manager's all-data info as a plain field, so it never saw the
  // data load, and stayed partial over a selection that held every row
  it('checks the header checkbox when the selection holds every row', async () => {
    const { host, load } = await render(c => {
      c.$options.set(c.server.full);
      c.$selection.set(new MultiSelectionOptions('selectAll'));
      c.$selected.set(new Map(PEOPLE.map(person => [person.id, person])));
    });

    await load();

    const all = host.querySelector<HTMLInputElement>('.column-header.pinned-left input[type="checkbox"]')!;
    expect(all.indeterminate).toBe(false);
    expect(all.checked).toBe(true);
  });

  // F100: a shift-click on a sorted header turned the direction of the app's own sort object
  it("leaves the app's sort objects as they were", async () => {
    const appSort: DataSort = { property: 'id', direction: 'asc' };
    const { component, header, server, settle, load } = await render(c => {
      c.$sort.set([appSort]);
    });
    await load();

    header('id').dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }));
    await server.answerAll(settle);

    expect(component.$sort()).toEqual([{ property: 'id', direction: 'desc' }]);
    expect(appSort).toEqual({ property: 'id', direction: 'asc' });
  });

  it('adds a column to its multi-sort on a shift-click, turns it, then drops it', async () => {
    const { component, header, names, server, settle, load } = await render();
    await load();
    const click = async (column: string, shiftKey = false) => {
      header(column).dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey }));
      await server.answerAll(settle);
    };

    await click('name');
    expect(component.$sort()).toEqual([{ property: 'name', direction: 'asc' }]);
    await click('id', true);
    expect(component.$sort()).toEqual([
      { property: 'name', direction: 'asc' },
      { property: 'id', direction: 'asc' },
    ]);
    await click('id', true);
    expect(component.$sort()).toEqual([
      { property: 'name', direction: 'asc' },
      { property: 'id', direction: 'desc' },
    ]);
    await click('id', true);
    expect(component.$sort()).toEqual([{ property: 'name', direction: 'asc' }]);

    // a plain click sorts by that column alone, then turns it, then clears the sort
    await click('id');
    expect(component.$sort()).toEqual([{ property: 'id', direction: 'asc' }]);
    await click('id');
    expect(names().slice(0, 2)).toEqual(['Person 100', 'Person 99']);
    await click('id');
    expect(component.$sort()).toEqual([]);
  });

  it('selects every row with the header checkbox once the full load is in, and clears them with it', async () => {
    const { host, selectedIds, settle, load } = await render(c => {
      c.$options.set(c.server.full);
      c.$selection.set(new MultiSelectionOptions('selectAll'));
    });
    await load();
    const all = () => host.querySelector<HTMLElement>('.column-header.pinned-left .box')!;

    all().click();
    await settle();
    expect(selectedIds()).toEqual(PEOPLE.map(person => person.id));

    all().click();
    await settle();
    expect(selectedIds()).toEqual([]);
  });

  it('clears a partial selection with the select-none header checkbox', async () => {
    const { host, rows, cell, selectedIds, settle, load } = await render(c => {
      c.$selection.set(new MultiSelectionOptions('selectNone'));
    });
    await load();
    cell(rows()[0], 'name').click();
    cell(rows()[1], 'name').dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true }));
    await settle();
    expect(selectedIds()).toEqual([1, 2]);

    host.querySelector<HTMLElement>('.column-header.pinned-left .box')!.click();
    await settle();

    expect(selectedIds()).toEqual([]);
  });

  it('selects one row at a time with single selection, and a second click clears it', async () => {
    const { rows, cell, selectedIds, settle, load } = await render(c => {
      c.$selection.set(new SingleSelectionOptions());
    });
    await load();

    cell(rows()[1], 'name').click();
    await settle();
    expect(selectedIds()).toEqual([2]);
    cell(rows()[2], 'name').click();
    await settle();
    expect(selectedIds()).toEqual([3]);
    cell(rows()[2], 'name').click();
    await settle();
    expect(selectedIds()).toEqual([]);
  });

  it('clears its selection on the resets its selection options name', async () => {
    const { component, rows, cell, selectedIds, server, settle, load } = await render(c => {
      // cleared on a manual reset only, the default
      c.$selection.set(new MultiSelectionOptions('none'));
    });
    await load();
    const select = async () => {
      cell(rows()[0], 'name').click();
      await settle();
      expect(selectedIds()).toEqual([1]);
    };

    await select();
    component.$sort.set([{ property: 'id', direction: 'asc' }]);
    await server.answerAll(settle);
    expect(selectedIds()).toEqual([1]);
    void component.table().reset();
    await server.answerAll(settle);
    expect(selectedIds()).toEqual([]);

    // cleared on an input's change, and not on a manual reset
    component.$selection.set(new MultiSelectionOptions('none', 'row-and-checkbox', false, true));
    await select();
    void component.table().reset();
    await server.answerAll(settle);
    expect(selectedIds()).toEqual([1]);
    component.$sort.set([]);
    await server.answerAll(settle);
    expect(selectedIds()).toEqual([]);
  });

  // the clamp took a height of 0 when the row's line height measured no pixels, as `normal` doesn't, which hid the text
  it("shows a clamped cell's text when the row's line height is normal", async () => {
    const warned = vi.spyOn(console, 'warn').mockImplementation(() => {
      // recorded only
    });
    try {
      const { component, host, server, settle, load } = await render(c => {
        c.$rowCss.set({ height: '20px', lineHeight: 'normal', padding: '0 8px' });
      });
      await load();

      const clamp = host.querySelector<HTMLElement>('.cell[data-column-id="name"] .line-clamp')!;
      expect(clamp.textContent.trim()).toBe('Person 1');
      expect(clamp.getBoundingClientRect().height).toBeGreaterThan(0);

      // the clamp holds one line then, which it says once, not on each reload()
      for (const reload of [1, 2]) {
        const reloading = component.table().reload();
        await server.answerAll(settle);
        expect(await reloading, `reload ${reload}`).toBe(true);
      }
      expect(warned.mock.calls.filter(([message]) => message === 'Failed to initialize line clamp:')).toHaveLength(1);
    } finally {
      warned.mockRestore();
    }
  });

  // F104: the line clamp was worked out in reload() only, so a taller row from the app kept clamping to one line
  it("clamps a cell's text to the lines its row holds", async () => {
    const { component, host, server, settle, load } = await render();
    await load();
    const clamp = () => host.querySelector<HTMLElement>('.line-clamp')!.style.getPropertyValue('-webkit-line-clamp');
    expect(clamp()).toBe('1');

    component.$rowCss.set({ height: '40px', lineHeight: '20px', padding: '0 8px' });
    await server.answerAll(settle);

    expect(clamp()).toBe('2');
  });

  // F144: the column widths' ResizeObserver was made, and the row measured, while rendering, which the server can't
  it('renders on the server, measuring and observing nothing there', async () => {
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
    const measured = vi.spyOn(window, 'getComputedStyle');
    TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });
    const globals = globalThis as { ngServerMode?: boolean };
    // Angular's own flag for server rendering, which afterNextRender reads
    globals.ngServerMode = true;
    try {
      const { component, host } = await render();

      expect(await component.table().load()).toBe(false);
      expect(created).toEqual([]);
      expect(measured).not.toHaveBeenCalled();
      expect(component.server.requests).toEqual([]);
      expect(host.querySelector('.column-row')!.textContent).toContain('Name');
    } finally {
      delete globals.ngServerMode;
      measured.mockRestore();
      vi.unstubAllGlobals();
    }
  });

  it('passes axe', async () => {
    const { fixture, load } = await render();
    await load();

    // the header row has no row role (#64)
    expect(await axeViolations(fixture.nativeElement as HTMLElement, { 'aria-required-children': '#64', 'aria-required-parent': '#64' })).toEqual([]);
  });
});

// A table whose id column has tooltips of its own, whose bio column clamps a long text, and whose name column is fixed
@Component({
  imports: [TableauUiTableModule],
  template: `
    <tab-table #table style="height: 200px; width: 500px" sortMode="multi" [dataOptions]="server.incremental" [dataRowCss]="{ height: '20px', lineHeight: '20px', padding: '0 8px' }" [(sort)]="$sort">
      <ng-container tabColumnDef="id" width="100px">
        <ng-template [tabHeaderDef]="table">Id</ng-template>
        <ng-template let-ctx [tabCellDef]="table">{{ ctx.row.id }}</ng-template>
        <ng-template [tabHeaderTooltipDef]="table">Unique per person</ng-template>
        <ng-template let-ctx [tabCellTooltipDef]="table" [showTooltip]="evenOnly">Person number {{ ctx.row.id }}</ng-template>
      </ng-container>
      <ng-container tabColumnDef="bio" width="80px" minWidth="40px" [sortable]="false">
        <ng-template [tabHeaderDef]="table">Bio</ng-template>
        <ng-template let-ctx [tabCellDef]="table">{{ ctx.row.name }} likes long walks</ng-template>
      </ng-container>
      <ng-container tabColumnDef="name" [resizable]="false">
        <ng-template [tabHeaderDef]="table">Name</ng-template>
        <ng-template let-ctx [tabCellDef]="table">{{ ctx.row.name }}</ng-template>
      </ng-container>
    </tab-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class NotesTableComponent {
  readonly server = new PeopleServer();
  readonly $sort = signal<DataSort[]>([]);
  readonly evenOnly = (ctx: CellContext<Person>) => ctx.row.id % 2 === 0;
  readonly table = viewChild.required<TableComponent<Person>>(TableComponent);
}

describe('TableComponent tooltips and column widths', () => {
  // what the library's stylesheet (styles/_dialog.service.scss) gives every tooltip, which a test doesn't load
  const stylesheet = document.createElement('style');
  stylesheet.textContent = '.dialog-container { position: fixed; }';

  beforeEach(async () => {
    document.head.appendChild(stylesheet);
    await movePointerAway();
  });

  afterEach(() => {
    stylesheet.remove();
  });

  async function render() {
    const fixture = TestBed.createComponent(NotesTableComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const component = fixture.componentInstance;
    const host = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('tab-table')!;
    const settle = async () => {
      await new Promise(resolve => setTimeout(resolve));
      await fixture.whenStable();
    };
    const loading = component.table().load();
    await component.server.answerAll(settle);
    await loading;
    const header = (column: string) => host.querySelector<HTMLElement>(`.column-header[data-column-id="${column}"]`)!;
    const cell = (row: number, column: string) => host.querySelectorAll<HTMLElement>(`.data-rows .row`)[row].querySelector<HTMLElement>(`.cell[data-column-id="${column}"]`)!;
    // as the user reads it, a line per block; a tooltip is in the page as soon as the pointer comes in, its text at the
    // next render
    const tooltip = () => document.querySelector<HTMLElement>('tab-tooltip')?.innerText.replace(/\s+/g, ' ').trim();
    const shows = async (text: string) => {
      await vi.waitFor(() => {
        expect(tooltip()).toBe(text);
      });
    };
    return { fixture, component, host, header, cell, tooltip, shows, settle };
  }

  it("shows a column's own tooltips, a cell's with its row, where its showTooltip says so", async () => {
    const { header, cell, tooltip, shows } = await render();

    await userEvent.hover(header('id').querySelector('.header-button')!);
    await shows('Unique per person');

    // the first row is person 1, the second person 2
    await userEvent.hover(cell(1, 'id'));
    await shows('Person number 2');
    await userEvent.hover(cell(0, 'id'));
    expect(tooltip()).toBeUndefined();
  });

  it("shows a clamped cell's whole text, and the default header tooltip with what a click does", async () => {
    const { fixture, component, header, cell, tooltip, shows } = await render();

    await userEvent.hover(cell(0, 'bio'));
    await shows('Person 1 likes long walks');
    await userEvent.hover(cell(0, 'name'));
    expect(tooltip()).toBeUndefined();

    await userEvent.hover(header('name').querySelector('.header-button')!);
    await shows('Name Click to sort in Ascending order.');

    await movePointerAway();
    component.$sort.set([{ property: 'id', direction: 'asc' }]);
    await fixture.whenStable();
    await userEvent.hover(header('name').querySelector('.header-button')!);
    await shows('Name Shift + Click to add to multi-sort in Ascending order. Click to sort in Ascending order.');
  });

  it('widens a column by the distance its edge is dragged, and its cells with it', async () => {
    const { header, cell, host } = await render();
    const resizer = header('id').querySelector<HTMLElement>('.resizer')!;
    const start = header('id').getBoundingClientRect().width;
    const x = resizer.getBoundingClientRect().left + 1;

    resizer.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: x }));
    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: x + 40 }));
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: x + 40 }));

    expect(header('id').getBoundingClientRect().width).toBe(start + 40);
    await vi.waitFor(() => {
      expect(cell(0, 'id').getBoundingClientRect().width).toBe(start + 40);
    });
    // a later move, with the button up, changes nothing
    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: x + 100 }));
    expect(header('id').getBoundingClientRect().width).toBe(start + 40);
    // a column that is not resizable has no edge to drag
    expect(header('name').querySelector('.resizer')).toBeNull();
    expect(host.querySelectorAll('.resizer').length).toBe(2);
  });
});

// The library's styles, as an app imports them, while a fixture of it lives: the theme's colours in both modes
@Component({
  template: '',
  styleUrl: '../../styles/lib-styles.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class LibraryStylesComponent {}

// A table of plain text whose columns don't sort, so nothing in it takes focus but its host, with striped rows; its
// columns are 150px wide, so a narrower table scrolls sideways
@Component({
  imports: [TableauUiTableModule],
  template: `
    <button type="button">Before</button>
    <tab-table
      #table
      style="height: 200px"
      [label]="$label()"
      [striped]="true"
      [dataOptions]="server.incremental"
      [dataRowCss]="{ height: '20px', lineHeight: '20px', padding: '0 8px' }"
      [selectionOptions]="$selection()"
    >
      <ng-container tabColumnDef="id" width="150px" [sortable]="false">
        <ng-template [tabHeaderDef]="table">Id</ng-template>
        <ng-template let-ctx [tabCellDef]="table">{{ ctx.row.id }}</ng-template>
      </ng-container>
      <ng-container tabColumnDef="name" width="150px" [sortable]="false">
        <ng-template [tabHeaderDef]="table">Name</ng-template>
        <ng-template let-ctx [tabCellDef]="table">{{ ctx.row.name }}</ng-template>
      </ng-container>
    </tab-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PlainTableComponent {
  readonly server = new PeopleServer();
  readonly $label = signal<string | undefined>(undefined);
  readonly $selection = signal<SelectionOptions | undefined>(undefined);
  readonly table = viewChild.required<TableComponent<Person>>(TableComponent);
}

// An app that names its table with its own static aria-label, and keeps it out of the Tab order
@Component({
  imports: [TableauUiTableModule],
  template: `
    <tab-table #table aria-label="Staff" tabindex="-1" style="height: 200px" [label]="$label()" [dataOptions]="server.incremental">
      <ng-container tabColumnDef="name" [sortable]="false">
        <ng-template [tabHeaderDef]="table">Name</ng-template>
        <ng-template let-ctx [tabCellDef]="table">{{ ctx.row.name }}</ng-template>
      </ng-container>
    </tab-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StaffTableComponent {
  readonly server = new PeopleServer();
  readonly $label = signal<string | undefined>(undefined);
}

// An app that gave its table's host a role of its own
@Component({
  imports: [TableauUiTableModule],
  template: `
    <tab-table #table role="group" aria-label="Staff" style="height: 200px" [label]="$label()" [dataOptions]="server.incremental">
      <ng-container tabColumnDef="name" [sortable]="false">
        <ng-template [tabHeaderDef]="table">Name</ng-template>
        <ng-template let-ctx [tabCellDef]="table">{{ ctx.row.name }}</ng-template>
      </ng-container>
    </tab-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StaffGroupComponent {
  readonly $label = signal<string | undefined>(undefined);
  readonly server = new PeopleServer();
}

// #68: a table whose columns don't sort and whose cells hold no control had nothing that takes focus, so the keyboard
// could scroll it only in a browser that makes a scroll container focusable on its own
describe('TableComponent as a scroll region', () => {
  beforeEach(movePointerAway);

  async function render(setUp?: (component: PlainTableComponent) => void) {
    const fixture = TestBed.createComponent(PlainTableComponent);
    const component = fixture.componentInstance;
    setUp?.(component);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('tab-table')!;
    const settle = async () => {
      await new Promise(resolve => setTimeout(resolve));
      await fixture.whenStable();
    };
    const load = async () => {
      const loading = component.table().load();
      await component.server.answerAll(settle);
      return loading;
    };
    return { fixture, component, host, settle, load };
  }

  it('takes focus from the keyboard, as a region named by its label, its table too', async () => {
    const { host, load } = await render(c => {
      c.$label.set('People');
    });
    await load();
    (host.previousElementSibling as HTMLElement).focus();

    await userEvent.tab();

    expect(document.activeElement).toBe(host);
    expect(page.getByRole('region', { name: 'People', exact: true }).element()).toBe(host);
    expect(page.getByRole('table', { name: 'People', exact: true }).element()).toBe(host.querySelector('.table'));
  });

  it('has no role and no name without a label, and still takes focus', async () => {
    const { fixture, component, host, load } = await render();
    await load();
    const names = () => [host.getAttribute('role'), host.getAttribute('aria-label'), host.querySelector('.table')!.getAttribute('aria-label')];

    expect(host.getAttribute('tabindex')).toBe('0');
    expect(names()).toEqual([null, null, null]);

    // a label with no words names nothing
    component.$label.set(' ');
    await fixture.whenStable();
    expect(names()).toEqual([null, null, null]);
  });

  // A binding that returned null without a label removed the app's own aria-label at the first change detection
  it("takes an app's static aria-label as its name, and its static tabindex in place of its own", async () => {
    const fixture = TestBed.createComponent(StaffTableComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('tab-table')!;
    const names = () => [host.getAttribute('role'), host.getAttribute('aria-label'), host.querySelector('.table')!.getAttribute('aria-label')];

    expect(names()).toEqual(['region', 'Staff', 'Staff']);
    expect(host.getAttribute('tabindex')).toBe('-1');

    // the label wins, and the app's name comes back without it
    fixture.componentInstance.$label.set('People');
    await fixture.whenStable();
    expect(names()).toEqual(['region', 'People', 'People']);
    fixture.componentInstance.$label.set(undefined);
    await fixture.whenStable();
    expect(names()).toEqual(['region', 'Staff', 'Staff']);
  });

  // A role binding that returned null without a label would remove the app's own role
  it("keeps an app's own static role on its host", async () => {
    const fixture = TestBed.createComponent(StaffGroupComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('tab-table')!;
    const roleAndName = () => [host.getAttribute('role'), host.getAttribute('aria-label')];

    expect(roleAndName()).toEqual(['group', 'Staff']);
    fixture.componentInstance.$label.set('People');
    await fixture.whenStable();
    expect(roleAndName()).toEqual(['group', 'People']);
  });

  // An outline inside the host lay under the sticky header row, the pinned cells and the rows, so its top edge never
  // showed, nor its left one beside a pinned column
  it('shows its focus ring on all four edges, over its header row, a pinned column and striped rows', async () => {
    TestBed.createComponent(LibraryStylesComponent);
    // the selection's checkbox column is pinned to the left
    const { host, load } = await render(c => {
      c.$label.set('People');
      c.$selection.set(new MultiSelectionOptions('none', 'checkbox'));
    });
    await load();
    (host.previousElementSibling as HTMLElement).focus();
    // none before it has focus
    expect(await focusRingShown(host)).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });

    await userEvent.tab();

    expect(host.matches(':focus-visible')).toBe(true);
    expect(host.querySelector('.cell.pinned-left')).not.toBeNull();
    await inEachMode(async mode => {
      expect(await focusRingShown(host), mode).toEqual({ top: 1, right: 1, bottom: 1, left: 1 });
    });
  });

  // #115: a failed block's pill was the error colour at 30% opacity, about 1.75:1 on the row, and only its colour told
  // it from the loading pill
  it("draws a failed block's cells at 3:1 or more on each row in both themes, and says they failed", async () => {
    TestBed.createComponent(LibraryStylesComponent);
    await whileLoadsFail(async () => {
      // a row under the pointer takes the highlight while rows select on a click
      const { component, host, settle } = await render(c => {
        c.$selection.set(new SingleSelectionOptions());
      });
      const loading = component.table().load();
      await settle();
      component.server.waiting[0].fail();
      await settle();
      await loading;
      const rows = Array.from(host.querySelectorAll<HTMLElement>('.data-rows .row'));
      const pills = (row: Element) => Array.from(row.querySelectorAll('.status.error'));

      expect(rows.length).toBeGreaterThan(2);
      expect(rows.flatMap(row => pills(row).map(pill => pill.textContent.trim()))).toEqual(rows.flatMap(() => ['Failed to load', 'Failed to load']));
      const words = rows[0].querySelector('.hidden-text')!;
      expect(getComputedStyle(words).clipPath).toBe('inset(50%)');
      expect(words.getBoundingClientRect().width).toBeLessThanOrEqual(1);
      // each pill on its row: a plain row, a striped one, and one under the pointer
      const reds = new Set<string>();
      const ratios = () =>
        rows.slice(0, 2).flatMap(row =>
          pills(row).map(pill => {
            reds.add(getComputedStyle(pill).backgroundColor);
            return { opacity: getComputedStyle(pill).opacity, ratio: contrast(getComputedStyle(pill).backgroundColor, backgroundUnder(pill.parentElement!)) };
          }),
        );
      await inEachMode(async mode => {
        await movePointerAway();
        const atRest = ratios();
        const striped = backgroundUnder(rows[1]);
        await userEvent.hover(rows[1]);
        await vi.waitFor(() => {
          expect(backgroundUnder(rows[1]), mode).not.toBe(striped);
        });
        const hovered = ratios();
        for (const { opacity, ratio } of [...atRest, ...hovered]) {
          expect(opacity, mode).toBe('1');
          expect(ratio, mode).toBeGreaterThanOrEqual(3);
        }
      });
      // each theme's own red
      expect(reds.size).toBe(2);
    });
  });

  // with a pinned column, the bars of the cells it passes over as the table scrolls sideways go under it
  it("keeps a failed block's bars under a pinned column as the table scrolls sideways", async () => {
    TestBed.createComponent(LibraryStylesComponent);
    await whileLoadsFail(async () => {
      const { component, host, settle } = await render(c => {
        c.$selection.set(new MultiSelectionOptions('none', 'checkbox'));
      });
      host.style.width = '150px';
      const loading = component.table().load();
      await settle();
      component.server.waiting[0].fail();
      await settle();
      await loading;
      const row = host.querySelector('.data-rows .row')!;
      const pinned = row.querySelector('.cell.pinned-left')!.getBoundingClientRect();

      host.scrollLeft = 100;
      await settle();

      // a point on the pinned cell, beside its left edge, finds the cell, not a bar scrolled under it
      const hit = document.elementFromPoint(pinned.left + 2, pinned.top + pinned.height / 2);
      expect(hit?.closest('.cell')).toBe(row.querySelector('.cell.pinned-left'));
      expect(Array.from(row.querySelectorAll('.cell:not(.pinned-left) .status.error')).some(bar => bar.getBoundingClientRect().left < pinned.right)).toBe(true);
    });
  });

  it('passes axe with scrollable-region-focusable on, though no column sorts', async () => {
    const { fixture, load } = await render(c => {
      c.$label.set('People');
    });
    await load();

    // the header row has no row role (#64)
    expect(await axeViolations(fixture.nativeElement as HTMLElement, { 'aria-required-children': '#64', 'aria-required-parent': '#64' })).toEqual([]);
  });
});
