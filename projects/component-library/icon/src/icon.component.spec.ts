import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axeViolations } from '../../testing/axe';
import { TableauUiIconModule } from './tableau-ui-icon.module';

@Component({
  imports: [TableauUiIconModule],
  template: `
    <p>Saved <tab-icon value="check" /></p>
    <button type="button"><tab-icon value="delete" label="Delete" /></button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class IconHostComponent {}

describe('IconComponent', () => {
  async function render() {
    const fixture = TestBed.createComponent(IconHostComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const [decorative, labelled] = Array.from(host.querySelectorAll('tab-icon'));
    return { host, decorative, labelled };
  }

  // F133: every icon was an unnamed role="img", so a screen reader read its ligature text ("check")
  it('hides an icon without a label from assistive technology', async () => {
    const { decorative } = await render();

    expect(decorative.getAttribute('aria-hidden')).toBe('true');
    expect(decorative.hasAttribute('role')).toBe(false);
    expect(decorative.hasAttribute('aria-label')).toBe(false);
  });

  it('names an icon with a label as an image', async () => {
    const { labelled } = await render();

    expect(labelled.getAttribute('role')).toBe('img');
    expect(labelled.getAttribute('aria-label')).toBe('Delete');
    expect(labelled.hasAttribute('aria-hidden')).toBe(false);
  });

  it('passes axe, and names an icon-only button by its icon', async () => {
    const { host } = await render();

    expect(await axeViolations(host)).toEqual([]);
  });
});
