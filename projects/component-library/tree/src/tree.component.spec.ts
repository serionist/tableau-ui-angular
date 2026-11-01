import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { axeViolations } from '../../testing/axe';
import { TableauUiTreeModule } from './tableau-ui-tree.module';
import { TabTreeNodeComponent } from './tree-node.component';
import { TabTreeComponent } from './tree.component';

@Component({
  imports: [TableauUiTreeModule],
  template: `
    <tab-tree gridLinesBorder="1px solid gray">
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
    <tab-tree [hierarchyMode]="$mode()">
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
      const { shown } = await render();

      expect(shown()).toEqual(['Reports', 'Sales', 'Costs']);
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

  // I9: the node offered forms a value accessor with no writeValue, so a form control on it threw a TypeError
  it('offers forms no value accessor on a node', async () => {
    const { fixture } = await render();
    const node = fixture.debugElement.query(By.directive(TabTreeNodeComponent));

    expect(node.injector.get(NG_VALUE_ACCESSOR, null)).toBeNull();
  });
});
