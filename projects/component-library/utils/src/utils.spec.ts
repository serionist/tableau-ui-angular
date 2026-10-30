import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TableauUiUtilsModule } from './tableau-ui-utils.module';
import { generateRandomString } from './utils';

@Component({
  imports: [TableauUiUtilsModule],
  template: `
    @if ($shown()) {
      <div resizeWatcher [style.width.px]="$width()" style="height: 20px" (resized)="sizes.push($event.entries[0].contentRect.width); elements.push($event.currentElement.nativeElement)"></div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class WatchedComponent {
  readonly $shown = signal(true);
  readonly $width = signal(100);
  readonly sizes: number[] = [];
  readonly elements: HTMLElement[] = [];
}

describe('ResizeWatcherDirective', () => {
  async function render() {
    const fixture = TestBed.createComponent(WatchedComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    return { fixture, host, component: fixture.componentInstance };
  }

  it('emits resized with its element and the observer entries, once at first and on each change of size', async () => {
    const { fixture, host, component } = await render();
    await vi.waitFor(() => {
      expect(component.sizes).toEqual([100]);
    });

    component.$width.set(140);
    await fixture.whenStable();

    await vi.waitFor(() => {
      expect(component.sizes).toEqual([100, 140]);
    });
    expect(component.elements).toEqual([host.querySelector('div'), host.querySelector('div')]);
  });

  it('stops observing when its element goes', async () => {
    const disconnect = vi.spyOn(ResizeObserver.prototype, 'disconnect');
    try {
      const { fixture, component } = await render();

      component.$shown.set(false);
      await fixture.whenStable();

      expect(disconnect).toHaveBeenCalledOnce();
    } finally {
      disconnect.mockRestore();
    }
  });

  // The server has no ResizeObserver: the directive created one in its constructor, so a page with it could not render
  // there
  it('renders on the server without creating an observer', async () => {
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
      const { fixture, host } = await render();

      expect(created).toEqual([]);
      expect(host.querySelector('div[resizeWatcher]')).not.toBeNull();
      fixture.destroy();
    } finally {
      delete globals.ngServerMode;
      vi.unstubAllGlobals();
    }
  });
});

describe('generateRandomString', () => {
  it('makes a string of letters and digits, 16 long unless asked otherwise, different each time', () => {
    const ids = [generateRandomString(), generateRandomString()];

    expect(ids[0]).toMatch(/^[A-Za-z0-9]{16}$/);
    expect(ids[1]).not.toBe(ids[0]);
    expect(generateRandomString(4)).toMatch(/^[A-Za-z0-9]{4}$/);
  });
});
