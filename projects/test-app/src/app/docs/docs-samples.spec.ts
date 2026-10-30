import { TestBed } from '@angular/core/testing';
import { SnackService } from 'tableau-ui-angular/snack';
import type { Type } from '@angular/core';
import { CheckboxFormsExampleComponent } from '../pages/checkbox-page/examples/checkbox-forms.example';
import { TableBasicExampleComponent } from '../pages/table-page/examples/table-basic.example';
import { TableOptionsExampleComponent } from '../pages/table-page/examples/table-options.example';

// What a sample does that its page's prose promises
describe('The samples', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('the checkbox forms sample', () => {
    async function render() {
      const snack = vi.spyOn(TestBed.inject(SnackService), 'openSnack');
      const fixture = TestBed.createComponent(CheckboxFormsExampleComponent);
      await fixture.whenStable();
      const host = fixture.nativeElement as HTMLElement;
      const required = host.querySelector<HTMLElement>('tab-checkbox[formcontrolname="required"]')!;
      return { fixture, snack, required };
    }

    it('shows the required checkbox its error while it is unchecked, untouched', async () => {
      const { required } = await render();

      expect(required.querySelector('tab-error')?.textContent).toContain('Check it to go on');
    });

    it('snacks info when the user checks the required checkbox, and error when they clear it', async () => {
      const { fixture, snack, required } = await render();
      const box = required.querySelector<HTMLInputElement>('input[type="checkbox"]')!;

      box.click();
      await fixture.whenStable();
      expect(snack).toHaveBeenLastCalledWith('Validated checkbox set to: true', 3000, 'info');
      expect(required.querySelector('tab-error')).toBeNull();

      box.click();
      await fixture.whenStable();
      expect(snack).toHaveBeenLastCalledWith('Validated checkbox set to: false', 3000, 'error');
    });
  });

  // The table is at least 300px tall, so a smaller max-height did nothing
  it.each([
    ['first table', TableBasicExampleComponent],
    ['options', TableOptionsExampleComponent],
  ] as [string, Type<unknown>][])("gives the %s sample's table the height its styles set", async (_, sample) => {
    const fixture = TestBed.createComponent(sample);
    await fixture.whenStable();

    const table = (fixture.nativeElement as HTMLElement).querySelector('tab-table')!;
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    expect(table.getBoundingClientRect().height).toBeCloseTo(30 * rem, 0);
    fixture.destroy();
  });
});
