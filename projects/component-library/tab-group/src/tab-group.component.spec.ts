import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axeViolations } from '../../testing/axe';
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
      const { shown, component } = await render();

      expect(shown()).toEqual(['General content']);
      expect(component.selected).toEqual(['General']);
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
});
