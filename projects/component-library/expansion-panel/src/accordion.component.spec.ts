import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axeViolations } from '../../testing/axe';
import { TableauUiExpansionPanelModule } from './tableau-ui-expansion-panel.module';

@Component({
  imports: [TableauUiExpansionPanelModule],
  template: `
    <tab-accordion>
      @for (name of $panels(); track name) {
        <tab-expansion-panel>
          <tab-expansion-panel-title>{{ name }}</tab-expansion-panel-title>
          <p>{{ name }} details</p>
        </tab-expansion-panel>
      }
    </tab-accordion>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class AccordionHostComponent {
  readonly $panels = signal(['Shipping', 'Billing', 'Returns']);
}

describe('AccordionComponent', () => {
  async function render() {
    const fixture = TestBed.createComponent(AccordionHostComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const panel = (name: string) =>
      Array.from(host.querySelectorAll<HTMLElement>('tab-expansion-panel')).find(element => element.querySelector('tab-expansion-panel-title')?.textContent.trim() === name)!;
    const toggle = async (name: string) => {
      panel(name).querySelector('button')!.click();
      await fixture.whenStable();
    };
    const expanded = () => Array.from(host.querySelectorAll('tab-expansion-panel[expanded]'), element => element.querySelector('tab-expansion-panel-title')?.textContent.trim());
    return { fixture, host, panel, toggle, expanded };
  }

  // F67: unregister kept only the panel that left, so the accordion stopped closing the others once any panel went
  it('keeps one panel open after a panel leaves', async () => {
    const { fixture, toggle, expanded } = await render();
    await toggle('Shipping');
    expect(expanded()).toEqual(['Shipping']);

    fixture.componentInstance.$panels.set(['Billing', 'Returns']);
    await fixture.whenStable();
    await toggle('Billing');
    await toggle('Returns');

    expect(expanded()).toEqual(['Returns']);
  });

  // F82: the toggle said nothing of its state, and the accordion was a tablist with no tabs
  it('says whether each panel is open on its toggle, and passes axe', async () => {
    const { host, panel, toggle } = await render();
    const button = panel('Billing').querySelector('button')!;
    // named by its panel's title, the same open or closed, so a list of panels isn't three buttons called Expand
    // the button's content is its icon, an image named by the title
    const name = () => document.getElementById(button.querySelector('tab-icon')?.getAttribute('aria-labelledby') ?? '')?.textContent.trim();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(name()).toBe('Billing');

    await toggle('Billing');

    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(name()).toBe('Billing');
    expect(panel('Billing').textContent).toContain('Billing details');
    expect(host.querySelector('tab-accordion')!.hasAttribute('role')).toBe(false);
    expect(await axeViolations(host)).toEqual([]);
  });
});
