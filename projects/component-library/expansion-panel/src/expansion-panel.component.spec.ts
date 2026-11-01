import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { page } from 'vitest/browser';
import { axeViolations } from '../../testing/axe';
import { TableauUiExpansionPanelModule } from './tableau-ui-expansion-panel.module';

@Component({
  imports: [TableauUiExpansionPanelModule],
  template: `
    <tab-expansion-panel class="order" [label]="$label()">
      <tab-expansion-panel-title>
        <span>Order 1024</span>
        <button (click)="$event.stopPropagation()">Track</button>
        <p>Shipped on Monday</p>
      </tab-expansion-panel-title>
      <p>Three items, in one parcel.</p>
    </tab-expansion-panel>
    <tab-expansion-panel class="shipping">
      <tab-expansion-panel-title>Shipping</tab-expansion-panel-title>
      <p>Two to four working days.</p>
    </tab-expansion-panel>
    <tab-expansion-panel class="untitled">
      <p>No title.</p>
    </tab-expansion-panel>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PanelsComponent {
  readonly $label = signal<string | undefined>('Order 1024');
}

describe('ExpansionPanelComponent', () => {
  async function render() {
    const fixture = TestBed.createComponent(PanelsComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    // the toggle of the panel with this class
    const toggle = (panel: string) => host.querySelector(`tab-expansion-panel.${panel} .header > button`);
    // the buttons a screen reader finds by this name
    const named = (name: string) => page.getByRole('button', { name, exact: true }).elements();
    return { fixture, host, component: fixture.componentInstance, toggle, named };
  }

  // #79: the toggle took the whole title as its name, so a control in the title was part of it
  it('names the toggle by its label, so a button in the title is found by its own name alone', async () => {
    const { toggle, named } = await render();

    expect(named('Order 1024')).toEqual([toggle('order')]);
    expect(named('Track')).toHaveLength(1);
    expect(named('Track')[0]).not.toBe(toggle('order'));
    expect(toggle('order')!.getAttribute('aria-expanded')).toBe('false');
  });

  it('names the toggle by the title without a label, and Details without either', async () => {
    const { fixture, component, toggle, named } = await render();

    expect(named('Shipping')).toEqual([toggle('shipping')]);
    expect(named('Details')).toEqual([toggle('untitled')]);

    // a label with no words leaves the title's name, as no label does
    component.$label.set(' ');
    await fixture.whenStable();
    expect(named('Order 1024 Track Shipped on Monday')).toEqual([toggle('order')]);

    component.$label.set(undefined);
    await fixture.whenStable();
    expect(named('Order 1024 Track Shipped on Monday')).toEqual([toggle('order')]);
    expect(named('Order 1024')).toEqual([]);
  });

  it('keeps the name as the panel opens, and passes axe open and closed', async () => {
    const { fixture, host, toggle, named } = await render();
    expect(await axeViolations(host)).toEqual([]);

    (toggle('order') as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(toggle('order')!.getAttribute('aria-expanded')).toBe('true');
    expect(named('Order 1024')).toEqual([toggle('order')]);
    expect(host.querySelector('tab-expansion-panel.order')!.textContent).toContain('Three items, in one parcel.');
    expect(await axeViolations(host)).toEqual([]);
  });
});
