import { ChangeDetectionStrategy, Component, signal, ViewEncapsulation } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { page, userEvent } from 'vitest/browser';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { axeViolations } from '../../testing/axe';
import { inEachMode } from '../../testing/contrast';
import { focusRingShown } from '../../testing/focus-ring';
import { movePointerAway } from '../../testing/pointer';
import { TableauUiButtonToggleModule } from './tableau-ui-button-toggle.module';

@Component({
  imports: [TableauUiButtonToggleModule, TableauUiCommonModule],
  template: `
    <tab-button-toggle aria-label="Alignment" [disabled]="$disabled()" [(selectedValue)]="$value">
      @for (option of $options(); track option) {
        <tab-option [value]="option" [text]="option" [disabled]="option === 'locked'" />
      }
    </tab-button-toggle>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class AlignmentComponent {
  readonly $disabled = signal(false);
  readonly $options = signal(['left', 'right', 'locked']);
  readonly $value = signal<string | undefined>('right');
}

@Component({
  imports: [TableauUiButtonToggleModule, TableauUiCommonModule],
  template: `
    <tab-button-toggle aria-label="Alignment" selectedValue="left">
      <tab-option value="left" text="Left" [hint]="leftHint" />
      <tab-option value="right" text="Right" hint="Align right" />
    </tab-button-toggle>
    <ng-template #leftHint>Align <b>left</b></ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HintedComponent {}

// Three options with only an icon, one of them disabled, and one with text, between two buttons
@Component({
  imports: [TableauUiButtonToggleModule, TableauUiCommonModule],
  template: `
    <button type="button">Before</button>
    <tab-button-toggle aria-label="Alignment" [disabled]="$disabled()" [(selectedValue)]="$value" (selectedValueChange)="changes.push($event)">
      <tab-option value="left" icon="format_align_left" hint="Left" />
      <tab-option value="center" icon="format_align_center" hint="Center" />
      <tab-option value="right" icon="format_align_right" hint="Right" [disabled]="true" />
      <tab-option value="justify" icon="format_align_justify" text="Justify" hint="Spreads each line" />
    </tab-button-toggle>
    <button type="button">After</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ToolbarComponent {
  readonly $disabled = signal(false);
  readonly $value = signal<string | undefined>('center');
  readonly changes: (string | undefined)[] = [];
}

// The library's styles, as an app imports them, while a fixture of it lives: the theme's colours in both modes
@Component({
  template: '',
  styleUrl: '../../styles/lib-styles.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class LibraryStylesComponent {}

describe('ButtonToggleComponent', () => {
  beforeEach(movePointerAway);

  afterEach(() => {
    document.querySelectorAll('.dialog-container').forEach(element => element.remove());
  });

  async function render<T>(component: new () => T, setUp?: (component: T) => void) {
    const fixture = TestBed.createComponent(component);
    setUp?.(fixture.componentInstance);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const option = (text: string) => Array.from(host.querySelectorAll<HTMLElement>('.option')).find(element => (element.getAttribute('aria-label') ?? element.textContent.trim()) === text)!;
    const selected = () => Array.from(host.querySelectorAll('.option.selected'), element => element.textContent.trim());
    return { fixture, host, option, selected, component: fixture.componentInstance };
  }

  // F68: disabled, the effect wrote undefined into the bound value, wiping the parent's
  it('keeps the bound value while disabled', async () => {
    const { option, selected, component, fixture } = await render(AlignmentComponent, host => {
      host.$disabled.set(true);
    });

    expect(component.$value()).toBe('right');
    expect(selected()).toEqual(['right']);

    option('left').click();
    await fixture.whenStable();
    expect(component.$value()).toBe('right');
  });

  // The arrows changed the value of a disabled toggle, whose options a click focuses
  it('keeps the bound value on the arrows and Space while disabled', async () => {
    const { option, component, fixture } = await render(AlignmentComponent, alignment => {
      alignment.$disabled.set(true);
    });
    option('left').focus();
    expect(document.activeElement).toBe(option('left'));

    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard(' ');
    await fixture.whenStable();

    expect(component.$value()).toBe('right');
  });

  // F68: before its options were there, the toggle found no option for the value and wiped it
  it('keeps a value whose options come later, and a value on a disabled option', async () => {
    const { selected, component, fixture } = await render(AlignmentComponent, host => {
      host.$options.set([]);
      host.$value.set('locked');
    });
    expect(component.$value()).toBe('locked');

    component.$options.set(['left', 'right', 'locked']);
    await fixture.whenStable();

    expect(component.$value()).toBe('locked');
    expect(selected()).toEqual(['locked']);
  });

  it("sets the bound value on the user's pick, but not on a disabled option", async () => {
    const { option, selected, component, fixture } = await render(AlignmentComponent);

    option('left').click();
    await fixture.whenStable();
    expect(component.$value()).toBe('left');
    expect(selected()).toEqual(['left']);

    option('locked').click();
    await fixture.whenStable();
    expect(component.$value()).toBe('left');
  });

  // F88: a template hint showed "[object Object]"
  it('shows a template hint as its content, and passes axe', async () => {
    const { host, option } = await render(HintedComponent);

    await userEvent.hover(option('Left'));
    await vi.waitFor(() => {
      expect(document.querySelector('.dialog-container')?.textContent.trim()).toBe('Align left');
    });
    expect(document.querySelector('.dialog-container b')?.textContent).toBe('left');

    await userEvent.hover(option('Right'));
    await vi.waitFor(() => {
      expect(document.querySelector('.dialog-container')?.textContent.trim()).toBe('Align right');
    });
    await movePointerAway();
    expect(await axeViolations(host)).toEqual([]);
  });

  describe('as the radio group pattern', () => {
    const named = (name: string) => page.getByRole('radio', { name, exact: true }).element();
    const tooltip = () => document.querySelector<HTMLElement>('[role="tooltip"]');

    async function toolbar(setUp?: (component: ToolbarComponent) => void) {
      const rendered = await render(ToolbarComponent, setUp);
      const radios = () => Array.from(rendered.host.querySelectorAll<HTMLElement>('[role="radio"]'));
      const stops = () => radios().map(radio => radio.tabIndex);
      const button = (text: string) => Array.from(rendered.host.querySelectorAll('button')).find(element => element.textContent === text)!;
      return { ...rendered, radios, stops, button, toggle: rendered.host.querySelector<HTMLElement>('tab-button-toggle')! };
    }

    it('is a radio group named by its aria-label, of radios named by their text or, with only an icon, by their string hint', async () => {
      const { fixture, host, toggle, radios, component } = await toolbar();

      expect(page.getByRole('radiogroup', { name: 'Alignment', exact: true }).element()).toBe(toggle);
      expect(page.getByRole('radio').elements()).toEqual(radios());
      expect(['Left', 'Center', 'Right', 'Justify'].map(named)).toEqual(radios());
      // the option with text is named by its text, its hint describing it
      expect(radios().map(radio => radio.getAttribute('aria-label'))).toEqual(['Left', 'Center', 'Right', null]);
      expect(page.getByRole('radio', { checked: true }).element()).toBe(named('Center'));
      expect(radios().map(radio => radio.getAttribute('aria-checked'))).toEqual(['false', 'true', 'false', 'false']);
      expect(radios().map(radio => radio.getAttribute('aria-disabled'))).toEqual([null, null, 'true', null]);
      expect(toggle.hasAttribute('aria-disabled')).toBe(false);
      expect(await axeViolations(host)).toEqual([]);

      component.$disabled.set(true);
      await fixture.whenStable();
      expect(toggle.getAttribute('aria-disabled')).toBe('true');
      expect(radios().map(radio => radio.getAttribute('aria-disabled'))).toEqual(['true', 'true', 'true', 'true']);
      expect(await axeViolations(host)).toEqual([]);
    });

    // The toggle itself was the Tab stop
    it('is one Tab stop, the checked option, or the first enabled one while none is checked, and none while disabled', async () => {
      const { fixture, toggle, stops, button, component } = await toolbar();
      expect(toggle.hasAttribute('tabindex')).toBe(false);
      expect(stops()).toEqual([-1, 0, -1, -1]);

      button('Before').focus();
      await userEvent.tab();
      expect(document.activeElement).toBe(named('Center'));
      await userEvent.tab();
      expect(document.activeElement).toBe(button('After'));

      component.$value.set(undefined);
      await fixture.whenStable();
      expect(stops()).toEqual([0, -1, -1, -1]);

      component.$disabled.set(true);
      await fixture.whenStable();
      expect(stops()).toEqual([-1, -1, -1, -1]);
      button('Before').focus();
      await userEvent.tab();
      expect(document.activeElement).toBe(button('After'));
    });

    it('checks and focuses the next enabled option on Right and Down, the previous on Left and Up, wrapping', async () => {
      const { fixture, stops, button, component } = await toolbar();
      button('Before').focus();
      await userEvent.tab();
      const moves: (string | null | undefined)[][] = [];

      for (const key of ['{ArrowRight}', '{ArrowDown}', '{ArrowLeft}', '{ArrowUp}', '{ArrowUp}']) {
        await userEvent.keyboard(key);
        await fixture.whenStable();
        moves.push([['Left', 'Center', 'Right', 'Justify'].find(name => named(name) === document.activeElement), component.$value()]);
      }

      // Right is disabled, so the keys pass it
      expect(moves).toEqual([
        ['Justify', 'justify'],
        ['Left', 'left'],
        ['Justify', 'justify'],
        ['Center', 'center'],
        ['Left', 'left'],
      ]);
      expect(component.changes).toEqual(['justify', 'left', 'justify', 'center', 'left']);
      expect(stops()).toEqual([0, -1, -1, -1]);
      expect(named('Left').getAttribute('aria-checked')).toBe('true');
    });

    it('checks the option that has focus on Space, and leaves an arrow with Alt, Ctrl or Meta to the browser', async () => {
      const { fixture, button, component } = await toolbar(bar => {
        bar.$value.set(undefined);
      });
      button('Before').focus();
      await userEvent.tab();
      expect(document.activeElement).toBe(named('Left'));

      await userEvent.keyboard(' ');
      await fixture.whenStable();
      expect(component.$value()).toBe('left');
      expect(named('Left').getAttribute('aria-checked')).toBe('true');

      for (const modifier of ['altKey', 'ctrlKey', 'metaKey']) {
        const key = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true, [modifier]: true });
        named('Left').dispatchEvent(key);
        await fixture.whenStable();
        expect(key.defaultPrevented, modifier).toBe(false);
      }
      expect(component.changes).toEqual(['left']);
    });

    it("shows a focused option's hint, which describes an option with text and not one it names", async () => {
      const { fixture, button } = await toolbar();
      button('Before').focus();
      await userEvent.tab();

      await vi.waitFor(() => {
        expect(tooltip()?.textContent.trim()).toBe('Center');
      });
      expect(named('Center').hasAttribute('aria-describedby')).toBe(false);

      await userEvent.keyboard('{ArrowRight}');
      await fixture.whenStable();
      await vi.waitFor(() => {
        expect(tooltip()?.textContent.trim()).toBe('Spreads each line');
      });
      expect(named('Justify').getAttribute('aria-describedby')).toBe(tooltip()!.id);
    });

    // The option sits at fractions of a pixel, so the screenshot's first and last pixel along an edge can miss the ring
    // The plan's "the checked option": a screen reader then hears the value, as on a toggle that starts on a disabled one
    it('keeps the Tab stop on a checked option that is disabled, and the arrows move on to the enabled ones', async () => {
      const { fixture, stops, button, component } = await toolbar(bar => {
        bar.$value.set('right');
      });
      expect(stops()).toEqual([-1, -1, 0, -1]);

      button('Before').focus();
      await userEvent.tab();
      expect(document.activeElement).toBe(named('Right'));
      expect([named('Right').getAttribute('aria-checked'), named('Right').getAttribute('aria-disabled')]).toEqual(['true', 'true']);

      // Space on it changes nothing
      await userEvent.keyboard(' ');
      await fixture.whenStable();
      expect(component.$value()).toBe('right');

      await userEvent.keyboard('{ArrowRight}');
      await fixture.whenStable();
      expect(document.activeElement).toBe(named('Justify'));
      expect(component.$value()).toBe('justify');
      expect(stops()).toEqual([-1, -1, -1, 0]);
    });

    it('shows a focus ring on all four edges of the focused option, a checked one included', async () => {
      TestBed.createComponent(LibraryStylesComponent);
      const { button } = await toolbar();
      button('Before').focus();
      // none before it has focus
      expect(await focusRingShown(named('Center'))).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });

      await userEvent.tab();

      expect(named('Center').matches(':focus-visible')).toBe(true);
      await inEachMode(async mode => {
        const edges = await focusRingShown(named('Center'));
        expect(
          Object.values(edges).every(shown => shown > 0.9),
          `${mode}: ${JSON.stringify(edges)}`,
        ).toBe(true);
      });
    });
  });
});
