import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { userEvent } from 'vitest/browser';
import { axeViolations } from '../../testing/axe';
import { movePointerAway } from '../../testing/pointer';
import { TableauUiChipModule } from './tableau-ui-chip-module';

@Component({
  imports: [TableauUiChipModule],
  template: `
    <tab-chip [selected]="$selected()" [disabled]="$disabled()">Plain</tab-chip>
    <tab-chip [allowRemove]="$removable()" [removeTooltip]="{ template: 'Remove Berlin', context: undefined }" (removed)="removed.push('Berlin')">Berlin</tab-chip>
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

    component.$removable.set(false);
    await fixture.whenStable();
    expect(berlin.querySelector('button')).toBeNull();
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
