import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axeViolations } from '../../testing/axe';
import { TableauUiArrowScrollModule } from './tableau-ui-arrow-scroll.module';

@Component({
  imports: [TableauUiArrowScrollModule],
  template: `
    <tab-arrow-scroll scrollType="arrow" scrollDirection="horizontal" style="display: flex; width: 120px">
      <nav style="display: flex; gap: 8px; flex: none">
        @for (page of pages; track page) {
          <a style="width: 100px; flex: none" [href]="'#' + page">{{ page }}</a>
        }
      </nav>
    </tab-arrow-scroll>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class WideStripComponent {
  readonly pages = ['Home', 'Checkbox', 'Radio groups', 'Select', 'Table', 'Tree'];
}

describe('ArrowScrollComponent', () => {
  async function render() {
    const fixture = TestBed.createComponent(WideStripComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  // The server has no ResizeObserver: the strip created one after its view, so the demo app's nav bar threw there
  it('renders on the server without measuring', async () => {
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
    const globals = globalThis as { ngServerMode?: boolean };
    // Angular's own flag for server rendering, which afterNextRender reads
    globals.ngServerMode = true;
    try {
      const host = await render();

      expect(created).toEqual([]);
      expect(host.textContent).toContain('Radio groups');
    } finally {
      delete globals.ngServerMode;
      vi.unstubAllGlobals();
    }
  });

  // An icon is hidden from screen readers unless labelled, so the scroll buttons label theirs
  it('shows named scroll buttons when its content overflows, and passes axe', async () => {
    const host = await render();

    await vi.waitFor(() => {
      expect(host.querySelectorAll('button').length).toBe(2);
    });
    const names = Array.from(host.querySelectorAll('button tab-icon'), icon => icon.getAttribute('aria-label'));
    expect(names).toEqual(['Scroll back', 'Scroll forward']);
    expect(await axeViolations(host)).toEqual([]);
  });
});
