import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { SnackService } from 'tableau-ui-angular/snack';
import { ClipboardService } from 'tableau-ui-angular/clipboard';
import { DialogService } from 'tableau-ui-angular/dialog';
import type { Type } from '@angular/core';
import { CheckboxFormsExampleComponent } from '../pages/checkbox-page/examples/checkbox-forms.example';
import { ChipControlExampleComponent } from '../pages/chip-page/examples/chip-control.example';
import { SalesDashboardExampleComponent } from '../pages/dashboard-page/examples/sales-dashboard.example';
import { DatePickerFormsExampleComponent } from '../pages/date-picker-page/examples/date-picker-forms.example';
import { DatePickerValueExampleComponent } from '../pages/date-picker-page/examples/date-picker-value.example';
import { ExpansionPanelSingleExampleComponent } from '../pages/expansion-page/examples/expansion-panel-single.example';
import { ListDisplayExampleComponent } from '../pages/list-page/examples/list-display.example';
import { ListFormsExampleComponent } from '../pages/list-page/examples/list-forms.example';
import { RadioFormsExampleComponent } from '../pages/radio-buttons-page/examples/radio-forms.example';
import { ScrollerVerticalExampleComponent } from '../pages/scroller-page/examples/scroller-vertical.example';
import { SnackMessageExampleComponent } from '../pages/snacks-page/examples/snack-message.example';
import { TabsBasicExampleComponent } from '../pages/tabcontrol-page/examples/tabs-basic.example';
import { TableBasicExampleComponent } from '../pages/table-page/examples/table-basic.example';
import { TableOptionsExampleComponent } from '../pages/table-page/examples/table-options.example';
import { TooltipTemplateExampleComponent } from '../pages/tooltips-page/examples/tooltip-template.example';
import { TreeComponentExampleComponent } from '../pages/tree-page/examples/tree-component.example';
import { TreeFlatExampleComponent } from '../pages/tree-page/examples/tree-flat.example';
import { VirtualizeDataExampleComponent } from '../pages/virtualize-page/examples/virtualize-data.example';

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

  it('starts the tabs sample on its first enabled tab, and shows each tab afterActivate reports, never a disabled one', async () => {
    const fixture = TestBed.createComponent(TabsBasicExampleComponent);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const activated = () => host.querySelector('output')!.textContent.trim();
    const header = (text: string) => Array.from(host.querySelectorAll<HTMLElement>('.tab')).find(tab => tab.textContent.trim() === text)!;
    const selected = () => host.querySelector('.tab.active')!.textContent.trim();
    const shown = () => Array.from(host.querySelectorAll<HTMLElement>('.tab-content'), content => (content.style.display === 'block' ? content.textContent.trim() : '')).join('');

    expect(activated()).toBe('Activated last: Second tab');

    // a disabled tab can't be selected: the second one stays, its content shown
    header('Third tab').click();
    await fixture.whenStable();
    expect(selected()).toBe('Second tab');
    expect(shown()).toBe('The second tab, the first one enabled, so the group shows it first.');
    expect(activated()).toBe('Activated last: Second tab');

    header('Fourth tab').click();
    await fixture.whenStable();
    expect(activated()).toBe('Activated last: Fourth tab');
    fixture.destroy();
  });

  // The box's height makes the lines overflow, which the arrows need
  it("shows the vertical scroller sample's arrows, the back one disabled at the start", async () => {
    const fixture = TestBed.createComponent(ScrollerVerticalExampleComponent);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector<HTMLButtonElement>('button.back')?.disabled).toBe(true);
    expect(host.querySelector<HTMLButtonElement>('button.forward')?.disabled).toBe(false);
    fixture.destroy();
  });

  // The padding goes through tooltipFullArgs: tooltipPadding sets none
  it("opens the tooltip template sample's tooltips with their context, and the padded ones with their 2rem", async () => {
    const fixture = TestBed.createComponent(TooltipTemplateExampleComponent);
    await fixture.whenStable();
    const buttons = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));
    const hover = async (text: string) => {
      const button = buttons.find(element => element.textContent.trim() === text)!;
      button.dispatchEvent(new MouseEvent('mouseenter'));
      await fixture.whenStable();
      const tooltip = document.querySelector('tab-tooltip')!;
      const shown = { text: tooltip.textContent.trim(), padding: getComputedStyle(tooltip.parentElement!).paddingTop };
      button.dispatchEvent(new MouseEvent('mouseleave'));
      await fixture.whenStable();
      return shown;
    };
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);

    expect((await hover('Left')).text).toBe('From a template, on the left');
    expect(await hover('Left, 10px away, padded 2rem')).toEqual({ text: 'From a template, on the left, 10px away, padded 2rem', padding: `${2 * rem}px` });
    expect(await hover('Bottom, 2em away, padded 2rem')).toEqual({ text: 'From a template, below, 2em away, padded 2rem', padding: `${2 * rem}px` });
    fixture.destroy();
  });

  it("orders the flat tree sample's nodes by their order, then by their place in the template, under the parent each names", async () => {
    const fixture = TestBed.createComponent(TreeFlatExampleComponent);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const rows = () => Array.from(host.querySelectorAll('.header-content'), row => row.textContent.trim());

    expect(rows()).toEqual(['Node 1', 'Node 2', 'Node 3, last by its order']);

    host.querySelector<HTMLButtonElement>('.header-button')!.click();
    await fixture.whenStable();
    expect(rows()).toEqual(['Node 1', 'Subnode 1.1', 'Subnode 1.2', 'Subnode 1.3', 'Subnode 1.4, last in Node 1 by its order', 'Node 2', 'Node 3, last by its order']);
    fixture.destroy();
  });

  it("shows the tree component sample's nodes, which its folder components hold", async () => {
    const fixture = TestBed.createComponent(TreeComponentExampleComponent);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const rows = () => Array.from(host.querySelectorAll('.header-content'), row => row.textContent.trim());

    expect(rows()).toEqual(['Documents', 'Pictures', 'Music']);

    host.querySelector<HTMLButtonElement>('.header-button')!.click();
    await fixture.whenStable();
    expect(rows()).toEqual(['Documents', 'Budget.xlsx', 'Plan.docx', 'Pictures', 'Music']);
    fixture.destroy();
  });

  it("shares the list display sample's value between its lists, and the disabled list picks nothing", async () => {
    const fixture = TestBed.createComponent(ListDisplayExampleComponent);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const lists = host.querySelectorAll('tab-list-single-select');
    const option = (list: number, text: string) => Array.from(lists[list].querySelectorAll<HTMLElement>('[role="option"]')).find(element => element.textContent.includes(text))!;

    option(1, 'Option 4').click();
    await fixture.whenStable();
    expect(host.querySelector('output')!.textContent.trim()).toBe('Value: 4');
    expect(option(0, 'Option 4').getAttribute('aria-selected')).toBe('true');

    option(3, 'Option 1').click();
    await fixture.whenStable();
    expect(host.querySelector('output')!.textContent.trim()).toBe('Value: 4');
    fixture.destroy();
  });

  it("shows the list forms sample's multiple values as the user picks them, and the single list's error once it is left", async () => {
    const fixture = TestBed.createComponent(ListFormsExampleComponent);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const [single, , , multi] = Array.from(host.querySelectorAll('tab-form-field'));
    const option = (field: Element, text: string) => Array.from(field.querySelectorAll<HTMLElement>('[role="option"]')).find(element => element.textContent.includes(text))!;
    const hint = () => multi.querySelector('tab-hint')!.textContent.trim();

    expect(hint()).toBe('Value: 1, 3');
    option(multi, 'Option 4').click();
    await fixture.whenStable();
    expect(hint()).toBe('Value: 1, 3, 4');
    option(multi, 'Option 1').click();
    await fixture.whenStable();
    expect(hint()).toBe('Value: 3, 4');

    // it starts above the maximum, untouched
    expect(single.querySelector('tab-error')).toBeNull();
    single.querySelector('tab-list-single-select')!.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    expect(single.querySelector('tab-error')?.textContent.trim()).toBe('The highest value is 3, so the last option is an error');
    fixture.destroy();
  });

  describe('the dashboard sample', () => {
    const layoutKey = 'enhanced-table-layout-garden-shop-orders';
    const columns = ['id', 'date', 'customer', 'region', 'product', 'quantity', 'sales', 'profit'];

    afterEach(() => {
      // a menu, a select's options or a dialog a test left open, and a layout a test saved
      document.querySelectorAll('.dialog-container, .dialog-backdrop').forEach(element => element.remove());
      localStorage.removeItem(layoutKey);
    });

    // At a laptop's width, beside which the drawer opens, on the Orders tab once its rows have loaded
    async function render() {
      const fixture = TestBed.createComponent(SalesDashboardExampleComponent);
      const host = fixture.nativeElement as HTMLElement;
      host.style.width = '64rem';
      await fixture.whenStable();
      const kpi = (label: string) =>
        Array.from(host.querySelectorAll('.kpi'))
          .find(tile => tile.querySelector('.label')!.textContent.trim() === label)!
          .querySelector('.value')!
          .textContent.trim();
      const rows = () => Array.from(host.querySelectorAll<HTMLElement>('.data-rows .row'));
      const cells = (column: string) => rows().map(row => row.querySelector(`[data-column-id="${column}"]`)!.textContent.trim());
      const headers = () => Array.from(host.querySelectorAll('.column-header[data-column-id]'), header => header.getAttribute('data-column-id'));
      // a header row button's text, without its icon's
      const button = (text: string) =>
        Array.from(host.querySelectorAll<HTMLButtonElement>('.header-row button')).find(element =>
          Array.from(element.querySelectorAll('tab-icon'))
            .reduce((rest, icon) => rest.replace(icon.textContent, ''), element.textContent)
            .trim()
            .startsWith(text),
        )!;
      const tab = (text: string) => Array.from(host.querySelectorAll<HTMLElement>('.tab')).find(element => element.textContent.trim() === text)!;
      const item = (text: string) => Array.from(document.querySelectorAll<HTMLElement>('.menu-button')).find(element => element.querySelector('.button-content')!.textContent.trim() === text)!;
      // clicks a header row button, then the item with this text in the menu it opens
      const menu = async (opener: string, text: string) => {
        button(opener).click();
        await fixture.whenStable();
        item(text).click();
        await fixture.whenStable();
      };
      // a column's row in the layout panel, and a button in the panel by its text
      const column = (id: string) => Array.from(host.querySelectorAll<HTMLElement>('.columns .column')).find(element => element.querySelector(`[data-handle="${id}"]`))!;
      const panelButton = (text: string) => Array.from(host.querySelectorAll<HTMLButtonElement>('.panel button')).find(element => element.textContent.trim() === text)!;

      tab('Orders').click();
      await fixture.whenStable();
      // a row still loading has no checkbox
      await vi.waitFor(() => expect(rows()[2]?.querySelector('tab-checkbox')).toBeTruthy());
      return { fixture, host, kpi, rows, cells, headers, button, tab, item, menu, column, panelButton };
    }

    it('changes the KPIs and the orders when the user picks a region, and counts the filters in use on the Filters button', async () => {
      const { fixture, host, kpi, cells, button } = await render();
      expect(kpi('Orders')).toBe('3,000');
      expect(new Set(cells('region')).size).toBeGreaterThan(1);
      expect(button('Filters').querySelector('.count')).toBeNull();
      const sales = kpi('Sales');

      button('Filters').click();
      await fixture.whenStable();
      host.querySelector<HTMLElement>('tab-multi-select')!.click();
      await fixture.whenStable();
      Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'))
        .find(option => option.textContent.trim() === 'North')!
        .click();
      await fixture.whenStable();

      await vi.waitFor(() => expect(new Set(cells('region'))).toEqual(new Set(['North'])));
      const orders = kpi('Orders');
      expect(Number(orders.replace(',', ''))).toBeLessThan(3000);
      expect(kpi('Sales')).not.toBe(sales);
      expect(host.querySelector('.subtitle')!.textContent.trim()).toBe(`${orders} of 3,000 orders`);
      expect(host.querySelector('.chips')!.textContent).toContain('Region: North');
      expect(button('Filters').querySelector('.count')!.textContent.trim()).toBe('1');

      await check(fixture, 'Only discounted orders');
      expect(button('Filters').querySelector('.count')!.textContent.trim()).toBe('2');
      fixture.destroy();
    });

    it('keeps the search out of the Filters count, and Clear all filters leaves it', async () => {
      const { fixture, host, kpi, cells, button, item } = await render();
      const search = host.querySelector<HTMLInputElement>('.header-row input')!;

      await type(fixture, search, 'fern');
      await vi.waitFor(() => expect(new Set(cells('product'))).toEqual(new Set(['Boston fern'])));
      expect(host.querySelector('.chips')!.textContent).toContain('Search: fern');
      expect(button('Filters').querySelector('.count')).toBeNull();

      button('Filters').click();
      await fixture.whenStable();
      await check(fixture, 'Only discounted orders');
      expect(button('Filters').querySelector('.count')!.textContent.trim()).toBe('1');
      const discounted = kpi('Orders');

      Array.from(host.querySelectorAll<HTMLButtonElement>('.panel button'))
        .find(element => element.textContent.trim() === 'Clear all filters')!
        .click();
      await fixture.whenStable();
      expect(button('Filters').querySelector('.count')).toBeNull();
      expect(kpi('Orders')).not.toBe(discounted);
      expect(search.value).toBe('fern');

      // the clear button goes with the text, and the focus goes back to the search
      host.querySelector<HTMLButtonElement>('.header-row tab-suffix button')!.click();
      await fixture.whenStable();
      expect(search.value).toBe('');
      expect(document.activeElement).toBe(search);

      // with no order left, the Actions menu has nothing to copy
      await type(fixture, search, 'no such product');
      expect(kpi('Orders')).toBe('0');
      button('Actions').click();
      await fixture.whenStable();
      expect(item('Copy 0 orders to the clipboard').getAttribute('aria-disabled')).toBe('true');
      fixture.destroy();
    });

    it('sorts the orders by sales from its header, up then down', async () => {
      const { fixture, host, cells } = await render();
      const sales = () => cells('sales').map(text => Number(text.replace(/[$,]/g, '')));
      const header = host.querySelector<HTMLElement>('.column-header[data-column-id="sales"] .header-button')!;

      // until the reset's rows have loaded: the rows still loading read as $0, which looks sorted
      header.click();
      await vi.waitFor(() => {
        const values = sales();
        expect(values[0]).toBeLessThan(values.at(-1)!);
        expect(values).toEqual([...values].sort((a, b) => a - b));
      });

      header.click();
      await vi.waitFor(() => {
        const values = sales();
        expect(values[0]).toBeGreaterThan(values.at(-1)!);
        expect(values).toEqual([...values].sort((a, b) => b - a));
      });
      fixture.destroy();
    });

    it("counts the selected orders on the selection button, whose menu copies them in the table's order, and says so in a snack", async () => {
      const { fixture, rows, cells, button, menu } = await render();
      const snack = vi.spyOn(TestBed.inject(SnackService), 'openSnack');
      const write = vi.spyOn(TestBed.inject(ClipboardService), 'writeText').mockResolvedValue();
      const ids = cells('id').map(text => parseInt(text, 10));
      expect(button('2 orders selected')).toBeUndefined();

      // the third row first: the copy keeps the table's order, not the order they were picked in
      rows()[2].querySelector<HTMLInputElement>('tab-checkbox input[type="checkbox"]')!.click();
      await fixture.whenStable();
      expect(button('1 order selected')).toBeDefined();
      rows()[0].querySelector<HTMLInputElement>('tab-checkbox input[type="checkbox"]')!.click();
      await fixture.whenStable();
      await menu('2 orders selected', 'Copy them to the clipboard');

      await vi.waitFor(() => expect(snack).toHaveBeenLastCalledWith('Copied 2 orders to the clipboard', 3000, 'success'));
      const lines = write.mock.lastCall![0].split('\n');
      expect(lines[0]).toBe('Order\tDate\tCustomer\tRegion\tChannel\tProduct\tCategory\tQuantity\tSales\tProfit');
      expect(lines.slice(1).map(line => parseInt(line, 10))).toEqual([ids[0], ids[2]]);

      // the selection button goes with the selection, and the focus goes to the Actions button
      await menu('2 orders selected', 'Clear the selection');
      expect(button('2 orders selected')).toBeUndefined();
      await vi.waitFor(() => expect(document.activeElement).toBe(button('Actions')));
      fixture.destroy();
    });

    it('resets the filters from the actions menu, and says so in a snack', async () => {
      const { fixture, kpi, button, menu } = await render();
      const snack = vi.spyOn(TestBed.inject(SnackService), 'openSnack');

      button('Filters').click();
      await fixture.whenStable();
      await check(fixture, 'Only discounted orders');
      expect(kpi('Orders')).not.toBe('3,000');
      await menu('Actions', 'Reset the filters');

      expect(snack).toHaveBeenLastCalledWith('Filters reset: all 3,000 orders', 3000, 'info');
      expect(kpi('Orders')).toBe('3,000');
      fixture.destroy();
    });

    it("opens an order's details in a dialog from the button by its number", async () => {
      const { fixture, rows } = await render();
      const row = rows()[1];
      const [id, customer, product] = ['id', 'customer', 'product'].map(column => row.querySelector(`[data-column-id="${column}"]`)!.textContent.trim());

      row.querySelector<HTMLButtonElement>('[data-column-id="id"] button')!.click();
      await fixture.whenStable();

      const dialog = document.querySelector('.dialog-container')!;
      expect(dialog.textContent).toContain(`Order ${parseInt(id, 10)}`);
      expect(dialog.querySelector('.details')!.textContent).toContain(customer);
      expect(dialog.querySelector('.details')!.textContent).toContain(product);
      fixture.destroy();
    });

    it('shows the Orders tab with the layout panel, which hides a column, and moves one with the arrow keys on its handle', async () => {
      const { fixture, host, headers, button, tab, column } = await render();
      const moveUp = async (id: string) => {
        const handle = column(id).querySelector<HTMLButtonElement>('[data-handle]')!;
        handle.focus();
        handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
        await fixture.whenStable();
      };
      tab('Overview').click();
      await fixture.whenStable();

      button('Layout & Sorting').click();
      await fixture.whenStable();
      expect(host.querySelector('.tab.active')!.textContent.trim()).toBe('Orders');
      expect(headers()).toEqual(['id', 'date', 'customer', 'region', 'product', 'quantity', 'sales', 'profit']);

      column('region').querySelector<HTMLInputElement>('tab-checkbox input[type="checkbox"]')!.click();
      await fixture.whenStable();
      expect(headers()).toEqual(['id', 'date', 'customer', 'product', 'quantity', 'sales', 'profit']);

      await moveUp('customer');
      expect(headers()).toEqual(['id', 'customer', 'date', 'product', 'quantity', 'sales', 'profit']);
      expect(document.activeElement).toBe(column('customer').querySelector('[data-handle]'));
      expect(host.querySelector('[aria-live]')!.textContent.trim()).toBe('Customer moved to place 2 of 8');

      await moveUp('date');
      expect(headers()).toEqual(['id', 'date', 'customer', 'product', 'quantity', 'sales', 'profit']);
      expect(host.querySelector('[aria-live]')!.textContent.trim()).toBe('Date moved to place 2 of 8');
      fixture.destroy();
    });

    it('keeps a saved layout in the browser for the next dashboard, until Reset goes back to the default', async () => {
      const first = await render();
      first.button('Layout & Sorting').click();
      await first.fixture.whenStable();
      const region = Array.from(first.host.querySelectorAll('.columns .column')).find(element => element.querySelector('[data-handle="region"]'))!;
      region.querySelector<HTMLInputElement>('tab-checkbox input[type="checkbox"]')!.click();
      await first.fixture.whenStable();
      await click(first.fixture, 'Save');
      expect((JSON.parse(localStorage.getItem(layoutKey)!) as { hidden: string[] }).hidden).toEqual(['region']);
      first.fixture.destroy();

      const { fixture, headers, button } = await render();
      expect(headers()).not.toContain('region');

      vi.spyOn(TestBed.inject(DialogService), 'openConfirmationMessageDialog').mockResolvedValue(true);
      button('Layout & Sorting').click();
      await fixture.whenStable();
      await click(fixture, 'Reset');
      Array.from(document.querySelectorAll<HTMLElement>('.menu-button'))
        .find(item => item.querySelector('.button-content')!.textContent.trim() === 'Reset to the default layout')!
        .click();
      await vi.waitFor(() => expect(headers()).toContain('region'));
      expect(localStorage.getItem(layoutKey)).toBeNull();
      fixture.destroy();
    });

    it('pins a column to the left and unpins it, turns Save on after a change, and goes back to the saved layout', async () => {
      const { fixture, host, headers, button, item, column, panelButton } = await render();
      button('Layout & Sorting').click();
      await fixture.whenStable();
      const save = panelButton('Save');
      expect(save.disabled).toBe(true);

      const sales = column('sales');
      const [left, right] = [sales.querySelector<HTMLButtonElement>('.pin.left')!, sales.querySelector<HTMLButtonElement>('.pin.right')!];
      left.click();
      await fixture.whenStable();
      expect(headers()[0]).toBe('sales');
      expect(left.getAttribute('aria-pressed')).toBe('true');
      expect([right.disabled, sales.querySelector<HTMLButtonElement>('[data-handle]')!.disabled]).toEqual([true, true]);
      expect(save.disabled).toBe(false);

      left.click();
      await fixture.whenStable();
      expect(headers()).toEqual(columns);
      expect(left.getAttribute('aria-pressed')).toBe('false');
      expect(save.disabled).toBe(true);

      // saved with striped rows, then a column hidden: Reset to the saved layout brings the column back, striped
      host.querySelector<HTMLInputElement>('.panel > tab-checkbox input[type="checkbox"]')!.click();
      await fixture.whenStable();
      expect(save.disabled).toBe(false);
      save.click();
      await fixture.whenStable();
      expect(save.disabled).toBe(true);
      column('region').querySelector<HTMLInputElement>('tab-checkbox input[type="checkbox"]')!.click();
      await fixture.whenStable();
      expect(headers()).not.toContain('region');

      panelButton('Reset').click();
      await fixture.whenStable();
      item('Reset to the saved layout').click();
      await fixture.whenStable();
      await vi.waitFor(() => expect(headers()).toEqual(columns));
      expect(host.querySelector('.data-rows')!.classList).toContain('striped');
      fixture.destroy();
    });

    // A layout another version saved, or one edited by hand, must not break the page: one wrong field at a time
    it.each([
      ['text that is not JSON', 'not a layout'],
      ['a list', '["gone"]'],
      ['a sort that is not a list', '{"sort":null}'],
      ['an order that is not a list', '{"order":5}'],
      ['hidden columns that are not a list', '{"hidden":"region"}'],
      ['striped rows that are not a boolean', '{"striped":"yes"}'],
      ['columns the table does not have', '{"order":["gone"],"hidden":["gone"],"pinnedLeftColumn":"gone","sort":[{"property":"gone","direction":"asc"}]}'],
      ['every column hidden', JSON.stringify({ hidden: columns })],
    ])('starts from the default layout when the saved one has %s', async (_, saved) => {
      localStorage.setItem(layoutKey, saved);
      const { fixture, host, headers } = await render();

      expect(headers()).toEqual(columns);
      expect(host.querySelector('.column-header[data-column-id="date"] .sort-indicator tab-icon')!.textContent.trim()).toBe('arrow_downward');
      expect(host.querySelector('.data-rows')!.classList).not.toContain('striped');
      fixture.destroy();
    });

    it("averages the months the dates cover, and names each month of a KPI's line", async () => {
      const { fixture, host, kpi, button } = await render();
      const compact = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 });
      const line = (index: number) => host.querySelectorAll('.kpi svg')[index].getAttribute('aria-label')!;
      button('Filters').click();
      await fixture.whenStable();
      const [from, to] = Array.from(host.querySelectorAll<HTMLInputElement>('input[type="date"]'));

      await type(fixture, from, '2025-04-01');
      await type(fixture, to, '2025-06-30');

      const sales = Number(kpi('Sales').replace(/[$,]/g, ''));
      expect(host.querySelector('.legend')!.textContent.trim()).toBe(`Monthly average ${compact.format(sales / 3)}`);
      expect(line(0)).toMatch(/^Sales by month: Jan \$0, Feb \$0, Mar \$0, Apr \$[\d,]+, /);
      // a month with no orders has no average order
      expect(line(3)).toMatch(/^Average order by month: Jan no orders, Feb no orders, Mar no orders, Apr \$\d+, /);
      fixture.destroy();
    });

    // From the keyboard, as the user who would otherwise tab through the table's rows to reach the panel: Space on a
    // focused button clicks it, and a mouse's click would blur it afterwards
    it("puts the focus in the drawer's panel when it opens, and back on its button when Escape closes it", async () => {
      const { fixture, host, button } = await render();
      const panel = host.querySelector('.panel')!;
      const press = async (text: string) => {
        button(text).focus();
        button(text).dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true }));
        await fixture.whenStable();
      };

      await press('Layout & Sorting');
      await vi.waitFor(() => expect(document.activeElement!.textContent.trim()).toBe('Layout'));
      expect(panel.contains(document.activeElement)).toBe(true);

      await press('Filters');
      await vi.waitFor(() => expect(document.activeElement!.textContent.trim()).toBe('Filters'));
      expect(panel.contains(document.activeElement)).toBe(true);

      document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await fixture.whenStable();
      expect(button('Filters').getAttribute('aria-expanded')).toBe('false');
      expect(document.activeElement).toBe(button('Filters'));
      fixture.destroy();
    });

    it("moves the focus to the next chip's remove button when a chip goes, and to the Filters button after the last", async () => {
      const { fixture, host, button } = await render();
      const removers = () => Array.from(host.querySelectorAll<HTMLButtonElement>('.chips button'));
      const chips = () => Array.from(host.querySelectorAll('.chips tab-chip'), chip => chip.textContent.replace(chip.querySelector('button')!.textContent, '').trim());
      button('Filters').click();
      await fixture.whenStable();
      await check(fixture, 'Only discounted orders');
      await check(fixture, 'Include returned orders');
      expect(chips()).toEqual(['Discounted only', 'No returns']);

      removers()[0].focus();
      removers()[0].click();
      await fixture.whenStable();
      expect(chips()).toEqual(['No returns']);
      await vi.waitFor(() => expect(document.activeElement).toBe(removers()[0]));

      removers()[0].click();
      await fixture.whenStable();
      expect(host.querySelector('.chips')).toBeNull();
      await vi.waitFor(() => expect(document.activeElement).toBe(button('Filters')));
      fixture.destroy();
    });

    // Closed, the drawer leaves the tab order; on a narrow dashboard the open drawer covers the content, which leaves it
    it('keeps a closed drawer out of the tab order, and covers a narrow dashboard with an open one', async () => {
      const { fixture, host, button } = await render();
      const [panel, content] = [host.querySelector('.panel')!, host.querySelector('app-enhanced-table .content')!];
      expect([panel.hasAttribute('inert'), content.hasAttribute('inert')]).toEqual([true, false]);

      button('Filters').click();
      await fixture.whenStable();
      expect(button('Filters').getAttribute('aria-expanded')).toBe('true');
      expect([panel.hasAttribute('inert'), content.hasAttribute('inert')]).toEqual([false, false]);

      host.style.width = '20rem';
      await vi.waitFor(() => expect([panel.hasAttribute('inert'), content.hasAttribute('inert')]).toEqual([false, true]));

      button('Filters').click();
      await fixture.whenStable();
      expect([panel.hasAttribute('inert'), content.hasAttribute('inert')]).toEqual([true, false]);
      fixture.destroy();
    });
  });

  // The loader answers after a second
  it("loads the virtualize data sample's rows from its loader, shows the last request, and loads again on a button", async () => {
    const fixture = TestBed.createComponent(VirtualizeDataExampleComponent);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const rows = () => Array.from(host.querySelectorAll('tab-virtualize .item'), item => item.textContent.trim());

    await vi.waitFor(() => expect(rows().slice(0, 2)).toEqual(['Row 1', 'Row 2']), { timeout: 5000 });
    expect(rows().length).toBeGreaterThan(2);
    expect(host.querySelector('output')!.textContent.trim()).toMatch(/^The last request asked for rows \d+ to \d+$/);

    await click(fixture, '2 rows');
    await vi.waitFor(() => expect(rows()).toEqual(['Row 1', 'Row 2']), { timeout: 5000 });
    fixture.destroy();
  });
});
