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
  inject,
  Injector,
  input,
  model,
  output,
  PLATFORM_ID,
  signal,
  TemplateRef,
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

// A column in the layout panel: whether it shows, and its place
interface ColumnInfo<TData> {
  id: string;
  propertyName: string | undefined;
  template: TemplateRef<{ $implicit: HeaderContext<TData> }> | undefined;
  headerContext: HeaderContext<TData>;
  $isShowing: WritableSignal<boolean>;
  $order: WritableSignal<number>;
}

// What Save keeps in the viewer's browser, and Reset goes back to
interface LayoutState {
  striped: boolean;
  displayedColumns: string[];
  pinnedLeftColumn: string | undefined;
  pinnedRightColumn: string | undefined;
  sort: DataSort[];
}

const sameSort = (a: readonly DataSort[], b: readonly DataSort[]) => a.length === b.length && a.every((sort, index) => sort.property === b[index].property && sort.direction === b[index].direction);

const sameLayout = (a: LayoutState, b: LayoutState) =>
  a.striped === b.striped &&
  a.displayedColumns.join() === b.displayedColumns.join() &&
  a.pinnedLeftColumn === b.pinnedLeftColumn &&
  a.pinnedRightColumn === b.pinnedRightColumn &&
  sameSort(a.sort, b.sort);

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
  readonly drawerOpened = output<'filter' | 'layout'>();
  // #endregion

  // #region Drawer
  protected readonly $drawerOpen = signal(false);
  protected readonly $drawerMode = signal<'filter' | 'layout'>('filter');
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

  protected toggleDrawer(mode: 'filter' | 'layout') {
    if (this.$drawerOpen() && this.$drawerMode() === mode) {
      this.$drawerOpen.set(false);
      return;
    }
    this.$drawerMode.set(mode);
    this.$drawerOpen.set(true);
    this.drawerOpened.emit(mode);
  }

  protected searchInput(event: Event) {
    this.$search.set((event.target as HTMLInputElement).value);
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
    return {
      striped: table.$striped(),
      displayedColumns: table.$displayedColumns() ?? table.$columnDefs().map(column => column.$id()),
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

  // Never on the server; a browser that blocks storage, or a value that isn't a layout, leaves the default
  private readSavedLayout(defaults: LayoutState): LayoutState | undefined {
    if (!this.isBrowser) {
      return undefined;
    }
    try {
      const saved = localStorage.getItem(this.$storageKey());
      return saved === null ? undefined : { ...defaults, ...(JSON.parse(saved) as Partial<LayoutState>) };
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

  // Back to the saved layout, or the default when none is saved
  protected resetLayout() {
    const table = this.$table();
    const layout = this.$savedLayout() ?? this.$defaultLayout()!;
    const columns = table.$columnDefs();
    const ids = columns.map(column => column.$id());
    const shown = layout.displayedColumns.filter(id => ids.includes(id));
    table.$striped.set(layout.striped);
    this.$columns.set(
      columns.map((column, index) => {
        const place = shown.indexOf(column.$id());
        // hidden columns go after the shown ones, in the order the table has them
        const order = place === -1 ? shown.length + index : place;
        return {
          id: column.$id(),
          propertyName: column.$propertyName(),
          template: column.$header()?.templateRef,
          headerContext: column.buildHeaderContext(order, order === 0, order === shown.length - 1, order % 2 === 0, order % 2 === 1, shown.length),
          $isShowing: signal(place !== -1),
          $order: signal(order),
        };
      }),
    );
    table.$pinnedLeftColumn.set(layout.pinnedLeftColumn);
    table.$pinnedRightColumn.set(layout.pinnedRightColumn);
    if (!sameSort(table.$sort(), layout.sort)) {
      table.$sort.set(layout.sort);
    }
  }

  protected columnDropped(event: CdkDragDrop<unknown>) {
    this.moveColumn(event.previousIndex, event.currentIndex);
  }

  // The up and down arrows on a column's handle move it, and the handle keeps the focus
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
    this.$moved.set(`Moved to place ${to + 1} of ${this.$columns().length}`);
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
