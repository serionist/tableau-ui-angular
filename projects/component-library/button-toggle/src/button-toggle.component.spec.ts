import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { userEvent } from 'vitest/browser';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { axeViolations } from '../../testing/axe';
import { movePointerAway } from '../../testing/pointer';
import { TableauUiButtonToggleModule } from './tableau-ui-button-toggle.module';

@Component({
  imports: [TableauUiButtonToggleModule, TableauUiCommonModule],
  template: `
    <tab-button-toggle [disabled]="$disabled()" [(selectedValue)]="$value">
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
    <tab-button-toggle selectedValue="left">
      <tab-option value="left" text="Left" [hint]="leftHint" />
      <tab-option value="right" text="Right" hint="Align right" />
    </tab-button-toggle>
    <ng-template #leftHint>Align <b>left</b></ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HintedComponent {}

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
    const option = (text: string) => Array.from(host.querySelectorAll<HTMLElement>('.option')).find(element => element.textContent.trim() === text)!;
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

  // The arrows changed the value of a disabled toggle, which a click focuses
  it('keeps the bound value on the arrows while disabled', async () => {
    const { host, component, fixture } = await render(AlignmentComponent, alignment => {
      alignment.$disabled.set(true);
    });
    host.querySelector<HTMLElement>('tab-button-toggle')!.focus();

    await userEvent.keyboard('{ArrowRight}');
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
});
