import { afterNextRender, computed, DestroyRef, Directive, ElementRef, inject, input, signal } from '@angular/core';

/**
 * A column header's resizer, as the WAI-ARIA window splitter pattern has it: a focusable vertical `separator` whose
 * value is the column's width in pixels. The table names it, through `aria-labelledby`, "Resize" and the header's text.
 *
 * - Right and Left widen and narrow the column by 10px, 50px with Shift; Home takes it to its minimum width, End to its
 *   maximum, or without one to the wider of the table's visible width and the column's own. Keys with Alt, Ctrl or Meta
 *   pass through.
 * - A mouse, a finger or a pen drags it: pointer events, with the pointer captured, so the drag follows a pointer that
 *   leaves the resizer, and `touch-action: none` in the table's styles, so a touch drags instead of scrolling.
 * - Its value, bounds and words are measured in the browser only, after the first render and whenever the column or the
 *   table changes size; the server renders its role and name.
 */
@Directive({
  selector: '[resizerFor]',
  standalone: false,
  host: {
    role: 'separator',
    tabindex: '0',
    'aria-orientation': 'vertical',
    '[attr.aria-valuenow]': '$now()',
    '[attr.aria-valuemin]': '$min()',
    '[attr.aria-valuemax]': '$max()',
    '[attr.aria-valuetext]': '$valueText()',
    '(pointerdown)': 'onPointerDown($event)',
    '(keydown)': 'onKeyDown($event)',
  },
})
export class ResizerDirective {
  readonly $columnElement = input.required<HTMLElement>({
    alias: 'resizerFor',
  });
  readonly $enabled = input<boolean>(true, {
    alias: 'enabled',
  });
  private readonly resizerElement = inject<ElementRef<HTMLElement>>(ElementRef);

  // the column's width and the bounds the keys keep it in, whole pixels, once measured
  protected readonly $now = signal<number | undefined>(undefined);
  protected readonly $min = signal<number | undefined>(undefined);
  protected readonly $max = signal<number | undefined>(undefined);
  protected readonly $valueText = computed(() => {
    const now = this.$now();
    return now === undefined ? undefined : `${now} pixels`;
  });

  private dragging: Dragging | undefined;
  private observer: ResizeObserver | undefined;

  constructor() {
    // in the browser only: the server has no layout to measure
    afterNextRender(() => {
      const column = this.$columnElement();
      this.observer = new ResizeObserver(() => {
        this.measure();
      });
      this.observer.observe(column);
      // the table's visible width is the maximum of a column without one
      const table = column.closest('tab-table');
      if (table) {
        this.observer.observe(table);
      }
      this.measure();
    });
    inject(DestroyRef).onDestroy(() => {
      this.observer?.disconnect();
      this.observer = undefined;
      this.stopDragging();
    });
  }

  protected onKeyDown(e: KeyboardEvent) {
    if (!this.$enabled() || e.altKey || e.ctrlKey || e.metaKey) {
      return;
    }
    const step = e.shiftKey ? 50 : 10;
    let to: (width: ColumnWidth) => number;
    switch (e.key) {
      case 'ArrowRight':
        to = width => width.now + step;
        break;
      case 'ArrowLeft':
        to = width => width.now - step;
        break;
      case 'Home':
        to = width => width.min;
        break;
      case 'End':
        to = width => width.max;
        break;
      default:
        return;
    }
    // cancelled at the bounds too, so the table under it doesn't scroll
    e.preventDefault();
    const width = this.measure();
    if (width !== undefined) {
      this.resize(Math.min(Math.max(to(width), width.min), width.max));
      this.measure();
    }
  }

  // The press focuses the resizer, as a native control's does, with no focus ring for the pointer's focus
  protected onPointerDown(e: PointerEvent) {
    if (this.dragging !== undefined || !this.$enabled() || e.button !== 0) {
      return;
    }
    const resizer = this.resizerElement.nativeElement;
    this.dragging = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startWidth: parseFloat(getComputedStyle(this.$columnElement()).width),
    };
    try {
      // the pointer's moves come here wherever it goes, until it is up or cancelled
      resizer.setPointerCapture(e.pointerId);
    } catch {
      // a pointer the browser doesn't track, as a synthetic event's, can't be captured: the drag follows the events
      // sent to the resizer
    }
    resizer.addEventListener('pointermove', this.onPointerMove);
    for (const type of DRAG_ENDS) {
      resizer.addEventListener(type, this.onDragEnd);
    }
    resizer.classList.add('dragging');
    document.body.style.userSelect = 'none';
  }

  private readonly onPointerMove = (e: PointerEvent) => {
    const dragging = this.dragging;
    if (dragging?.pointerId === e.pointerId) {
      this.resize(Math.max(0, dragging.startWidth + e.clientX - dragging.startX));
    }
  };

  // up, cancelled, or the capture lost: the drag ends where the column is
  private readonly onDragEnd = (e: PointerEvent) => {
    if (this.dragging?.pointerId === e.pointerId) {
      this.stopDragging();
    }
  };

  private stopDragging() {
    if (this.dragging === undefined) {
      return;
    }
    this.dragging = undefined;
    const resizer = this.resizerElement.nativeElement;
    resizer.removeEventListener('pointermove', this.onPointerMove);
    for (const type of DRAG_ENDS) {
      resizer.removeEventListener(type, this.onDragEnd);
    }
    resizer.classList.remove('dragging');
    document.body.style.userSelect = '';
  }

  // The column's width, no longer growing to fill the table, nor shrinking where the columns overflow it, so the width it
  // shows is the one set; its min and max widths still bound it
  private resize(width: number) {
    const column = this.$columnElement();
    column.style.width = `${width}px`;
    column.style.flexGrow = 'unset';
    column.style.flexShrink = '0';
  }

  // Reads the column's width and its bounds, and shows them; none while the column isn't laid out, as in a hidden tab,
  // which keeps the last ones shown
  private measure(): ColumnWidth | undefined {
    const column = this.$columnElement();
    const style = getComputedStyle(column);
    const now = Math.round(parseFloat(style.width));
    if (Number.isNaN(now)) {
      return undefined;
    }
    // a percentage is of the header row's width, the column's containing block
    const basis = column.parentElement?.clientWidth ?? 0;
    const min = Math.min(Math.round(pixels(style.minWidth, basis) ?? 0), now);
    const visible = column.closest('tab-table')?.clientWidth ?? 0;
    const max = Math.max(Math.round(pixels(style.maxWidth, basis) ?? visible), now);
    this.$now.set(now);
    this.$min.set(min);
    this.$max.set(max);
    return { now, min, max };
  }
}

// What ends a drag: the pointer up, cancelled, or no longer captured
const DRAG_ENDS = ['pointerup', 'pointercancel', 'lostpointercapture'] as const;

// A computed min or max width in pixels: a length, or a percentage of the basis; none for `none`, `auto`, or a calc()
// that holds a percentage, which the browser leaves unresolved
function pixels(value: string, basis: number): number | undefined {
  if (/^[\d.]+px$/.test(value)) {
    return parseFloat(value);
  }
  if (/^[\d.]+%$/.test(value)) {
    return (parseFloat(value) / 100) * basis;
  }
  return undefined;
}

interface ColumnWidth {
  now: number;
  min: number;
  max: number;
}

interface Dragging {
  pointerId: number;
  startX: number;
  startWidth: number;
}
