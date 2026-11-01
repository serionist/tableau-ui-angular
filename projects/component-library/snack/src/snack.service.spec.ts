import type { OnDestroy } from '@angular/core';
import { ApplicationRef, ChangeDetectionStrategy, Component, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { userEvent } from 'vitest/browser';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { DialogService } from 'tableau-ui-angular/dialog';
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

// A component snack with the library's own button
@Component({
  selector: 'tab-test-retry-snack',
  imports: [TableauUiButtonModule],
  template: `Not sent <button color="primary">Retry</button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class RetrySnackComponent {}

// A modal's content that fills it
@Component({
  selector: 'tab-test-modal-content',
  template: 'Content',
  styles: `
    :host {
      display: block;
      flex: 1;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ModalContentComponent {}

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
  // what the library's stylesheets (styles/_dialog.service.scss, _snack.service.scss) give a modal and the snacks, which
  // a test doesn't load
  const stylesheet = document.createElement('style');
  stylesheet.textContent = `
    .dialog-container { position: fixed; }
    .tab-snacks { position: fixed; top: 0; left: 0; right: 0; z-index: 2000; display: flex; justify-content: center; }
  `;

  beforeEach(async () => {
    // no router: a snack's action needs none
    TestBed.configureTestingModule({ imports: [TableauUiSnackModule] });
    destroyed.length = 0;
    await movePointerAway();
  });

  afterEach(() => {
    stylesheet.remove();
    document.querySelectorAll('.tab-snacks, .dialog-container, .dialog-backdrop').forEach(element => element.remove());
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

  // The action's reset set only the font's family, so Undo showed in the browser's small button size; and the reset
  // reached every button in a snack, an app's own in a template or component snack included
  it("draws its action in the snack's text, and leaves an app's buttons alone", async () => {
    TestBed.inject(SnackService).openSnackWithAction('Deleted', 'Undo', () => undefined, 0);
    TestBed.inject(SnackService).openSnackComponent(RetrySnackComponent, undefined, 0);
    TestBed.inject(ApplicationRef).tick();

    const undo = document.querySelector<HTMLButtonElement>('.tab-snacks .action')!;
    const text = undo.closest<HTMLElement>('.text')!;
    expect(getComputedStyle(undo).fontSize).toBe(getComputedStyle(text).fontSize);
    expect(getComputedStyle(undo).borderTopStyle).toBe('none');
    const retry = document.querySelector<HTMLButtonElement>('tab-test-retry-snack button')!;
    expect(getComputedStyle(retry).borderTopStyle).toBe('solid');
    expect(getComputedStyle(retry).borderTopWidth).toBe('1px');
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
    // the snack moved into its live region meanwhile, and focus came back with it
    expect(document.activeElement).toBe(close);
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

  // A modal shown in the top layer (#58) covers what sits outside it and makes it inert, so a snack shown over a modal
  // goes into it
  it('sits in a modal open before it, above its content, where it takes clicks, and goes back to the body when the modal closes', async () => {
    document.head.appendChild(stylesheet);
    const dialogs = TestBed.inject(DialogService);
    const modal = dialogs.openModal(ModalContentComponent, undefined, { width: '100vw', maxWidth: 'none', height: '100vh', maxHeight: 'none' });
    const container = dialogs.$overlayHost()!;
    const content = container.querySelector<HTMLElement>('tab-test-modal-content')!;
    const action = vi.fn();
    const ref = TestBed.inject(SnackService).openSnackWithAction('Deleted', 'Undo', action, 0);
    TestBed.inject(ApplicationRef).tick();

    const stack = document.querySelector<HTMLElement>('.tab-snacks')!;
    expect(stack.parentElement).toBe(container);
    const undo = stack.querySelector<HTMLButtonElement>('.action')!;
    // the button's centre is over the modal's content, and a click there reaches the button, once the snack has slid in
    await vi.waitFor(() => {
      const box = undo.getBoundingClientRect();
      const [x, y] = [box.left + box.width / 2, box.top + box.height / 2];
      const over = content.getBoundingClientRect();
      expect(x > over.left && x < over.right && y > over.top && y < over.bottom).toBe(true);
      expect(undo.contains(document.elementFromPoint(x, y))).toBe(true);
    });
    expect(await axeViolations(container)).toEqual([]);
    await userEvent.click(undo);
    expect(action).toHaveBeenCalledWith(ref);

    modal.close();
    expect(stack.parentElement).toBe(document.body);
    expect(stack.querySelector('.snack-wrapper')?.textContent).toContain('Deleted');
    ref.close();
  });

  it('moves a showing snack into a modal that opens, into the modal above it, and back as each closes', async () => {
    document.head.appendChild(stylesheet);
    const dialogs = TestBed.inject(DialogService);
    const ref = open('Saved', 0);
    const stack = document.querySelector<HTMLElement>('.tab-snacks')!;
    expect(stack.parentElement).toBe(document.body);

    const below = dialogs.openModal(ModalContentComponent, undefined);
    TestBed.tick();
    const belowContainer = dialogs.$overlayHost()!;
    expect(stack.parentElement).toBe(belowContainer);
    const top = dialogs.openModal(ModalContentComponent, undefined);
    TestBed.tick();
    expect(stack.parentElement).toBe(dialogs.$overlayHost());
    expect(stack.parentElement).not.toBe(belowContainer);

    top.close();
    expect(stack.parentElement).toBe(belowContainer);
    below.close();
    expect(stack.parentElement).toBe(document.body);
    TestBed.tick();
    expect(stack.parentElement).toBe(document.body);
    expect(document.querySelectorAll('.tab-snacks').length).toBe(1);
    ref.close();
  });

  // The modal took the snack with it as it closed, so the focus it gave back had nowhere to go
  it("gives the focus back to a snack's button when the modal its action opened closes", async () => {
    document.head.appendChild(stylesheet);
    const dialogs = TestBed.inject(DialogService);
    const ref = TestBed.inject(SnackService).openSnackWithAction(
      'Not sent',
      'Details',
      () => {
        dialogs.openModal(ModalContentComponent, undefined);
      },
      0,
    );
    TestBed.inject(ApplicationRef).tick();
    // once the snack has moved into its live region
    const details = await vi.waitFor(() => {
      const button = document.querySelector<HTMLButtonElement>('.snack-live .action');
      expect(button).not.toBeNull();
      return button!;
    });
    details.focus();

    await userEvent.keyboard('{Enter}');
    expect(dialogs.dialogStack.length).toBe(1);
    TestBed.tick();
    expect(details.closest('.dialog-container')).toBe(dialogs.$overlayHost());

    await userEvent.keyboard('{Escape}');
    expect(dialogs.dialogStack).toEqual([]);
    expect(document.activeElement).toBe(details);
    ref.close();
  });

  // An app's effect that opens a snack would have followed the modals too, and opened it again at each
  it("opens a snack from an app's effect once, whatever modals open and close after", () => {
    const dialogs = TestBed.inject(DialogService);
    const snacks = TestBed.inject(SnackService);
    const $message = signal('Saved');
    let runs = 0;
    TestBed.runInInjectionContext(() =>
      effect(() => {
        runs++;
        snacks.openSnack($message(), 0);
      }),
    );
    TestBed.tick();
    expect(runs).toBe(1);

    const modal = dialogs.openModal(ModalContentComponent, undefined);
    TestBed.tick();
    modal.close();
    TestBed.tick();

    expect(runs).toBe(1);
    expect(document.querySelectorAll('.snack-wrapper').length).toBe(1);
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
