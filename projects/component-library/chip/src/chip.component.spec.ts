import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { page, userEvent } from 'vitest/browser';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
import { axeViolations } from '../../testing/axe';
import { movePointerAway } from '../../testing/pointer';
import { TableauUiChipModule } from './tableau-ui-chip-module';

@Component({
  imports: [TableauUiChipModule, TableauUiIconModule],
  template: `
    <tab-chip [selected]="$selected()" [disabled]="$disabled()">Plain</tab-chip>
    <tab-chip [allowRemove]="$removable()" [removeTooltip]="{ template: 'Remove Berlin', context: undefined }" (removed)="removed.push('Berlin')">Berlin</tab-chip>
    <tab-chip [allowRemove]="true"><tab-icon value="location_on" /><span>Paris</span></tab-chip>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ChipsComponent {
  readonly $selected = signal(false);
  readonly $disabled = signal(false);
  readonly $removable = signal(true);
  readonly removed: string[] = [];
}

describe('ChipComponent', () => {
  beforeEach(async () => {
    await movePointerAway();
  });

  async function render() {
    const fixture = TestBed.createComponent(ChipsComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const [plain, berlin] = Array.from(host.querySelectorAll<HTMLElement>('tab-chip'));
    return { fixture, host, component: fixture.componentInstance, plain, berlin };
  }

  it('shows its content, with a remove button only when it allows removing', async () => {
    const { fixture, component, plain, berlin } = await render();

    expect(plain.textContent.trim()).toBe('Plain');
    expect(plain.querySelector('button')).toBeNull();
    expect(berlin.textContent).toContain('Berlin');
    expect(berlin.querySelector('button tab-icon')!.getAttribute('aria-label')).toBe('Remove');
    // its content sits in the chip's own flex layout, as before the span that names the button
    expect(getComputedStyle(berlin.querySelector('.content')!).display).toBe('contents');
    expect(getComputedStyle(berlin).display).toBe('flex');

    component.$removable.set(false);
    await fixture.whenStable();
    expect(berlin.querySelector('button')).toBeNull();
  });

  // #75: every remove button was named Remove, whichever chip it removed
  it("names each remove button Remove and its chip's content, without a decorative icon's ligature", async () => {
    const { berlin } = await render();

    expect(page.getByRole('button', { name: 'Remove Berlin', exact: true }).element()).toBe(berlin.querySelector('button'));
    expect(page.getByRole('button', { name: 'Remove Paris', exact: true }).elements()).toHaveLength(1);
    expect(page.getByRole('button', { name: 'Remove', exact: true }).elements()).toEqual([]);
  });

  it('emits removed from a click on its remove button, and from the keyboard', async () => {
    const { fixture, component, berlin } = await render();
    const remove = berlin.querySelector('button')!;

    remove.focus();
    await userEvent.keyboard('{Enter}');
    remove.click();
    await fixture.whenStable();

    expect(component.removed).toEqual(['Berlin', 'Berlin']);
  });

  it("shows the remove button's tooltip on hover", async () => {
    const { berlin } = await render();

    await userEvent.hover(berlin.querySelector('button')!);

    await vi.waitFor(() => {
      expect(document.body.textContent).toContain('Remove Berlin');
    });
    await movePointerAway();
    await vi.waitFor(() => {
      expect(document.body.textContent).not.toContain('Remove Berlin');
    });
  });

  it('shows itself selected or disabled', async () => {
    const { fixture, component, plain } = await render();
    expect(plain.classList).not.toContain('selected');
    expect(plain.classList).not.toContain('disabled');

    component.$selected.set(true);
    component.$disabled.set(true);
    await fixture.whenStable();

    expect(plain.classList).toContain('selected');
    expect(plain.classList).toContain('disabled');
  });

  it('passes axe', async () => {
    const { host } = await render();

    expect(await axeViolations(host)).toEqual([]);
  });
});
