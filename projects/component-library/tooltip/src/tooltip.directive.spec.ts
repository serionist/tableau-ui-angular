import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { page, userEvent } from 'vitest/browser';
import type { TooltipArgs } from './tooltip.directive';
import { axeViolations } from '../../testing/axe';
import { movePointerAway } from '../../testing/pointer';
import { TableauUiTooltipModule } from './tableau-ui-tooltip.module';

@Component({
  imports: [TableauUiTooltipModule],
  template: `
    <div class="wrapper" tooltip="Wrapped">
      <button type="button">One</button>
      <button type="button">Two</button>
    </div>
    <button class="first" type="button">First</button>
    <div style="padding: 120px 160px">
      @if ($shown()) {
        <button class="text" type="button" [tooltip]="$text()" [tooltipPosition]="$position()">Save</button>
      }
      <button class="template" type="button" [tooltip]="greeting" [tooltipContext]="{ $implicit: 'Ada' }">Greet</button>
      <button class="empty" type="button" [tooltip]="null">Plain</button>
      <button class="full" type="button" tooltip tooltipArgsMode="full" [tooltipFullArgs]="{ template: 'Whole', context: undefined, position: 'bottom' }">Full</button>
      <button class="lazy" type="button" tooltip tooltipArgsMode="lazy" [tooltipLazyArgs]="lazy">Lazy</button>
      <button class="padded" type="button" tooltip="Padded" tooltipPadding="2rem">Padded</button>
      <button class="described" type="button" aria-describedby="note" tooltip="Saves the draft">Draft</button>
      <span id="note">Unsaved</span>
      <!-- named as the nav bar's collapsed buttons are: a hidden icon, and the text its tooltip repeats -->
      <button class="named" type="button" tooltip="Home"><span aria-hidden="true">home</span> Home</button>
      <button class="labelled" type="button" aria-label="Close" tooltip="Close">x</button>
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

  // the tooltips open now; each is in the page as soon as the pointer comes in, its text at the next render
  const tooltips = () => Array.from(document.querySelectorAll('tab-tooltip'), tooltip => tooltip.textContent.trim());
  const shows = async (texts: string[]) => {
    await vi.waitFor(() => {
      expect(tooltips()).toEqual(texts);
    });
  };
  // the open tooltip's box, once it is placed: it opens off screen to be measured
  const placed = async () => {
    const container = document.querySelector<HTMLElement>('.dialog-container')!;
    await vi.waitFor(() => {
      expect(container.style.top).not.toBe('-9999px');
    });
    return container.getBoundingClientRect();
  };
  // the pointer leaves, and the tooltip goes 100 ms later
  const leave = async () => {
    await movePointerAway();
    await shows([]);
  };
  const tooltipElement = () => document.querySelector<HTMLElement>('[role="tooltip"]');
  // focus from the keyboard: a click on the button before the tooltips, which has none, then Tab
  const tabToText = async (button: (name: string) => HTMLElement) => {
    await userEvent.click(button('first'));
    await userEvent.tab();
    expect(document.activeElement).toBe(button('text'));
  };

  it('shows its text while the pointer is on its element, and hides it after the pointer leaves', async () => {
    const { button } = await render();

    await userEvent.hover(button('text'));
    await shows(['Save changes']);

    await leave();
  });

  // #60: a tooltip opened on mouseenter only, so a keyboard user never saw one
  it('shows on focus from the keyboard and hides when the focus leaves, but not for the focus a click gives', async () => {
    const { button } = await render();

    await tabToText(button);
    await shows(['Save changes']);
    // the focus moves on: the tooltip hides at once, and the next one shows in its place
    await userEvent.tab();
    expect(document.querySelectorAll('tab-tooltip').length).toBe(1);
    await shows(['Hello Ada']);

    // a click elsewhere takes the focus, and the tooltip goes with it
    await userEvent.click(button('first'));
    expect(tooltips()).toEqual([]);
    // a click focuses the button with the pointer on it, which shows the tooltip; the focus alone doesn't keep it
    await userEvent.click(button('text'));
    await shows(['Save changes']);
    expect(document.activeElement).toBe(button('text'));
    await leave();
  });

  it('shows for focus from the keyboard on an element inside its own, and stays while the focus moves inside it', async () => {
    const { host, button } = await render();
    const [one, two] = Array.from(host.querySelectorAll<HTMLElement>('.wrapper button'));

    await userEvent.click(button('first'));
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(two);
    await shows(['Wrapped']);
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(one);
    expect(tooltips()).toEqual(['Wrapped']);

    await userEvent.tab();
    await userEvent.tab();
    expect(document.activeElement).toBe(button('first'));
    expect(tooltips()).toEqual([]);
  });

  // WCAG 1.4.13: the pointer can move onto a tooltip, to read it or to get past it
  it('stays while the pointer moves from its element onto it, and hides after the pointer leaves it', async () => {
    const { button } = await render();
    await userEvent.hover(button('text'));
    await placed();

    await userEvent.hover(tooltipElement()!);
    // longer than the 100 ms the pointer has to cross from the element
    await new Promise(resolve => setTimeout(resolve, 300));
    expect(tooltips()).toEqual(['Save changes']);

    await leave();
  });

  it('stays when the focus leaves while the pointer is on its element or on it', async () => {
    const { button } = await render();
    await tabToText(button);
    await shows(['Save changes']);

    await userEvent.hover(button('text'));
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(button('first'));
    expect(tooltips()).toEqual(['Save changes']);

    await userEvent.tab();
    await userEvent.hover(tooltipElement()!);
    await userEvent.tab({ shift: true });
    await new Promise(resolve => setTimeout(resolve, 300));
    expect(tooltips()).toEqual(['Save changes']);

    await leave();
  });

  // WCAG 1.4.13: the user can dismiss a tooltip without moving the pointer or the focus, and Escape on it no longer
  // reaches the page: a dialog under it closes on the next Escape
  it('hides every tooltip that shows on Escape, which goes no further, and lets the next Escape through', async () => {
    const { button } = await render();
    await tabToText(button);
    await userEvent.hover(button('template'));
    await shows(['Save changes', 'Hello Ada']);
    // an app's own handler
    const app = vi.fn((e: KeyboardEvent) => e.defaultPrevented);
    document.addEventListener('keydown', app);
    try {
      await userEvent.keyboard('{Escape}');
      expect(tooltips()).toEqual([]);
      expect(app).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(button('text'));

      await userEvent.keyboard('{Escape}');
      expect(app).toHaveBeenCalledTimes(1);
      expect(app).toHaveReturnedWith(false);
    } finally {
      document.removeEventListener('keydown', app);
    }
  });

  // #60: a screen reader wasn't told of a tooltip
  it("is a tooltip that describes its element while it shows, after the app's own description", async () => {
    const { button } = await render();
    const described = button('described');

    await userEvent.hover(described);
    await shows(['Saves the draft']);
    const id = tooltipElement()!.id;
    expect(id).not.toBe('');
    expect(described.getAttribute('aria-describedby')).toBe(`note ${id}`);
    await expect.element(page.elementLocator(described)).toHaveAccessibleDescription('Unsaved Saves the draft');

    await leave();
    expect(described.getAttribute('aria-describedby')).toBe('note');

    // from the keyboard too, on an element with no description of its own
    await tabToText(button);
    await shows(['Save changes']);
    expect(button('text').getAttribute('aria-describedby')).toBe(tooltipElement()!.id);
    await userEvent.tab({ shift: true });
    expect(button('text').hasAttribute('aria-describedby')).toBe(false);
  });

  it("adds no description for a text that repeats its element's name, from its text or its aria-label", async () => {
    const { button } = await render();

    for (const [name, text] of [
      ['named', 'Home'],
      ['labelled', 'Close'],
    ]) {
      await userEvent.hover(button(name));
      await shows([text]);
      expect(tooltipElement(), name).not.toBeNull();
      expect(button(name).hasAttribute('aria-describedby'), name).toBe(false);
      await leave();
    }
  });

  it('shows a template with its context', async () => {
    const { button } = await render();

    await userEvent.hover(button('template'));

    await shows(['Hello Ada']);
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
      await leave();
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
    await shows(['Whole']);
    expect((await placed()).top).toBeGreaterThanOrEqual(button('full').getBoundingClientRect().bottom);
    await leave();

    await userEvent.hover(button('lazy'));
    await shows(['Lazy 1']);
    await leave();
    component.lazyText = undefined;
    await userEvent.hover(button('lazy'));
    expect(tooltips()).toEqual([]);
    expect(component.lazyCalls).toBe(2);
  });

  // tooltipPadding never reached the tooltip in the default, individual mode, so each kept the 0.5rem padding
  it('pads its box by tooltipPadding, 0.5rem by default', async () => {
    const { button } = await render();
    const padding = async (name: string) => {
      await userEvent.hover(button(name));
      await shows([name === 'text' ? 'Save changes' : 'Padded']);
      const container = document.querySelector<HTMLElement>('.dialog-container')!;
      const shown = { inline: container.style.padding, top: getComputedStyle(container).paddingTop, left: getComputedStyle(container).paddingLeft };
      await leave();
      return shown;
    };
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);

    expect(await padding('padded')).toEqual({ inline: '2rem', top: `${2 * rem}px`, left: `${2 * rem}px` });
    expect(await padding('text')).toEqual({ inline: '0.5rem', top: `${0.5 * rem}px`, left: `${0.5 * rem}px` });
  });

  // A new position, margin or padding reached the tooltip only when the pointer came in again
  it('moves to a new position while it is open', async () => {
    const { fixture, component, button } = await render();
    const save = button('text').getBoundingClientRect();
    await userEvent.hover(button('text'));
    expect((await placed()).bottom).toBeLessThanOrEqual(save.top);

    component.$position.set('bottom');
    await fixture.whenStable();

    await shows(['Save changes']);
    expect((await placed()).top).toBeGreaterThanOrEqual(save.bottom);
  });

  it('shows a new text while it is open, and closes with its element', async () => {
    const { fixture, component, button } = await render();
    await userEvent.hover(button('text'));

    component.$text.set('Saved');
    await fixture.whenStable();
    await shows(['Saved']);

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
