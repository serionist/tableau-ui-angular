import { CurrencyPipe, DatePipe, PercentPipe } from '@angular/common';
import type { TemplateRef } from '@angular/core';
import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, signal, viewChild } from '@angular/core';
import { TableauUiAutoCompleteModule } from 'tableau-ui-angular/autocomplete';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiButtonToggleModule } from 'tableau-ui-angular/button-toggle';
import { TableauUiCheckboxModule } from 'tableau-ui-angular/checkbox';
import { TableauUiChipModule } from 'tableau-ui-angular/chip';
import { ClipboardService } from 'tableau-ui-angular/clipboard';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiDatePickerModule } from 'tableau-ui-angular/date-picker';
import { DialogService } from 'tableau-ui-angular/dialog';
import { TableauUiExpansionPanelModule } from 'tableau-ui-angular/expansion-panel';
import { TableauUiFormFieldModule } from 'tableau-ui-angular/form-field';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
import { TableauUiMenuModule } from 'tableau-ui-angular/menu';
import { TableauUiMenuButtonModule } from 'tableau-ui-angular/menu-button';
import { TableauUiSelectModule } from 'tableau-ui-angular/select';
import { SnackService } from 'tableau-ui-angular/snack';
import { TableauUiTabgroupModule, TabGroupComponent } from 'tableau-ui-angular/tab-group';
import { ThemeService } from 'tableau-ui-angular/theme';
import type { TableComponent } from 'tableau-ui-angular/table';
import { MultiSelectionOptions, TableauUiTableModule } from 'tableau-ui-angular/table';
import { TableauUiTooltipModule } from 'tableau-ui-angular/tooltip';
import type { DataSort, FullDataRequest } from 'tableau-ui-angular/virtualize';
import { FullDataOptions } from 'tableau-ui-angular/virtualize';
import { EnhancedTableComponent, FilterPanelDirective, HeaderBeforeSelectDirective, SelectMenuButtonsDirective } from './enhanced-table.component';

type Region = 'Central' | 'East' | 'North' | 'South' | 'West';
type Category = 'Plants' | 'Pots' | 'Seeds' | 'Tools';
type Channel = 'In store' | 'Online';
type Filter = 'category' | 'channel' | 'customer' | 'discounted' | 'from' | 'regions' | 'returns' | 'search' | 'to';

interface Order {
  id: number;
  date: Date;
  customer: string;
  region: Region;
  channel: Channel;
  product: string;
  category: Category;
  quantity: number;
  // 0, 0.1, 0.2 or 0.3 off the price
  discount: number;
  // what the customer paid, and that less what the goods cost
  sales: number;
  profit: number;
  returned: boolean;
}

const REGIONS: readonly Region[] = ['North', 'South', 'East', 'West', 'Central'];
const CATEGORIES: readonly Category[] = ['Plants', 'Pots', 'Tools', 'Seeds'];
// the share of a price the shop keeps before any discount
const MARGINS: Record<Category, number> = { Plants: 0.45, Pots: 0.3, Tools: 0.22, Seeds: 0.6 };
const PRODUCTS: readonly { name: string; category: Category; price: number }[] = [
  { name: 'Monstera', category: 'Plants', price: 34 },
  { name: 'Fiddle-leaf fig', category: 'Plants', price: 48 },
  { name: 'Snake plant', category: 'Plants', price: 22 },
  { name: 'Boston fern', category: 'Plants', price: 18 },
  { name: 'Olive tree', category: 'Plants', price: 89 },
  { name: 'Lavender', category: 'Plants', price: 9 },
  { name: 'Terracotta pot', category: 'Pots', price: 12 },
  { name: 'Glazed planter', category: 'Pots', price: 39 },
  { name: 'Hanging basket', category: 'Pots', price: 24 },
  { name: 'Raised bed', category: 'Pots', price: 129 },
  { name: 'Pruning shears', category: 'Tools', price: 29 },
  { name: 'Hand trowel', category: 'Tools', price: 14 },
  { name: 'Watering can', category: 'Tools', price: 26 },
  { name: 'Garden hose', category: 'Tools', price: 45 },
  { name: 'Wheelbarrow', category: 'Tools', price: 119 },
  { name: 'Tomato seeds', category: 'Seeds', price: 4 },
  { name: 'Basil seeds', category: 'Seeds', price: 3 },
  { name: 'Sunflower seeds', category: 'Seeds', price: 4 },
  { name: 'Wildflower mix', category: 'Seeds', price: 7 },
  { name: 'Lawn seed', category: 'Seeds', price: 24 },
];
const FIRST_NAMES = ['Ada', 'Ben', 'Carla', 'Dev', 'Ema', 'Finn', 'Gia', 'Hugo', 'Ines', 'Jon', 'Kira', 'Leo'];
const LAST_NAMES = ['Park', 'Okafor', 'Diaz', 'Novak', 'Walsh', 'Lind', 'Silva', 'Berg'];
// 48 customers, each name once
const CUSTOMERS = Array.from({ length: 48 }, (_, index) => `${FIRST_NAMES[index % 12]} ${LAST_NAMES[(index * 5 + Math.floor(index / 12)) % 8]}`);
// a garden shop's year: each month's share of the orders
const SEASON = [3, 4, 7, 11, 13, 10, 8, 7, 6, 5, 4, 6];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// 3,000 made-up orders in 2025, the same on every load: a seeded random number generator picks each value
function makeOrders(count: number): Order[] {
  let seed = 2025;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const pick = <T>(values: readonly T[]) => values[Math.floor(random() * values.length)];
  const months = SEASON.flatMap((weight, month) => Array.from({ length: weight }, () => month));
  const cents = (value: number) => Math.round(value * 100) / 100;
  const orders = Array.from({ length: count }, (): Order => {
    const month = pick(months);
    const product = pick(PRODUCTS);
    const quantity = 1 + Math.floor(random() * 4);
    const discount = pick([0, 0, 0, 0, 0, 0.1, 0.1, 0.2, 0.3]);
    const sales = cents(product.price * quantity * (1 - discount));
    return {
      id: 0,
      date: new Date(2025, month, 1 + Math.floor(random() * new Date(2025, month + 1, 0).getDate())),
      customer: pick(CUSTOMERS),
      region: pick<Region>(['North', 'North', 'South', 'East', 'East', 'East', 'West', 'West', 'Central']),
      channel: pick<Channel>(['Online', 'Online', 'Online', 'In store', 'In store']),
      product: product.name,
      category: product.category,
      quantity,
      discount,
      sales,
      profit: cents(sales - product.price * quantity * (1 - MARGINS[product.category])),
      returned: random() < 0.04,
    };
  });
  // numbered in the order they came in
  return orders.sort((a, b) => a.date.getTime() - b.date.getTime()).map((order, index) => ({ ...order, id: 10001 + index }));
}

const ORDERS = makeOrders(3000);

const sum = <T>(rows: readonly T[], value: (row: T) => number) => rows.reduce((total, row) => total + value(row), 0);
const MONEY = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const SHORT_MONEY = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 });
const PERCENT = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 });
const COUNT = new Intl.NumberFormat('en-US');
const DAY = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
// A day as YYYY-MM-DD, in local time as the orders' dates are
const isoDay = (date: Date) => [date.getFullYear(), date.getMonth() + 1, date.getDate()].map(part => String(part).padStart(2, '0')).join('-');
const TOTAL_SALES = sum(ORDERS, order => order.sales);

// The smallest of 1, 2, 2.5 and 5 times a power of 10 at or above the value: a chart's top line
function niceCeiling(value: number) {
  const step = 10 ** Math.floor(Math.log10(value));
  return [1, 2, 2.5, 5, 10].map(factor => factor * step).find(top => top >= value) ?? value;
}

// A sparkline's points in a 110 by 30 box, a month every 10
function sparkline(values: number[]) {
  const [low, high] = [Math.min(...values), Math.max(...values)];
  return values.map((value, index) => `${index * 10},${28 - ((value - low) / (high - low || 1)) * 26}`).join(' ');
}

// Sorted in the browser, as the table asks; a server would sort them for the request
function sortOrders(orders: readonly Order[], sort: readonly DataSort[]) {
  return [...orders].sort((a, b) => {
    for (const { property, direction } of sort) {
      const [x, y] = [a[property as keyof Order], b[property as keyof Order]];
      const order = typeof x === 'string' && typeof y === 'string' ? x.localeCompare(y) : Number(x) - Number(y);
      if (order !== 0) {
        return direction === 'asc' ? order : -order;
      }
    }
    return 0;
  });
}

@Component({
  selector: 'app-sales-dashboard-example',
  imports: [
    CurrencyPipe,
    DatePipe,
    PercentPipe,
    TableauUiAutoCompleteModule,
    TableauUiButtonModule,
    TableauUiButtonToggleModule,
    TableauUiCheckboxModule,
    TableauUiChipModule,
    TableauUiCommonModule,
    TableauUiDatePickerModule,
    TableauUiExpansionPanelModule,
    TableauUiFormFieldModule,
    TableauUiIconModule,
    TableauUiMenuModule,
    TableauUiMenuButtonModule,
    TableauUiSelectModule,
    TableauUiTabgroupModule,
    TableauUiTableModule,
    TableauUiTooltipModule,
    EnhancedTableComponent,
    FilterPanelDirective,
    HeaderBeforeSelectDirective,
    SelectMenuButtonsDirective,
  ],
  templateUrl: './sales-dashboard.example.html',
  styleUrl: './sales-dashboard.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesDashboardExampleComponent {
  private readonly clipboard = inject(ClipboardService);
  private readonly dialogs = inject(DialogService);
  private readonly snacks = inject(SnackService);
  private readonly theme = inject(ThemeService);
  // The charts' marks take a brighter blue on dark
  protected readonly $dark = computed(() => this.theme.$appliedThemeMode() === 'dark');
  private readonly table = viewChild.required<TableComponent<Order>>('table');
  private readonly details = viewChild.required<TemplateRef<{ $implicit: Order }>>('details');
  private readonly tabs = viewChild.required(TabGroupComponent);

  protected readonly regions = REGIONS;
  protected readonly categories = CATEGORIES;
  protected readonly orderCount = COUNT.format(ORDERS.length);

  // #region Filters
  // Each filter's value; none set keeps every order
  protected readonly $regions = signal<Region[] | undefined>(undefined);
  protected readonly $category = signal<Category | undefined>(undefined);
  protected readonly $channel = signal<Channel | 'All' | undefined>('All');
  protected readonly $from = signal<Date | undefined>(undefined);
  protected readonly $to = signal<Date | undefined>(undefined);
  protected readonly $customer = signal('');
  protected readonly $discountedOnly = signal(false);
  protected readonly $withReturns = signal(true);
  // The search, in the table's header row, looks in the products' names
  protected readonly $search = signal('');

  protected readonly $suggestions = computed(() => {
    const text = this.$customer().trim().toLowerCase();
    return CUSTOMERS.filter(name => name.toLowerCase().includes(text)).slice(0, 8);
  });

  // The orders the filters keep: everything below follows them
  protected readonly $orders = computed(() => {
    const regions = this.$regions() ?? [];
    const category = this.$category();
    const channel = this.$channel() ?? 'All';
    const from = this.$from()?.getTime() ?? -Infinity;
    const to = this.$to()?.getTime() ?? Infinity;
    const customer = this.$customer().trim().toLowerCase();
    const search = this.$search().trim().toLowerCase();
    const discountedOnly = this.$discountedOnly();
    const withReturns = this.$withReturns();
    return ORDERS.filter(
      order =>
        (regions.length === 0 || regions.includes(order.region)) &&
        (category === undefined || order.category === category) &&
        (channel === 'All' || order.channel === channel) &&
        order.date.getTime() >= from &&
        order.date.getTime() <= to &&
        order.customer.toLowerCase().includes(customer) &&
        order.product.toLowerCase().includes(search) &&
        (!discountedOnly || order.discount > 0) &&
        (withReturns || !order.returned),
    );
  });

  protected readonly $count = computed(() => COUNT.format(this.$orders().length));

  // The filters that keep fewer orders, each a chip that clears it
  protected readonly $chips = computed(() => {
    const chips: { key: Filter; text: string }[] = [];
    const regions = this.$regions() ?? [];
    const [category, channel, from, to, customer, search] = [this.$category(), this.$channel(), this.$from(), this.$to(), this.$customer().trim(), this.$search().trim()];
    if (regions.length > 0) chips.push({ key: 'regions', text: `Region: ${regions.join(', ')}` });
    if (category) chips.push({ key: 'category', text: `Category: ${category}` });
    if (channel !== 'All' && channel !== undefined) chips.push({ key: 'channel', text: `Channel: ${channel}` });
    if (from) chips.push({ key: 'from', text: `From ${DAY.format(from)}` });
    if (to) chips.push({ key: 'to', text: `To ${DAY.format(to)}` });
    if (customer) chips.push({ key: 'customer', text: `Customer: ${customer}` });
    if (search) chips.push({ key: 'search', text: `Search: ${search}` });
    if (this.$discountedOnly()) chips.push({ key: 'discounted', text: 'Discounted only' });
    if (!this.$withReturns()) chips.push({ key: 'returns', text: 'No returns' });
    return chips;
  });

  // The Filters button counts the filters in its panel: the search shows in its own field
  protected readonly $filterCount = computed(() => this.$chips().filter(chip => chip.key !== 'search').length);

  protected customerInput(event: Event) {
    this.$customer.set((event.target as HTMLInputElement).value);
  }

  protected clearFilter(key: Filter) {
    switch (key) {
      case 'regions':
        this.$regions.set(undefined);
        break;
      case 'category':
        this.$category.set(undefined);
        break;
      case 'channel':
        this.$channel.set('All');
        break;
      case 'from':
        this.$from.set(undefined);
        break;
      case 'to':
        this.$to.set(undefined);
        break;
      case 'customer':
        this.$customer.set('');
        break;
      case 'search':
        this.$search.set('');
        break;
      case 'discounted':
        this.$discountedOnly.set(false);
        break;
      case 'returns':
        this.$withReturns.set(true);
        break;
    }
  }

  // Clear all filters, in the panel, leaves the search; Reset the filters, in the Actions menu, clears it too
  protected clearFilters() {
    for (const { key } of this.$chips().filter(chip => chip.key !== 'search')) {
      this.clearFilter(key);
    }
  }

  protected resetFilters() {
    for (const { key } of this.$chips()) {
      this.clearFilter(key);
    }
    this.snacks.openSnack(`Filters reset: all ${this.orderCount} orders`, 3000, 'info');
  }

  // The layout is the Orders table's, so its tab shows while the layout panel is open
  protected drawerOpened(panel: 'filter' | 'layout') {
    if (panel === 'layout') {
      this.tabs().selectTabByKey('orders');
    }
  }
  // #endregion

  // #region KPIs and charts
  private readonly $months = computed(() => {
    const months = MONTHS.map(() => ({ sales: 0, profit: 0, orders: 0 }));
    for (const order of this.$orders()) {
      const month = months[order.date.getMonth()];
      month.sales += order.sales;
      month.profit += order.profit;
      month.orders++;
    }
    return months;
  });

  protected readonly $kpis = computed(() => {
    const [orders, months] = [this.$orders(), this.$months()];
    const sales = sum(orders, order => order.sales);
    const profit = sum(orders, order => order.profit);
    return [
      {
        label: 'Sales',
        value: MONEY.format(sales),
        note: `${PERCENT.format(sales / TOTAL_SALES)} of the year's sales`,
        about: 'What customers paid, after discounts',
        points: sparkline(months.map(month => month.sales)),
        loss: false,
      },
      {
        label: 'Profit',
        value: MONEY.format(profit),
        note: `${PERCENT.format(sales === 0 ? 0 : profit / sales)} margin`,
        about: 'Sales less what the goods cost; a deep discount sells at a loss',
        points: sparkline(months.map(month => month.profit)),
        loss: profit < 0,
      },
      {
        label: 'Orders',
        value: COUNT.format(orders.length),
        note: `${COUNT.format(sum(orders, order => order.quantity))} items`,
        about: 'Each order is one product, in any quantity',
        points: sparkline(months.map(month => month.orders)),
        loss: false,
      },
      {
        label: 'Average order',
        value: MONEY.format(orders.length === 0 ? 0 : sales / orders.length),
        note: `${new Set(orders.map(order => order.customer)).size} customers`,
        about: 'Sales divided by orders',
        points: sparkline(months.map(month => (month.orders === 0 ? 0 : month.sales / month.orders))),
        loss: false,
      },
    ];
  });

  // Columns in a 120 by 100 box, a month every 10, under the top line; the average as a reference line
  protected readonly $monthChart = computed(() => {
    const months = this.$months();
    const top = niceCeiling(Math.max(...months.map(month => month.sales), 1));
    const average = sum(months, month => month.sales) / months.length;
    return {
      top: SHORT_MONEY.format(top),
      half: SHORT_MONEY.format(top / 2),
      columns: months.map((month, index) => ({ label: MONTHS[index], x: index * 10 + 2, height: (month.sales / top) * 100 })),
      average: (average / top) * 100,
      averageText: `Average ${SHORT_MONEY.format(average)}`,
      description: `Sales by month: ${months.map((month, index) => `${MONTHS[index]} ${MONEY.format(month.sales)}`).join(', ')}`,
    };
  });

  protected readonly $regionBars = computed(() => {
    const totals = REGIONS.map(region => ({
      region,
      sales: sum(
        this.$orders().filter(order => order.region === region),
        order => order.sales,
      ),
    }));
    const top = Math.max(...totals.map(total => total.sales), 1);
    return totals
      .filter(total => total.sales > 0)
      .sort((a, b) => b.sales - a.sales)
      .map(total => ({ label: total.region, width: (total.sales / top) * 100, value: SHORT_MONEY.format(total.sales) }));
  });

  // A loss's bar runs as far as a profit's would, in the error colour
  protected readonly $categoryBars = computed(() => {
    const totals = CATEGORIES.map(category => ({
      category,
      profit: sum(
        this.$orders().filter(order => order.category === category),
        order => order.profit,
      ),
    }));
    const top = Math.max(...totals.map(total => Math.abs(total.profit)), 1);
    return totals.map(total => ({ label: total.category, width: (Math.abs(total.profit) / top) * 100, value: SHORT_MONEY.format(total.profit), loss: total.profit < 0 }));
  });

  // Each category's products by sales, their bars on one scale
  protected readonly $productGroups = computed(() => {
    const totals = new Map(PRODUCTS.map(product => [product.name, { units: 0, sales: 0 }]));
    for (const order of this.$orders()) {
      const total = totals.get(order.product)!;
      total.units += order.quantity;
      total.sales += order.sales;
    }
    const top = Math.max(...[...totals.values()].map(total => total.sales), 1);
    return CATEGORIES.map(category => {
      const products = PRODUCTS.filter(product => product.category === category)
        .map(product => ({ name: product.name, ...totals.get(product.name)! }))
        .sort((a, b) => b.sales - a.sales);
      return {
        category,
        sales: MONEY.format(sum(products, product => product.sales)),
        products: products.map(product => ({ label: product.name, units: COUNT.format(product.units), width: (product.sales / top) * 100, value: MONEY.format(product.sales) })),
      };
    });
  });
  // #endregion

  // #region Orders
  // A new load each time the filters change; the table loads it, sorted as its headers say
  protected readonly $sort = signal<DataSort[]>([{ property: 'date', direction: 'desc' }]);
  protected readonly $dataOptions = computed(() => {
    const orders = this.$orders();
    return new FullDataOptions<Order>(
      order => order.id,
      async (request: FullDataRequest) => Promise.resolve({ data: sortOrders(orders, request.sort) }),
    );
  });
  protected readonly selectionOptions = new MultiSelectionOptions('selectAll', 'checkbox', true, false);
  // The selection empties when the filters change, and keeps through a sort
  protected readonly $selected = linkedSignal<Order[], Map<number, Order>>({ source: this.$orders, computation: () => new Map() });

  protected readonly $selectedSales = computed(() => MONEY.format(sum([...this.$selected().values()], order => order.sales)));
  protected readonly $selectionText = computed(() => `${COUNT.format(this.$selected().size)} ${this.$selected().size === 1 ? 'order' : 'orders'} selected`);

  protected clearSelection() {
    this.$selected.set(new Map());
  }

  // The table measures the rows it has room for, so it loads once its tab shows
  protected loadOrders() {
    void this.table().load();
  }

  protected openOrder(order: Order) {
    this.dialogs.openTemplateModal(this.details(), { $implicit: order }, { header: { title: `Order ${order.id}`, allowClose: true }, width: '24rem' });
  }

  // The selected orders, or every order the filters keep, in the table's order
  protected async copyOrders(selectedOnly: boolean) {
    const selected = this.$selected();
    const orders = sortOrders(selectedOnly ? this.$orders().filter(order => selected.has(order.id)) : this.$orders(), this.$sort());
    const lines = orders.map(order => [order.id, isoDay(order.date), order.customer, order.region, order.channel, order.product, order.category, order.quantity, order.sales, order.profit].join('\t'));
    try {
      await this.clipboard.writeText(['Order\tDate\tCustomer\tRegion\tChannel\tProduct\tCategory\tQuantity\tSales\tProfit', ...lines].join('\n'));
      this.snacks.openSnack(`Copied ${COUNT.format(orders.length)} orders to the clipboard`, 3000, 'success');
    } catch {
      // the clipboard service showed why in a snack of its own
    }
  }
  // #endregion
}
