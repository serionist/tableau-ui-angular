import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { SnackService } from 'tableau-ui-angular/snack';
import type { Type } from '@angular/core';
import { CheckboxFormsExampleComponent } from '../pages/checkbox-page/examples/checkbox-forms.example';
import { ChipControlExampleComponent } from '../pages/chip-page/examples/chip-control.example';
import { DatePickerFormsExampleComponent } from '../pages/date-picker-page/examples/date-picker-forms.example';
import { DatePickerValueExampleComponent } from '../pages/date-picker-page/examples/date-picker-value.example';
import { ExpansionPanelSingleExampleComponent } from '../pages/expansion-page/examples/expansion-panel-single.example';
import { RadioFormsExampleComponent } from '../pages/radio-buttons-page/examples/radio-forms.example';
import { SnackMessageExampleComponent } from '../pages/snacks-page/examples/snack-message.example';
import { TableBasicExampleComponent } from '../pages/table-page/examples/table-basic.example';
import { TableOptionsExampleComponent } from '../pages/table-page/examples/table-options.example';

// Clicks the button with this text in the sample
async function click(fixture: ComponentFixture<unknown>, text: string) {
  const button = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button')).find(element => element.textContent.trim() === text)!;
  button.click();
  await fixture.whenStable();
}

// Clicks the checkbox with this text in the sample
async function check(fixture: ComponentFixture<unknown>, text: string) {
  const checkbox = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('tab-checkbox')).find(element => element.textContent.trim() === text)!;
  checkbox.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click();
  await fixture.whenStable();
}

// Types into a date input, as the user does, then leaves it
async function type(fixture: ComponentFixture<unknown>, input: HTMLInputElement, text: string) {
  input.value = text;
  input.dispatchEvent(new Event('input'));
  input.dispatchEvent(new Event('blur'));
  await fixture.whenStable();
}

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

  it("opens the message sample's snack with the type of its button, where and for as long as its checkboxes say", async () => {
    const snack = vi.spyOn(TestBed.inject(SnackService), 'openSnack');
    const fixture = TestBed.createComponent(SnackMessageExampleComponent);
    await fixture.whenStable();

    await click(fixture, 'An error snack');
    expect(snack).toHaveBeenLastCalledWith('A snack of type error', 5000, 'error', 'top');

    await check(fixture, 'At the bottom of the window');
    await click(fixture, 'An info snack');
    expect(snack).toHaveBeenLastCalledWith('A snack of type info', 5000, 'info', 'bottom');

    await check(fixture, 'Until the user closes it');
    await click(fixture, 'A success snack');
    expect(snack).toHaveBeenLastCalledWith('A snack of type success', 0, 'success', 'bottom');
    fixture.destroy();
  });

  it('opens the first single panel from its checkbox, and checks the box when the user opens the panel', async () => {
    const fixture = TestBed.createComponent(ExpansionPanelSingleExampleComponent);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const panel = host.querySelector('tab-expansion-panel')!;
    const box = host.querySelector<HTMLInputElement>('tab-checkbox input[type="checkbox"]')!;

    await check(fixture, 'The first panel is open');
    expect(panel.hasAttribute('expanded')).toBe(true);
    expect(panel.textContent).toContain('The content shows while the panel is open.');

    panel.querySelector<HTMLElement>('.header')!.click();
    await fixture.whenStable();
    expect(panel.hasAttribute('expanded')).toBe(false);
    expect(box.checked).toBe(false);

    panel.querySelector<HTMLElement>('.header')!.click();
    await fixture.whenStable();
    expect(box.checked).toBe(true);
    fixture.destroy();
  });

  it("keeps the chip control sample's keys in step with the values it adds and removes", async () => {
    const fixture = TestBed.createComponent(ChipControlExampleComponent);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    // each chip's text, without its remove button's icon
    const chips = () => Array.from(host.querySelectorAll('tab-chip'), chip => chip.textContent.replace(chip.querySelector('button')?.textContent ?? '', '').trim());

    await click(fixture, 'Add 2 chips by value');
    expect(chips()).toEqual(['Amsterdam', 'Berlin']);
    expect(host.querySelector('tab-hint')?.textContent).toContain('Keys: 1, 2');

    await click(fixture, 'Remove the first chip by key');
    expect(chips()).toEqual(['Berlin']);
    expect(host.querySelector('tab-hint')?.textContent).toContain('Keys: 2');
    fixture.destroy();
  });

  it("shows the date picker value sample's day in UTC as the user types it", async () => {
    const fixture = TestBed.createComponent(DatePickerValueExampleComponent);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;

    await type(fixture, host.querySelector('input[type="date"]')!, '2025-03-15');

    expect(host.querySelector('tab-hint')?.textContent).toContain(new Date(2025, 2, 15).toISOString());
    fixture.destroy();
  });

  it("snacks the radio forms sample's picks with their validity, an error below the minimum and info for the valid size", async () => {
    const snack = vi.spyOn(TestBed.inject(SnackService), 'openSnack');
    const fixture = TestBed.createComponent(RadioFormsExampleComponent);
    await fixture.whenStable();
    const radios = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLInputElement>('input[type="radio"]');

    radios[0].click();
    await fixture.whenStable();
    expect(snack).toHaveBeenLastCalledWith('Size set to: 1', 3000, 'error');

    radios[2].click();
    await fixture.whenStable();
    expect(snack).toHaveBeenLastCalledWith('Size set to: 3', 3000, 'info');
    fixture.destroy();
  });

  // Each radio input touches the control when it loses focus, so the error waits for the second pick, not for the
  // user to leave the group
  it("shows the radio forms sample's error at the second pick, while focus is still in the group", async () => {
    const fixture = TestBed.createComponent(RadioFormsExampleComponent);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const radios = host.querySelectorAll<HTMLInputElement>('input[type="radio"]');
    const errors = () => Array.from(host.querySelectorAll('tab-error'), element => element.textContent.trim());

    radios[0].focus();
    radios[0].click();
    await fixture.whenStable();
    expect(errors()).toEqual([]);

    radios[3].focus();
    radios[3].click();
    await fixture.whenStable();
    expect(host.contains(document.activeElement)).toBe(true);
    expect(errors()).toEqual(['The largest size is Large']);
    fixture.destroy();
  });

  // new Date(2030, 12, 31), as the page had it, is January 31, 2031, which let these days through
  it.each([
    ['2031-01-15', 'The latest day is 2030-12-31'],
    ['1999-12-31', 'The earliest day is 2000-01-01'],
  ])('shows the date picker forms sample its error for %s once the user leaves the day', async (day, error) => {
    const fixture = TestBed.createComponent(DatePickerFormsExampleComponent);
    await fixture.whenStable();
    const field = (fixture.nativeElement as HTMLElement).querySelector('tab-form-field')!;

    await type(fixture, field.querySelector('input')!, day);

    expect(Array.from(field.querySelectorAll('tab-error'), element => element.textContent.trim())).toEqual([error]);
    fixture.destroy();
  });
});
