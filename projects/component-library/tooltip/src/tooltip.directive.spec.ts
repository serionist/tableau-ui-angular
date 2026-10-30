import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { userEvent } from 'vitest/browser';
import type { TooltipArgs } from './tooltip.directive';
import { axeViolations } from '../../testing/axe';
import { movePointerAway } from '../../testing/pointer';
import { TableauUiTooltipModule } from './tableau-ui-tooltip.module';

@Component({
  imports: [TableauUiTooltipModule],
  template: `
    <div style="padding: 120px 160px">
      @if ($shown()) {
        <button class="text" type="button" [tooltip]="$text()" [tooltipPosition]="$position()">Save</button>
      }
      <button class="template" type="button" [tooltip]="greeting" [tooltipContext]="{ $implicit: 'Ada' }">Greet</button>
      <button class="empty" type="button" [tooltip]="null">Plain</button>
      <button class="full" type="button" tooltip tooltipArgsMode="full" [tooltipFullArgs]="{ template: 'Whole', context: undefined, position: 'bottom' }">Full</button>
      <button class="lazy" type="button" tooltip tooltipArgsMode="lazy" [tooltipLazyArgs]="lazy">Lazy</button>
    </div>
    <button class="edge" type="button" style="position: fixed; top: 0; right: 0" tooltip="At the edge">Edge</button>
    <ng-template #greeting let-name>Hello {{ name }}</ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ToolbarComponent {
  readonly $shown = signal(true);
  readonly $text = signal('Save changes');
  readonly $position = signal<'bottom' | 'left' | 'right' | 'top'>('top');
  lazyCalls = 0;
  lazyText: string | undefined = 'Lazy';
  readonly lazy = (): TooltipArgs<undefined> | undefined => {
    this.lazyCalls++;
    return this.lazyText === undefined ? undefined : { template: `${this.lazyText} ${this.lazyCalls}`, context: undefined };
  };
}

describe('TooltipDirective', () => {
  // what the library's stylesheet (styles/_dialog.service.scss) gives every dialog, which a test doesn't load
  const stylesheet = document.createElement('style');
  stylesheet.textContent = '.dialog-container { position: fixed; }';

  beforeEach(async () => {
    document.head.appendChild(stylesheet);
    await movePointerAway();
  });

  afterEach(() => {
    stylesheet.remove();
    document.querySelectorAll('.dialog-container').forEach(element => element.remove());
  });

  async function render() {
    const fixture = TestBed.createComponent(ToolbarComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const button = (name: string) => host.querySelector<HTMLElement>(`.${name}`)!;
    return { fixture, host, component: fixture.componentInstance, button };
  }

  const tooltips = () => Array.from(document.querySelectorAll('tab-tooltip'), tooltip => tooltip.textContent.trim());
  // the open tooltip's box, once it is placed: it opens off screen to be measured
  const placed = async () => {
    const container = document.querySelector<HTMLElement>('.dialog-container')!;
    await vi.waitFor(() => {
      expect(container.style.top).not.toBe('-9999px');
    });
    return container.getBoundingClientRect();
  };

  it('shows its text while the pointer is on its element, and hides it when the pointer leaves', async () => {
    const { button } = await render();

    await userEvent.hover(button('text'));
    expect(tooltips()).toEqual(['Save changes']);

    await movePointerAway();
    expect(tooltips()).toEqual([]);
  });

  it('shows a template with its context', async () => {
    const { button } = await render();

    await userEvent.hover(button('template'));

    expect(tooltips()).toEqual(['Hello Ada']);
  });

  it('shows nothing for a null tooltip, nor when the pointer comes in with a button held, as in a drag', async () => {
    const { button } = await render();

    await userEvent.hover(button('empty'));
    expect(tooltips()).toEqual([]);

    button('text').dispatchEvent(new MouseEvent('mouseenter', { buttons: 1 }));
    expect(tooltips()).toEqual([]);
  });

  it('sits above its element, or below, left or right of it as asked', async () => {
    const { fixture, component, button } = await render();
    const save = button('text').getBoundingClientRect();
    const middle = (box: DOMRect) => [box.left + box.width / 2, box.top + box.height / 2];
    const near = (a: number, b: number) => Math.abs(a - b) < 1;

    for (const position of ['top', 'bottom', 'left', 'right'] as const) {
      component.$position.set(position);
      await fixture.whenStable();
      await userEvent.hover(button('text'));
      const tip = await placed();

      if (position === 'top' || position === 'bottom') {
        expect(near(middle(tip)[0], middle(save)[0]), position).toBe(true);
        expect(position === 'top' ? tip.bottom <= save.top : tip.top >= save.bottom, position).toBe(true);
      } else {
        expect(near(middle(tip)[1], middle(save)[1]), position).toBe(true);
        expect(position === 'left' ? tip.right <= save.left : tip.left >= save.right, position).toBe(true);
      }
      await movePointerAway();
    }
  });

  it('goes below an element at the top of the viewport, and stays on screen at its right', async () => {
    const { button } = await render();
    const edge = button('edge').getBoundingClientRect();

    await userEvent.hover(button('edge'));
    const tip = await placed();

    expect(tip.top).toBeGreaterThanOrEqual(edge.bottom);
    expect(tip.right).toBeLessThanOrEqual(window.innerWidth);
  });

  it('takes its arguments whole, or from a function at each hover, which may return none', async () => {
    const { component, button } = await render();

    await userEvent.hover(button('full'));
    expect(tooltips()).toEqual(['Whole']);
    expect((await placed()).top).toBeGreaterThanOrEqual(button('full').getBoundingClientRect().bottom);
    await movePointerAway();

    await userEvent.hover(button('lazy'));
    expect(tooltips()).toEqual(['Lazy 1']);
    await movePointerAway();
    component.lazyText = undefined;
    await userEvent.hover(button('lazy'));
    expect(tooltips()).toEqual([]);
    expect(component.lazyCalls).toBe(2);
  });

  it('shows a new text while it is open, and closes with its element', async () => {
    const { fixture, component, button } = await render();
    await userEvent.hover(button('text'));

    component.$text.set('Saved');
    await fixture.whenStable();
    expect(tooltips()).toEqual(['Saved']);

    component.$shown.set(false);
    await fixture.whenStable();
    expect(tooltips()).toEqual([]);
  });

  it('passes axe while it shows', async () => {
    const { host, button } = await render();
    await userEvent.hover(button('template'));
    await placed();

    expect(await axeViolations(host)).toEqual([]);
    expect(await axeViolations(document.querySelector('.dialog-container')!)).toEqual([]);
  });
});
