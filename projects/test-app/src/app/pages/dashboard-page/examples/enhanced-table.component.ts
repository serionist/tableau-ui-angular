import type { CdkDragDrop } from '@angular/cdk/drag-drop';
import { DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import type { AfterContentInit, WritableSignal } from '@angular/core';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  HostListener,
  inject,
  Injector,
  input,
  model,
  output,
  PLATFORM_ID,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiCheckboxModule } from 'tableau-ui-angular/checkbox';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { DialogService } from 'tableau-ui-angular/dialog';
import { TableauUiDrawerModule } from 'tableau-ui-angular/drawer';
import { TableauUiFormFieldModule } from 'tableau-ui-angular/form-field';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
import { ButtonMenuDirective, TableauUiMenuModule } from 'tableau-ui-angular/menu';
import { TableauUiMenuButtonModule } from 'tableau-ui-angular/menu-button';
import type { HeaderContext } from 'tableau-ui-angular/table';
import { TableauUiTableModule, TableComponent } from 'tableau-ui-angular/table';
import { TableauUiTooltipModule } from 'tableau-ui-angular/tooltip';
import type { DataSort } from 'tableau-ui-angular/virtualize';

/** Content for the header row, left of the selection button */
@Directive({ selector: 'ng-template[headerBeforeSelect]' })
export class HeaderBeforeSelectDirective {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}

/** Content for the header row, right of the selection button */
@Directive({ selector: 'ng-template[headerAfterSelect]' })
export class HeaderAfterSelectDirective {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}

/** The filters, which the Filters button shows in the drawer */
@Directive({ selector: 'ng-template[filterPanel]' })
export class FilterPanelDirective {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}

/** The menu of the selection button, on a `buttonMenu` template: its items act on the selected rows */
@Directive({ selector: 'ng-template[buttonMenu][selectMenuButtons]' })
export class SelectMenuButtonsDirective {
  readonly menu = inject(ButtonMenuDirective);
}

type Panel = 'filter' | 'layout';

// A column in the layout panel: whether it shows, and its place
interface ColumnInfo<TData> {
  id: string;
  propertyName: string | undefined;
  template: TemplateRef<{ $implicit: HeaderContext<TData> }> | undefined;
  headerContext: HeaderContext<TData>;
  $isShowing: WritableSignal<boolean>;
  $order: WritableSignal<number>;
}

// What Save keeps in the viewer's browser, and Reset goes back to: every column in its order, and the hidden ones,
// so a column the table gains later shows, at the end
interface LayoutState {
  striped: boolean;
  order: string[];
  hidden: string[];
  pinnedLeftColumn: string | undefined;
  pinnedRightColumn: string | undefined;
  sort: DataSort[];
}

const sameSort = (a: readonly DataSort[], b: readonly DataSort[]) => a.length === b.length && a.every((sort, index) => sort.property === b[index].property && sort.direction === b[index].direction);

const sameLayout = (a: LayoutState, b: LayoutState) =>
  a.striped === b.striped &&
  a.order.join() === b.order.join() &&
  [...a.hidden].sort().join() === [...b.hidden].sort().join() &&
  a.pinnedLeftColumn === b.pinnedLeftColumn &&
  a.pinnedRightColumn === b.pinnedRightColumn &&
  sameSort(a.sort, b.sort);

// A saved layout, its fields checked one by one: a field that is missing or of the wrong type takes the default's
function readLayout(text: string, defaults: LayoutState): LayoutState | undefined {
  const value: unknown = JSON.parse(text);
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return undefined;
  }
  const saved = value as Record<string, unknown>;
  const ids = (field: unknown) => (Array.isArray(field) && field.every(item => typeof item === 'string') ? field : undefined);
  const column = (field: unknown) => (typeof field === 'string' ? field : undefined);
  const sorts = (field: unknown) =>
    Array.isArray(field) &&
    field.every(
      (sort: unknown) =>
        typeof sort === 'object' && sort !== null && typeof (sort as DataSort).property === 'string' && ((sort as DataSort).direction === 'asc' || (sort as DataSort).direction === 'desc'),
    )
      ? (field as DataSort[])
      : undefined;
  return {
    striped: typeof saved['striped'] === 'boolean' ? saved['striped'] : defaults.striped,
    order: ids(saved['order']) ?? defaults.order,
    hidden: ids(saved['hidden']) ?? defaults.hidden,
    pinnedLeftColumn: column(saved['pinnedLeftColumn']),
    pinnedRightColumn: column(saved['pinnedRightColumn']),
    sort: sorts(saved['sort']) ?? defaults.sort,
  };
}

let instances = 0;

/**
 * A table's frame: a header row with a selection button, a search, Filters and Layout & Sorting, and a drawer for
 * the filters or the layout. The content holds the table; it may hold more, as the dashboard's does.
 */
@Component({
  selector: 'app-enhanced-table',
  imports: [
    DragDropModule,
    NgTemplateOutlet,
    TableauUiButtonModule,
    TableauUiCheckboxModule,
    TableauUiCommonModule,
    TableauUiDrawerModule,
    TableauUiFormFieldModule,
    TableauUiIconModule,
    TableauUiMenuModule,
    TableauUiMenuButtonModule,
    TableauUiTableModule,
    TableauUiTooltipModule,
  ],
  templateUrl: './enhanced-table.component.html',
  styleUrl: './enhanced-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnhancedTableComponent<TData> implements AfterContentInit {
  private readonly dialogs = inject(DialogService);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  // names the panel's labels apart from another table's
  protected readonly id = `enhanced-table-${++instances}`;

  // #region Content
  protected readonly $headerBeforeSelect = contentChild(HeaderBeforeSelectDirective);
  protected readonly $headerAfterSelect = contentChild(HeaderAfterSelectDirective);
  protected readonly $selectMenuButtons = contentChild(SelectMenuButtonsDirective);
  protected readonly $filterPanel = contentChild(FilterPanelDirective);
  protected readonly $table = contentChild.required<TableComponent<TData>>(TableComponent);
  private readonly filterToggle = viewChild.required<unknown, ElementRef<HTMLElement>>('filterToggle', { read: ElementRef });
  private readonly layoutToggle = viewChild.required<unknown, ElementRef<HTMLElement>>('layoutToggle', { read: ElementRef });
  private readonly panelHeading = viewChild<ElementRef<HTMLElement>>('panelHeading');
  private readonly searchField = viewChild<ElementRef<HTMLInputElement>>('searchField');
  // #endregion

  // #region Inputs and outputs
  /** Names the layout the viewer saves, in their browser's storage */
  readonly $uniqueId = input.required<string>({ alias: 'uniqueId' });
  /** The selection button's text, such as "2 orders selected"; the button shows while rows are selected */
  readonly $selectionButtonText = input('', { alias: 'selectionButtonText' });
  /** The search field's name; without one, the header has no search */
  readonly $searchLabel = input<string | undefined>(undefined, { alias: 'searchLabel' });
  /** The search's text */
  readonly $search = model('', { alias: 'search' });
  /** How many filters are in use, which the Filters button shows; Clear all filters needs one */
  readonly $activeFilters = input(0, { alias: 'activeFilters' });
  /** The drawer's width beside the content; a narrow table's drawer covers it */
  readonly $drawerWidth = input('20rem', { alias: 'drawerWidth' });

  /** Clear all filters was clicked */
  readonly clearFilters = output();
  /** The drawer opened on this panel */
  readonly drawerOpened = output<Panel>();
  // #endregion

  // #region Drawer
  protected readonly $drawerOpen = signal(false);
  protected readonly $drawerMode = signal<Panel>('filter');
  // Whether the drawer fits beside the content; on the server, which lays nothing out, it doesn't
  protected readonly $wide = signal(false);

  constructor() {
    // In the browser, once drawn, and each time the width changes
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const observer = new ResizeObserver(() => {
        this.$wide.set(this.host.clientWidth >= 48 * parseFloat(getComputedStyle(this.host).fontSize));
      });
      observer.observe(this.host);
      destroyRef.onDestroy(() => {
        observer.disconnect();
      });
    });
  }

  // The drawer comes after the content, which can hold thousands of rows, so focus goes to the panel once it shows
  protected toggleDrawer(mode: Panel) {
    if (this.$drawerOpen() && this.$drawerMode() === mode) {
      this.closeDrawer();
      return;
    }
    this.$drawerMode.set(mode);
    this.$drawerOpen.set(true);
    this.drawerOpened.emit(mode);
    afterNextRender(
      () => {
        this.panelHeading()?.nativeElement.focus();
      },
      { injector: this.injector },
    );
  }

  /** Closes the drawer, and focus goes back to the button that opens its panel */
  closeDrawer() {
    this.$drawerOpen.set(false);
    this.focusToggle(this.$drawerMode());
  }

  // Escape in the panel closes it, unless a select's options or a menu over it are open: Escape closes those first
  @HostListener('keydown.escape', ['$event'])
  protected escape(event: Event) {
    if (this.dialogs.dialogStack.some(entry => entry.args.closeOnEscape === true)) {
      return;
    }
    if (this.$drawerOpen() && event.target instanceof Node && this.host.querySelector('.panel')?.contains(event.target) === true) {
      this.closeDrawer();
    }
  }

  /** Focuses the button that opens the filters or the layout */
  focusToggle(panel: Panel) {
    (panel === 'filter' ? this.filterToggle() : this.layoutToggle()).nativeElement.focus();
  }

  protected searchInput(event: Event) {
    this.$search.set((event.target as HTMLInputElement).value);
  }

  // The clear button goes with the text, so focus goes back to the search
  protected clearSearch() {
    this.$search.set('');
    this.searchField()?.nativeElement.focus();
  }
  // #endregion

  // #region Layout & Sorting
  private readonly $storageKey = computed(() => `enhanced-table-layout-${this.$uniqueId()}`);
  private readonly $defaultLayout = signal<LayoutState | undefined>(undefined);
  protected readonly $savedLayout = signal<LayoutState | undefined>(undefined);
  protected readonly $columns = signal<ColumnInfo<TData>[]>([]);
  protected readonly $orderedColumns = computed(() => [...this.$columns()].sort((a, b) => a.$order() - b.$order()));
  // What a screen reader says once a key moves a column
  protected readonly $moved = signal('');

  private currentLayout(): LayoutState {
    const table = this.$table();
    const all = table.$columnDefs().map(column => column.$id());
    const shown = table.$displayedColumns() ?? all;
    const columns = this.$orderedColumns();
    return {
      striped: table.$striped(),
      order: columns.length > 0 ? columns.map(column => column.id) : [...shown, ...all.filter(id => !shown.includes(id))],
      hidden: columns.length > 0 ? columns.filter(column => !column.$isShowing()).map(column => column.id) : all.filter(id => !shown.includes(id)),
      pinnedLeftColumn: table.$pinnedLeftColumn(),
      pinnedRightColumn: table.$pinnedRightColumn(),
      sort: table.$sort(),
    };
  }

  // The layout the table starts with is the default; the viewer's saved one, when the browser has it, replaces it
  ngAfterContentInit(): void {
    const layout = this.currentLayout();
    this.$defaultLayout.set(layout);
    this.$savedLayout.set(this.readSavedLayout(layout));
    this.resetLayout();
  }

  // The table shows the columns marked to show, in their order
  private readonly showColumns = effect(() => {
    const columns = this.$orderedColumns().filter(column => column.$isShowing());
    if (this.$columns().length > 0) {
      this.$table().$displayedColumns.set(columns.map(column => column.id));
    }
  });

  protected readonly $layoutChanged = computed(() => {
    const layout = this.$savedLayout() ?? this.$defaultLayout();
    return layout !== undefined && !sameLayout(layout, this.currentLayout());
  });

  // Never on the server. A browser that blocks storage, text that isn't a layout, or a layout that would hide every
  // column leaves the default
  private readSavedLayout(defaults: LayoutState): LayoutState | undefined {
    if (!this.isBrowser) {
      return undefined;
    }
    try {
      const saved = localStorage.getItem(this.$storageKey());
      const layout = saved === null ? undefined : readLayout(saved, defaults);
      return layout !== undefined && defaults.order.some(id => !layout.hidden.includes(id)) ? layout : undefined;
    } catch {
      return undefined;
    }
  }

  // A browser that blocks storage keeps the layout for this visit only
  protected saveLayout() {
    const layout = this.currentLayout();
    try {
      localStorage.setItem(this.$storageKey(), JSON.stringify(layout));
    } catch {
      // the saved layout lasts until the page closes
    }
    this.$savedLayout.set(layout);
  }

  protected async resetToDefault() {
    const confirmed = await this.dialogs.openConfirmationMessageDialog('Reset to the default layout', 'This clears the layout and sort you saved.', 'error', 'Reset', 'Cancel', 'cancel');
    if (!confirmed) {
      return;
    }
    try {
      localStorage.removeItem(this.$storageKey());
    } catch {
      // nothing was saved
    }
    this.$savedLayout.set(undefined);
    this.resetLayout();
  }

  // Back to the saved layout, or the default when none is saved. Columns it doesn't know go at the end, shown; a pin or
  // a sort on a column the table no longer has is dropped, and the default sort holds when none of the sort is left
  protected resetLayout() {
    const table = this.$table();
    const defaults = this.$defaultLayout()!;
    const layout = this.$savedLayout() ?? defaults;
    const columns = table.$columnDefs();
    const ids = columns.map(column => column.$id());
    const order = [...layout.order.filter(id => ids.includes(id)), ...ids.filter(id => !layout.order.includes(id))];
    const shown = order.filter(id => !layout.hidden.includes(id));
    const properties = columns.map(column => column.$propertyName() ?? column.$id());
    const known = layout.sort.filter(item => properties.includes(item.property));
    const sort = known.length === 0 && layout.sort.length > 0 ? defaults.sort : known;
    table.$striped.set(layout.striped);
    this.$columns.set(
      columns.map(column => {
        const index = order.indexOf(column.$id());
        return {
          id: column.$id(),
          propertyName: column.$propertyName(),
          template: column.$header()?.templateRef,
          headerContext: column.buildHeaderContext(index, index === 0, index === order.length - 1, index % 2 === 0, index % 2 === 1, order.length),
          $isShowing: signal(shown.includes(column.$id())),
          $order: signal(index),
        };
      }),
    );
    table.$pinnedLeftColumn.set(layout.pinnedLeftColumn !== undefined && ids.includes(layout.pinnedLeftColumn) ? layout.pinnedLeftColumn : undefined);
    table.$pinnedRightColumn.set(layout.pinnedRightColumn !== undefined && ids.includes(layout.pinnedRightColumn) ? layout.pinnedRightColumn : undefined);
    if (!sameSort(table.$sort(), sort)) {
      table.$sort.set(sort);
    }
  }

  protected columnDropped(event: CdkDragDrop<unknown>) {
    this.moveColumn(event.previousIndex, event.currentIndex);
  }

  // The up and down arrows on a column's handle move it, and the handle keeps the focus; the announcement names the
  // column, so two moves to the same place say different things
  protected moveByKey(event: KeyboardEvent, index: number) {
    const to = event.key === 'ArrowUp' ? index - 1 : event.key === 'ArrowDown' ? index + 1 : index;
    if (to === index) {
      return;
    }
    event.preventDefault();
    const column = this.$orderedColumns()[index];
    if (!this.moveColumn(index, to)) {
      return;
    }
    const name = this.host.querySelector(`[id="${this.id}-${column.id}"]`)?.textContent.trim() ?? column.id;
    this.$moved.set(`${name} moved to place ${to + 1} of ${this.$columns().length}`);
    afterNextRender(
      () => {
        this.host.querySelector<HTMLElement>(`[data-handle="${column.id}"]`)?.focus();
      },
      { injector: this.injector },
    );
  }

  private moveColumn(from: number, to: number) {
    const columns = [...this.$orderedColumns()];
    if (from === to || to < 0 || to >= columns.length) {
      return false;
    }
    moveItemInArray(columns, from, to);
    columns.forEach((column, index) => {
      column.$order.set(index);
    });
    return true;
  }

  protected togglePin(side: 'left' | 'right', id: string) {
    const pinned = side === 'left' ? this.$table().$pinnedLeftColumn : this.$table().$pinnedRightColumn;
    pinned.set(pinned() === id ? undefined : id);
  }
  // #endregion
}
