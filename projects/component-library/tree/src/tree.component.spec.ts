import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { axeViolations } from '../../testing/axe';
import { TableauUiTreeModule } from './tableau-ui-tree.module';
import { TabTreeNodeComponent } from './tree-node.component';

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

  // I9: the node offered forms a value accessor with no writeValue, so a form control on it threw a TypeError
  it('offers forms no value accessor on a node', async () => {
    const { fixture } = await render();
    const node = fixture.debugElement.query(By.directive(TabTreeNodeComponent));

    expect(node.injector.get(NG_VALUE_ACCESSOR, null)).toBeNull();
  });
});
