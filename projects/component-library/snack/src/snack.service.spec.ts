import type { OnDestroy } from '@angular/core';
import { ApplicationRef, ChangeDetectionStrategy, Component, inject, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axeViolations } from '../../testing/axe';
import { movePointerAway } from '../../testing/pointer';
import { SnackService } from './snack.service';
import { TableauUiSnackModule } from './tableau-ui-snack.module';

const destroyed: string[] = [];

@Component({
  selector: 'tab-test-snack-content',
  template: 'Saved',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class SnackContentComponent implements OnDestroy {
  ngOnDestroy() {
    destroyed.push('SnackContentComponent');
  }
}

// A page that imports the snack module
@Component({
  imports: [TableauUiSnackModule],
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class SnackPageComponent {
  readonly snacks = inject(SnackService);
}

const wait = async (ms: number) =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

describe('SnackService', () => {
  beforeEach(async () => {
    // no router: a snack's action needs none
    TestBed.configureTestingModule({ imports: [TableauUiSnackModule] });
    destroyed.length = 0;
    await movePointerAway();
  });

  afterEach(() => {
    document.querySelectorAll('.tab-snacks').forEach(element => element.remove());
    vi.unstubAllGlobals();
  });

  const open = (message: string, duration: number, type: 'error' | 'info' | 'success' = 'info') => {
    const ref = TestBed.inject(SnackService).openSnack(message, duration, type);
    TestBed.inject(ApplicationRef).tick();
    return ref;
  };

  // F71: no live region and no role, so a screen reader never announced a snack, an error included
  it('announces a snack through a live region, assertive for an error', async () => {
    open('Saved', 0);
    const status = document.querySelector<HTMLElement>('.tab-snacks [role="status"]')!;
    expect(status.getAttribute('aria-live')).toBe('polite');
    // in the page, empty, before its text arrives: a region added with its text is not announced
    expect(status.textContent.trim()).toBe('');
    await vi.waitFor(() => {
      expect(status.textContent).toContain('Saved');
    });

    open('Not saved', 0, 'error');
    const alert = document.querySelector<HTMLElement>('.tab-snacks [role="alert"]')!;
    expect(alert.getAttribute('aria-live')).toBe('assertive');
    expect(alert.textContent.trim()).toBe('');
    await vi.waitFor(() => {
      expect(alert.textContent).toContain('Not saved');
    });
    expect(await axeViolations(document.querySelector('.tab-snacks')!)).toEqual([]);
  });

  // F66: a closed snack's view was detached but never destroyed, so its component's ngOnDestroy never ran
  it('destroys a snack when it closes', async () => {
    const appRef = TestBed.inject(ApplicationRef);
    const before = appRef.viewCount;
    const ref = TestBed.inject(SnackService).openSnackComponent(SnackContentComponent, undefined, 0);
    appRef.tick();
    expect(appRef.viewCount).toBe(before + 1);

    ref.close();

    await vi.waitFor(() => {
      expect(destroyed).toEqual(['SnackContentComponent']);
    });
    expect(appRef.viewCount).toBe(before);
    expect(document.querySelector('.snack-wrapper')).toBeNull();
  });

  // F80: the action was a link with [routerLink]="[]", which also navigated, dropping the query, and threw without a
  // router; the close control was a focusable icon, not a button
  it('runs its action and closes from buttons, without a router', async () => {
    const action = vi.fn();
    const ref = TestBed.inject(SnackService).openSnackWithAction('Deleted', 'Undo', action, 0);
    TestBed.inject(ApplicationRef).tick();
    const closed = vi.fn();
    ref.closed$.subscribe(closed);

    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.tab-snacks button'));
    expect(buttons.map(button => button.type)).toEqual(['button', 'button']);
    const [undo, close] = buttons;
    expect(undo.textContent.trim()).toBe('Undo');
    expect(close.querySelector('tab-icon')?.getAttribute('aria-label')).toBe('Close');
    expect(document.querySelector('.tab-snacks a')).toBeNull();
    expect(await axeViolations(document.querySelector('.tab-snacks')!)).toEqual([]);

    undo.click();
    expect(action).toHaveBeenCalledWith(ref);
    close.click();
    expect(closed).toHaveBeenCalledWith(true);
  });

  // F90: a snack closed after its time with no pause, so a user still reading it, or on its buttons, lost it
  it('waits while the pointer or focus is on it', async () => {
    const hovered = open('Saved', 300);
    const hoveredClosed = vi.fn();
    hovered.closed$.subscribe(hoveredClosed);
    const wrapper = document.querySelector<HTMLElement>('.snack-wrapper')!;
    // the pointer's own events, at once: a real hover waits for the snack to stop sliding in, which takes longer
    wrapper.dispatchEvent(new MouseEvent('mouseenter'));
    await wait(600);
    expect(hoveredClosed).not.toHaveBeenCalled();
    wrapper.dispatchEvent(new MouseEvent('mouseleave'));
    await vi.waitFor(() => {
      expect(hoveredClosed).toHaveBeenCalled();
    });

    const focused = open('Saved again', 300);
    const focusedClosed = vi.fn();
    focused.closed$.subscribe(focusedClosed);
    const close = Array.from(document.querySelectorAll<HTMLButtonElement>('.snack-wrapper button')).at(-1)!;
    close.focus();
    await wait(600);
    expect(focusedClosed).not.toHaveBeenCalled();
    close.blur();
    await vi.waitFor(() => {
      expect(focusedClosed).toHaveBeenCalled();
    });
  });

  it('closes after its time', async () => {
    const ref = open('Saved', 100);
    const closed = vi.fn();
    ref.closed$.subscribe(closed);

    await vi.waitFor(() => {
      expect(closed).toHaveBeenCalledWith(undefined);
    });
    await vi.waitFor(() => {
      expect(document.querySelector('.snack-wrapper')).toBeNull();
    });
  });

  // The service was provided anew in each injector that asked for it ('any', which Angular 21 deprecates)
  it('is one service for the app, whatever imports its module', () => {
    const page = TestBed.createComponent(SnackPageComponent).componentInstance;

    expect(page.snacks).toBe(TestBed.inject(SnackService));
  });

  // The server has no one to tell, and a snack rendered there would stay in the page, since the browser renders the
  // app again; it threw there, so a page that opened one on load could not be prerendered
  it('shows nothing on the server', () => {
    const timers = vi.spyOn(globalThis, 'setTimeout');
    TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });

    const ref = TestBed.inject(SnackService).openSnack('Saved');

    expect(document.querySelector('.tab-snacks')).toBeNull();
    // the snack's own timers all wait; Angular's scheduler may set one with none
    expect(timers.mock.calls.filter(([, ms]) => (ms ?? 0) > 0)).toEqual([]);
    const closed = vi.fn();
    ref.closed$.subscribe(closed);
    ref.close();
    expect(closed).toHaveBeenCalled();
    timers.mockRestore();
  });
});
