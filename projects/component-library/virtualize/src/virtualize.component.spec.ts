import { ChangeDetectionStrategy, Component, effect, PLATFORM_ID, signal, viewChild, ViewEncapsulation } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { page, userEvent } from 'vitest/browser';
import { axeViolations } from '../../testing/axe';
import { backgroundUnder, contrast, inEachMode } from '../../testing/contrast';
import { whileLoadsFail } from '../../testing/failing-loads';
import { focusRingShown } from '../../testing/focus-ring';
import type { Person } from '../../testing/people';
import { PEOPLE, PeopleServer } from '../../testing/people';
import type { DataRowCss } from './base/virutalize-base.component';
import type { DataOptions } from './data/data-options';
import type { DataSort } from './data/data-sort';
import { TableauUiVirtualizeModule } from './tableau-ui-virtualize.module';
import { VirtualizeComponent } from './virtualize.component';

@Component({
  imports: [TableauUiVirtualizeModule],
  template: `
    <button type="button">Before</button>
    <tab-virtualize #list style="height: 200px" [style.fontSize]="$fontSize()" [label]="$label()" [dataOptions]="$options()" [(dataSort)]="$sort" [dataRowCss]="$rowCss()">
      @if ($customLoader()) {
        <ng-template tabCustomLoader>Loading people</ng-template>
      }
      @if ($rowLoader()) {
        <ng-template let-meta tabItemLoadingTemplate>Loading row {{ meta.index + 1 }}</ng-template>
      }
      @if ($errorTemplate()) {
        <ng-template tabItemErrorTemplate>Not loaded</ng-template>
      }
      @if ($padded()) {
        <ng-template let-ctx [tabItemTemplate]="list">
          <div class="padded" style="width: 100%; padding: 0 16px">
            <div class="line" style="width: 100%; padding: 0 16px">{{ ctx.item.name }}</div>
          </div>
        </ng-template>
      } @else {
        <ng-template let-ctx [tabItemTemplate]="list">{{ ctx.item.name }}</ng-template>
      }
    </tab-virtualize>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PeopleListComponent {
  readonly $rowLoader = signal(false);
  readonly server = new PeopleServer();
  readonly $options = signal<DataOptions<Person>>(this.server.incremental);
  readonly $sort = signal<DataSort[]>([]);
  // 20 px rows, 10 to the 200 px window
  readonly $rowCss = signal<DataRowCss>({ height: '20px', lineHeight: '20px', padding: '0 8px' });
  readonly $fontSize = signal<string | null>(null);
  readonly $customLoader = signal(false);
  readonly $errorTemplate = signal(true);
  readonly $label = signal<string | undefined>(undefined);
  // an item template whose root, and a block in it, are full width with padding of their own
  readonly $padded = signal(false);
  readonly list = viewChild.required<VirtualizeComponent<Person>>(VirtualizeComponent);
}

// An app that reloads its list from an effect of its own whenever the list is shown, as a tab's content may
@Component({
  imports: [TableauUiVirtualizeModule],
  template: `
    <tab-virtualize #list style="height: 200px" [dataOptions]="server.incremental" [(dataSort)]="$sort" [dataRowCss]="rowCss">
      <ng-template let-ctx [tabItemTemplate]="list">{{ ctx.item.name }}</ng-template>
    </tab-virtualize>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ShownListComponent {
  readonly server = new PeopleServer();
  readonly $sort = signal<DataSort[]>([]);
  readonly $shown = signal(false);
  readonly rowCss: DataRowCss = { height: '20px', lineHeight: '20px', padding: '0 8px' };
  readonly list = viewChild.required<VirtualizeComponent<Person>>(VirtualizeComponent);
  readonly reloadWhenShown = effect(() => {
    if (this.$shown()) {
      void this.list().reload();
    }
  });
}

// The library's styles, as an app imports them, while a fixture of it lives: the theme's colours in both modes
@Component({
  template: '',
  styleUrl: '../../styles/lib-styles.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class LibraryStylesComponent {}

// An app whose items have a role of their own, and which names its list itself
@Component({
  imports: [TableauUiVirtualizeModule],
  template: `
    <tab-virtualize #list role="listbox" aria-label="People" style="height: 200px" [label]="$label()" [dataOptions]="server.incremental" [dataSort]="[]" [dataRowCss]="rowCss">
      <ng-template let-ctx [tabItemTemplate]="list">
        <div role="option" aria-selected="false">{{ ctx.item.name }}</div>
      </ng-template>
    </tab-virtualize>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class OptionsListComponent {
  readonly server = new PeopleServer();
  readonly $label = signal<string | undefined>(undefined);
  readonly rowCss: DataRowCss = { height: '20px', lineHeight: '20px', padding: '0 8px' };
  readonly list = viewChild.required<VirtualizeComponent<Person>>(VirtualizeComponent);
}

// An app that names its list with its own static aria-label, and keeps it out of the Tab order
@Component({
  imports: [TableauUiVirtualizeModule],
  template: `
    <tab-virtualize #list aria-label="Customers" tabindex="-1" style="height: 200px" [label]="$label()" [dataOptions]="server.incremental" [dataSort]="[]" [dataRowCss]="rowCss">
      <ng-template let-ctx [tabItemTemplate]="list">{{ ctx.item.name }}</ng-template>
    </tab-virtualize>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class CustomersListComponent {
  readonly server = new PeopleServer();
  readonly $label = signal<string | undefined>(undefined);
  readonly rowCss: DataRowCss = { height: '20px', lineHeight: '20px', padding: '0 8px' };
  readonly list = viewChild.required<VirtualizeComponent<Person>>(VirtualizeComponent);
}

describe('VirtualizeComponent', () => {
  async function render(setUp?: (component: PeopleListComponent) => void) {
    const fixture = TestBed.createComponent(PeopleListComponent);
    const component = fixture.componentInstance;
    setUp?.(component);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('tab-virtualize')!;
    // the names the rows show, in order
    const shown = () => Array.from(host.querySelectorAll('.item'), item => item.textContent.trim()).filter(text => text !== '');
    // lets the answers' promises run and the page render
    const settle = async () => {
      await new Promise(resolve => setTimeout(resolve));
      await fixture.whenStable();
    };
    const { server } = component;
    // loads, answering each request
    const load = async () => {
      const loading = component.list().load();
      await server.answerAll(settle);
      return loading;
    };
    const scrollTo = async (top: number) => {
      host.scrollTop = top;
      host.dispatchEvent(new Event('scroll'));
      await server.answerAll(settle);
    };
    return { fixture, component, host, server, shown, settle, load, scrollTo };
  }

  // F3: the row metrics came from spreading getComputedStyle(), which copies no named property in Firefox, so the
  // height was undefined, load() threw and the list showed "No data available"
  it('shows its rows in every browser', async () => {
    const { host, shown, load } = await render();

    expect(await load()).toBe(true);

    expect(shown().slice(0, 3)).toEqual(['Person 1', 'Person 2', 'Person 3']);
    expect(host.textContent).not.toContain('No data available');
    // 100 rows of 20 px: the rows shown and the space for the rest
    expect(host.scrollHeight).toBe(2000);
  });

  it("shows the app's loading template in each row still loading, with the row's place", async () => {
    const { component, shown, settle, server } = await render(c => {
      c.$rowLoader.set(true);
    });

    const loading = component.list().load();
    await settle();
    expect(shown().slice(0, 3)).toEqual(['Loading row 1', 'Loading row 2', 'Loading row 3']);

    await server.answerAll(settle);
    await loading;
    expect(shown().slice(0, 3)).toEqual(['Person 1', 'Person 2', 'Person 3']);
  });

  // F109: a row was measured on the body, so with another font size in the list its em height was wrong, and the
  // space kept for the rows not shown didn't match the rows
  it('measures a row in its own font size', async () => {
    const { component, host, load } = await render(c => {
      c.$fontSize.set('10px');
      c.$rowCss.set({ height: '2em', lineHeight: '2em', padding: '0 8px' });
    });

    await load();

    expect(host.querySelector<HTMLElement>('.item')!.getBoundingClientRect().height).toBe(20);
    expect(host.scrollHeight).toBe(2000);
    expect(component.server.requests[0].count).toBe(10);
  });

  // A row was counted with its vertical padding, but under an app's border-box reset drawn without it, so the space
  // kept for the rows not drawn didn't match them
  it('draws a row as tall as it counts it, its height and vertical padding, under a border-box reset', async () => {
    const reset = document.createElement('style');
    reset.textContent = '*, ::before, ::after { box-sizing: border-box; }';
    document.head.append(reset);
    try {
      const { host, load } = await render(c => {
        c.$rowCss.set({ height: '20px', lineHeight: '20px', padding: '5px 8px' });
      });
      await load();

      expect(host.querySelector('.item')!.getBoundingClientRect().height).toBe(30);
      // 100 rows of 30 px: the rows drawn and the space kept for the rest
      expect(host.scrollHeight).toBe(3000);
    } finally {
      reset.remove();
    }
  });

  // Under a reset whose elements inherit their box-sizing, as Bulma's and Foundation's do, a row drawn content-box handed
  // that to the app's template: a full-width block with padding of its own was wider than the row, and clipped
  it("leaves the app's own box-sizing to the content of a row, under a reset that inherits it", async () => {
    const reset = document.createElement('style');
    reset.textContent = 'html { box-sizing: border-box; } *, ::before, ::after { box-sizing: inherit; }';
    document.head.append(reset);
    try {
      const { host, load } = await render(c => {
        c.$padded.set(true);
        c.$rowCss.set({ height: '20px', lineHeight: '20px', padding: '5px 8px' });
      });
      await load();
      const item = host.querySelector('.item')!;
      const box = (selector: string) => item.querySelector(selector)!.getBoundingClientRect();
      const row = item.getBoundingClientRect();

      // inside the row's padding, 8px a side
      for (const selector of ['.padded', '.line']) {
        expect(box(selector).left, selector).toBeGreaterThanOrEqual(row.left + 8);
        expect(box(selector).right, selector).toBeLessThanOrEqual(row.right - 8);
      }
      // the row is still as tall as it counts it
      expect(row.height).toBe(30);
      expect(host.scrollHeight).toBe(3000);
    } finally {
      reset.remove();
    }
  });

  // A failed full load was logged by the full load, by its first block and by the reset, and rethrown by the first two,
  // so the app's ErrorHandler got the one failure twice; a first block that failed was logged by the reset again too
  it.each([
    ['full load', 'full', 'Error loading all data:'],
    ['first block', 'incremental', 'Error loading data block:'],
  ] as const)('reports a %s that fails once, and shows its rows as failed', async (_, options, message) => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {
      // recorded only
    });
    // the one report rethrown for the app's ErrorHandler; this test's listener takes it, as an app's would
    const rejections: unknown[] = [];
    const listener = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      rejections.push(event.reason);
    };
    window.addEventListener('unhandledrejection', listener);
    try {
      const { component, server, shown, settle } = await render(c => {
        c.$options.set(c.server[options]);
      });
      const loading = component.list().load();
      await settle();
      server.waiting[0].fail();
      await settle();

      expect(await loading).toBe(true);
      expect(shown().slice(0, 2)).toEqual(['Not loaded', 'Not loaded']);
      // the rethrown rejection is reported after the microtasks
      await new Promise(resolve => setTimeout(resolve, 100));
      // the library's own messages: the test browser logs the rejection too
      expect(logged.mock.calls.filter(([first]) => typeof first === 'string')).toEqual([[message, new Error('The server failed')]]);
      expect(rejections).toEqual([new Error('The server failed')]);
    } finally {
      window.removeEventListener('unhandledrejection', listener);
      logged.mockRestore();
    }
  });

  // #119: a failed first block left the row count at 0, so the first scroll event dropped its rows, which said they
  // failed, and showed "No data available"
  it.each(['incremental', 'full'] as const)('keeps the failed rows of its first block through a scroll, until a reload loads the data, with %s data', async options => {
    await whileLoadsFail(async () => {
      const { component, host, server, shown, settle, scrollTo } = await render(c => {
        c.$options.set(c.server[options]);
        c.$errorTemplate.set(false);
      });
      const sizes = () => Array.from(host.querySelectorAll('.item'), item => item.getAttribute('aria-setsize'));
      const loading = component.list().load();
      await settle();
      server.waiting[0].fail();
      await settle();
      expect(await loading).toBe(true);

      // the ten failed rows fill the list, so it can't move: the event comes, as when a table scrolls sideways
      host.dispatchEvent(new Event('scroll'));
      await settle();

      expect(host.textContent).not.toContain('No data available');
      expect(shown()).toEqual(Array.from({ length: 10 }, () => 'Failed to load'));
      // the total is still unknown
      expect(sizes()).toEqual(Array.from({ length: 10 }, () => '-1'));
      expect(server.requests).toHaveLength(1);

      const reloading = component.list().reload();
      await server.answerAll(settle);

      expect(await reloading).toBe(true);
      expect(shown().slice(0, 3)).toEqual(['Person 1', 'Person 2', 'Person 3']);
      expect(sizes()[0]).toBe('100');
      // and scrolling moves the rows again
      await scrollTo(1200);
      expect(shown()).toContain('Person 61');
    });
  });

  // an app's effect that called reload() took the sort the reload read as its own input, so a sort change ran it
  // again, and the data loaded twice
  it('loads once for a sort change after an app effect reloaded it', async () => {
    const fixture = TestBed.createComponent(ShownListComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const component = fixture.componentInstance;
    const settle = async () => {
      await new Promise(resolve => setTimeout(resolve));
      await fixture.whenStable();
    };
    component.$shown.set(true);
    await component.server.answerAll(settle);
    const requested = component.server.requests.length;
    expect(requested).toBeGreaterThan(0);

    component.$sort.set([{ property: 'id', direction: 'desc' }]);
    await settle();
    await settle();

    expect(component.server.requests.length - requested).toBe(1);
  });

  // a row was measured when dataRowCss changed only, so reload() after a change of font kept the old row height
  it('measures a row again on reload(), after the font changes', async () => {
    const { component, server, settle, load } = await render(c => {
      c.$fontSize.set('10px');
      c.$rowCss.set({ height: '2em', lineHeight: '2em', padding: '0 8px' });
    });
    await load();
    expect(server.requests[0].count).toBe(10);

    component.$fontSize.set('20px');
    await settle();
    const requested = server.requests.length;
    const reloading = component.list().reload();
    await server.answerAll(settle);

    expect(await reloading).toBe(true);
    // 40 px rows, 5 to the window
    expect(server.requests[requested].count).toBe(5);
  });

  // a full load's block listened on the full load for its cancel, and a block scrolling dropped kept that listener
  it('keeps no listener on a full load for the blocks scrolling drops', async () => {
    const { component, settle, load, scrollTo } = await render(c => {
      c.$options.set(c.server.full);
    });
    await load();
    for (const top of [400, 800, 1200, 1600]) {
      await scrollTo(top);
    }
    // controllers cancelled a second time: a dropped block's, reached again through a listener it left
    const again: AbortController[] = [];
    const abort = AbortController.prototype.abort;
    const cancels = vi.spyOn(AbortController.prototype, 'abort').mockImplementation(function (this: AbortController, reason?: unknown) {
      if (this.signal.aborted) {
        again.push(this);
      }
      abort.call(this, reason);
    });
    try {
      void component.list().reset();
      await settle();
    } finally {
      cancels.mockRestore();
    }

    expect(again).toEqual([]);
  });

  // F92: load() let the inputs' changes through only once its first block came, so a sort set while it loaded was
  // dropped
  it('loads with the sort the app sets while it first loads', async () => {
    const { component, server, shown, settle } = await render();

    const loading = component.list().load();
    await settle();
    component.$sort.set([{ property: 'id', direction: 'desc' }]);
    await server.answerAll(settle);

    expect(await loading).toBe(true);
    expect(shown().slice(0, 2)).toEqual(['Person 100', 'Person 99']);
    expect(server.requests.at(-1)!.sort).toEqual([{ property: 'id', direction: 'desc' }]);
  });

  // F91: a reset another one overtook still wrote the shared state when its block was cancelled: it let scrolling
  // through, which found no rows yet and dropped the newer reset's block, leaving "No data available"
  it('leaves the rows to the newer of two resets', async () => {
    const { component, server, shown, settle, load, scrollTo, host } = await render();
    await load();
    await scrollTo(600);

    // the app resets twice in a row, as a double click on its refresh button does
    void component.list().reset();
    void component.list().reset();
    await settle();
    // the rows go while the first block reloads, so the browser scrolls back up
    host.dispatchEvent(new Event('scroll'));
    await server.answerAll(settle);

    expect(shown().slice(0, 2)).toEqual(['Person 1', 'Person 2']);
  });

  // F91: an overtaken request that a server answered anyway set the row count and finished its reset
  it('ignores the answer to a request a newer reset replaced', async () => {
    const { component, server, shown, settle, load, host } = await render();
    await load();
    server.ignoresAbort = true;

    void component.list().reset();
    await settle();
    const overtaken = server.waiting;
    server.rows = PEOPLE.slice(0, 5);
    void component.list().reset();
    await settle();
    for (const request of server.waiting.filter(request => !overtaken.includes(request))) {
      request.answer();
    }
    await settle();
    expect(shown()).toEqual(['Person 1', 'Person 2', 'Person 3', 'Person 4', 'Person 5']);

    server.rows = PEOPLE;
    await server.answerAll(settle);
    host.dispatchEvent(new Event('scroll'));
    await server.answerAll(settle);

    expect(shown()).toEqual(['Person 1', 'Person 2', 'Person 3', 'Person 4', 'Person 5']);
  });

  // F98: cancelling a full load, as two quick sorts do, logged errors and rejected two promises nobody handled, which
  // reach the app's ErrorHandler as errors
  it('cancels a load a newer one replaces without an error', async () => {
    const rejections: unknown[] = [];
    const listener = (event: PromiseRejectionEvent) => rejections.push(event.reason);
    window.addEventListener('unhandledrejection', listener);
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {
      // recorded only
    });
    try {
      const { component, server, shown, settle, load } = await render(c => {
        c.$options.set(c.server.full);
      });
      await load();

      component.$sort.set([{ property: 'id', direction: 'desc' }]);
      await settle();
      component.$sort.set([{ property: 'name', direction: 'asc' }]);
      await server.answerAll(settle);
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(rejections).toEqual([]);
      expect(logged.mock.calls).toEqual([]);
      expect(shown().slice(0, 3)).toEqual(['Person 1', 'Person 10', 'Person 100']);
    } finally {
      window.removeEventListener('unhandledrejection', listener);
      logged.mockRestore();
    }
  });

  // F106: a destroyed list kept loading, and wrote its answers into a list nobody saw
  it('cancels its loads when it is destroyed', async () => {
    const { fixture, component, server, settle } = await render();
    void component.list().load();
    await settle();
    const [first] = server.waiting;

    fixture.destroy();

    expect(first.abort.aborted).toBe(true);
  });

  it('shows its custom loader until the newest reset has its first block', async () => {
    const { component, host, server, shown, settle } = await render(c => {
      c.$customLoader.set(true);
    });

    const loading = component.list().load();
    await settle();
    expect(host.textContent).toContain('Loading people');
    await server.answerAll(settle);
    await loading;
    expect(host.textContent).not.toContain('Loading people');

    // the first reset's block is cancelled by the second, which still loads
    void component.list().reset();
    void component.list().reset();
    await settle();
    expect(host.textContent).toContain('Loading people');
    await server.answerAll(settle);

    expect(host.textContent).not.toContain('Loading people');
    expect(shown()[0]).toBe('Person 1');
  });

  it('shows its error template for the rows of a block that fails, and reports the error', async () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {
      // recorded only
    });
    // the failure is rethrown for the app's ErrorHandler; this test's listener takes it, as an app's would, where
    // Vitest would count it as an error of the run
    const expected = (event: PromiseRejectionEvent) => {
      event.preventDefault();
    };
    window.addEventListener('unhandledrejection', expected);
    try {
      const { component, host, server, shown, settle } = await render();
      const loading = component.list().load();
      await settle();
      server.waiting[0].answer();
      await settle();
      await loading;

      // the second block fails, the others come
      server.waiting.find(request => request.offset === 10)!.fail();
      await server.answerAll(settle);

      expect(shown().slice(0, 11)).toEqual([...PEOPLE.slice(0, 10).map(person => person.name), 'Not loaded']);
      expect(host.querySelectorAll('.item').length).toBe(50);
      // logged, and rethrown for the app's error handling, unlike a cancel
      expect(logged.mock.calls[0]).toEqual(['Error loading data block:', new Error('The server failed')]);
      // the rethrown rejection is reported after the microtasks, while the listener still takes it
      await new Promise(resolve => setTimeout(resolve, 100));
    } finally {
      window.removeEventListener('unhandledrejection', expected);
      logged.mockRestore();
    }
  });

  it('reloads when the app changes its data options', async () => {
    const { component, server, shown, settle, load } = await render();
    await load();
    const other = new PeopleServer(PEOPLE.slice(0, 3));

    component.$options.set(other.incremental);
    await other.answerAll(settle);

    expect(shown()).toEqual(['Person 1', 'Person 2', 'Person 3']);
    expect(server.waiting).toEqual([]);
  });

  it('shows no rows for no data', async () => {
    const { component, host, load } = await render(c => {
      c.server.rows = [];
    });

    expect(await load()).toBe(true);

    expect(component.server.requests).toHaveLength(1);
    expect(host.textContent).toContain('No data available');
  });

  // F144: the row was measured while rendering, with the document and getComputedStyle, which the server has not
  it('renders on the server, measuring nothing there', async () => {
    const measured = vi.spyOn(window, 'getComputedStyle');
    TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });
    const globals = globalThis as { ngServerMode?: boolean };
    // Angular's own flag for server rendering, which afterNextRender reads
    globals.ngServerMode = true;
    try {
      const { component, host } = await render();

      expect(await component.list().load()).toBe(false);
      expect(measured).not.toHaveBeenCalled();
      expect(component.server.requests).toEqual([]);
      expect(host.textContent).toContain('No data available');
    } finally {
      delete globals.ngServerMode;
      measured.mockRestore();
    }
  });

  // #68: a list of plain text held nothing focusable, so the keyboard could scroll it only in a browser that makes a
  // scroll container focusable on its own, and a screen reader met unnamed text
  describe('as a scroll region', () => {
    const items = (host: HTMLElement) => Array.from(host.querySelectorAll('.item'));
    const place = (item: Element) => [item.getAttribute('role'), item.getAttribute('aria-posinset'), item.getAttribute('aria-setsize')];

    it('takes focus from the keyboard, as a list named by its label', async () => {
      const { host, load } = await render(c => {
        c.$label.set('People');
      });
      await load();
      const before = host.previousElementSibling as HTMLElement;
      before.focus();

      await userEvent.tab();

      expect(document.activeElement).toBe(host);
      expect(page.getByRole('list', { name: 'People', exact: true }).element()).toBe(host);
    });

    it('loads the next block as the arrow keys scroll it', async () => {
      const { host, server, shown, settle, load } = await render();
      await load();
      // blocks of 10 rows: the first five load, the sixth once the list scrolls past its first 200px
      expect(server.requests.map(request => request.offset)).toEqual([0, 10, 20, 30, 40]);
      host.focus();

      for (let press = 0; press < 40 && !server.requests.some(request => request.offset === 50); press++) {
        await userEvent.keyboard('{ArrowDown}');
        await server.answerAll(settle);
      }

      expect(host.scrollTop).toBeGreaterThan(0);
      expect(server.requests.some(request => request.offset === 50)).toBe(true);
      expect(shown()).toContain('Person 51');
    });

    it('gives each item its place in the whole list, and a size of -1 until the total is known', async () => {
      const { component, host, server, settle, scrollTo } = await render();

      const loading = component.list().load();
      await settle();
      // the first block's ten rows, still loading
      expect(items(host).map(place)).toEqual(Array.from({ length: 10 }, (_, i) => ['listitem', `${i + 1}`, '-1']));

      await server.answerAll(settle);
      await loading;
      expect(place(items(host)[0])).toEqual(['listitem', '1', '100']);

      await scrollTo(1200);
      const person = items(host).find(item => item.textContent.trim() === 'Person 61')!;
      expect(place(person)).toEqual(['listitem', '61', '100']);
    });

    // A block still loading, or failed, held a placeholder for each item a block can hold, so the last block's ran past
    // the size: "item 100 of 95"
    it('places no item past its size while its last block loads, nor once it failed', async () => {
      await whileLoadsFail(async () => {
        // 95 people in blocks of 10: the last block, from the 91st, holds five
        const { host, server, settle, load } = await render(c => {
          c.server.rows = PEOPLE.slice(0, 95);
          c.$errorTemplate.set(false);
        });
        await load();
        const places = () => items(host).map(item => Number(item.getAttribute('aria-posinset')));

        host.scrollTop = host.scrollHeight;
        host.dispatchEvent(new Event('scroll'));
        await settle();
        const last = server.waiting.find(request => request.offset === 90)!;
        expect(last.count).toBe(10);
        expect(items(host).at(-1)!.querySelector('.status.loader')).not.toBeNull();
        expect(Math.max(...places())).toBe(95);
        expect(items(host).every(item => item.getAttribute('aria-setsize') === '95')).toBe(true);
        // no taller than once it loads: 95 items of 20 px
        expect(host.scrollHeight).toBe(1900);

        last.fail();
        await settle();
        expect(items(host).at(-1)!.textContent).toContain('Failed to load');
        expect(Math.max(...places())).toBe(95);
      });
    });

    it('is a region named by its label while it shows no items, and has no role and no name without a label', async () => {
      const { component, host, fixture, server, settle } = await render(c => {
        c.$customLoader.set(true);
      });
      const roleAndName = () => [host.getAttribute('role'), host.getAttribute('aria-label')];
      // its no-data template, before it loads
      expect(roleAndName()).toEqual([null, null]);
      expect(host.getAttribute('tabindex')).toBe('0');

      component.$label.set('People');
      await fixture.whenStable();
      expect(roleAndName()).toEqual(['region', 'People']);

      // its custom loader, while its first block loads
      const loading = component.list().load();
      await settle();
      expect(host.textContent).toContain('Loading people');
      expect(roleAndName()).toEqual(['region', 'People']);

      await server.answerAll(settle);
      await loading;
      expect(roleAndName()).toEqual(['list', 'People']);

      component.$label.set(undefined);
      await fixture.whenStable();
      expect(roleAndName()).toEqual(['list', null]);
    });

    // A binding that returned null without a label removed the app's own aria-label at the first change detection
    it("takes an app's static aria-label as its name, and its static tabindex in place of its own", async () => {
      const fixture = TestBed.createComponent(CustomersListComponent);
      fixture.autoDetectChanges();
      await fixture.whenStable();
      const component = fixture.componentInstance;
      const host = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('tab-virtualize')!;
      const settle = async () => {
        await new Promise(resolve => setTimeout(resolve));
        await fixture.whenStable();
      };
      const roleAndName = () => [host.getAttribute('role'), host.getAttribute('aria-label')];

      // no items yet
      expect(roleAndName()).toEqual(['region', 'Customers']);
      expect(host.getAttribute('tabindex')).toBe('-1');

      const loading = component.list().load();
      await component.server.answerAll(settle);
      await loading;
      expect(roleAndName()).toEqual(['list', 'Customers']);

      // the label wins, and the app's name comes back without it
      component.$label.set('People');
      await fixture.whenStable();
      expect(roleAndName()).toEqual(['list', 'People']);
      component.$label.set(undefined);
      await fixture.whenStable();
      expect(roleAndName()).toEqual(['list', 'Customers']);
    });

    it('shows its focus ring on all four edges', async () => {
      TestBed.createComponent(LibraryStylesComponent);
      const { host, load } = await render(c => {
        c.$label.set('People');
      });
      await load();
      (host.previousElementSibling as HTMLElement).focus();
      // none before it has focus
      expect(await focusRingShown(host)).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });

      await userEvent.tab();

      expect(host.matches(':focus-visible')).toBe(true);
      await inEachMode(async mode => {
        expect(await focusRingShown(host), mode).toEqual({ top: 1, right: 1, bottom: 1, left: 1 });
      });
    });

    // A role binding that returned null to turn the list roles off would remove the app's own role and name
    it("keeps an app's own static role and name on its host, and gives its items no role", async () => {
      const fixture = TestBed.createComponent(OptionsListComponent);
      fixture.autoDetectChanges();
      await fixture.whenStable();
      const component = fixture.componentInstance;
      const host = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('tab-virtualize')!;
      const settle = async () => {
        await new Promise(resolve => setTimeout(resolve));
        await fixture.whenStable();
      };
      const roleAndName = () => [host.getAttribute('role'), host.getAttribute('aria-label')];
      const loading = component.list().load();
      await component.server.answerAll(settle);
      await loading;

      expect(page.getByRole('listbox', { name: 'People', exact: true }).element()).toBe(host);
      expect(host.getAttribute('tabindex')).toBe('0');
      expect(page.getByRole('option').elements()).toHaveLength(50);
      expect(items(host).filter(item => place(item).some(value => value !== null))).toEqual([]);
      expect(await axeViolations(fixture.nativeElement as HTMLElement)).toEqual([]);

      // the label names it in place of the app's own name, which comes back without it
      component.$label.set('Staff');
      await fixture.whenStable();
      expect(roleAndName()).toEqual(['listbox', 'Staff']);
      component.$label.set(undefined);
      await fixture.whenStable();
      expect(roleAndName()).toEqual(['listbox', 'People']);
    });
  });

  // #115: a failed block's pill was the error colour at 30% opacity, about 1.75:1 on the row, and only its colour told
  // it from the loading pill
  it("draws a failed block's rows at 3:1 or more in both themes, and says they failed", async () => {
    TestBed.createComponent(LibraryStylesComponent);
    await whileLoadsFail(async () => {
      const { component, host, server, settle } = await render(c => {
        c.$errorTemplate.set(false);
      });
      const loading = component.list().load();
      await settle();
      server.waiting[0].fail();
      await settle();
      await loading;
      const pills = Array.from(host.querySelectorAll('.item .status.error'));

      expect(pills.map(pill => pill.textContent.trim())).toEqual(Array.from({ length: 10 }, () => 'Failed to load'));
      // out of sight: one clipped pixel in the pill
      const words = pills[0].querySelector('.hidden-text')!;
      expect(getComputedStyle(words).clipPath).toBe('inset(50%)');
      expect(words.getBoundingClientRect().width).toBeLessThanOrEqual(1);
      const reds = new Set<string>();
      await inEachMode(mode => {
        for (const pill of pills) {
          reds.add(getComputedStyle(pill).backgroundColor);
          expect(getComputedStyle(pill).opacity, mode).toBe('1');
          expect(contrast(getComputedStyle(pill).backgroundColor, backgroundUnder(pill.parentElement!)), mode).toBeGreaterThanOrEqual(3);
        }
      });
      // each theme's own red
      expect(reds.size).toBe(2);
    });
  });

  it('passes axe, with no rule off', async () => {
    const { fixture, load } = await render(c => {
      c.$label.set('People');
    });
    expect(await axeViolations(fixture.nativeElement as HTMLElement), 'no items').toEqual([]);

    await load();

    expect(await axeViolations(fixture.nativeElement as HTMLElement), 'items').toEqual([]);
  });
});
