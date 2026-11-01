import type { TemplateRef } from '@angular/core';
import { ApplicationRef, ChangeDetectionStrategy, Component, inject, PLATFORM_ID, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { userEvent } from 'vitest/browser';
import { TableauUiTooltipModule } from 'tableau-ui-angular/tooltip';
import { axeViolations } from '../../testing/axe';
import { movePointerAway } from '../../testing/pointer';
import { injectDialogData } from './data.ref';
import type { DialogRef } from './dialog.ref';
import { DialogService } from './dialog.service';
import { LocalStackOptions } from './stack-options';
import { TableauUiDialogModule } from './tableau-ui-dialog.module';

@Component({
  selector: 'tab-test-dialog-content',
  template: 'Content',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DialogContentComponent {}

// A modal's content that fills it, with a button whose tooltip shows below it, over the content
@Component({
  selector: 'tab-test-help-content',
  imports: [TableauUiTooltipModule],
  template: `<button type="button" class="help" tooltip="Help" tooltipPosition="bottom">Help</button>`,
  styles: `
    :host {
      display: block;
      flex: 1;
      padding: 1rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HelpContentComponent {}

// An app's own dialog, with a button that calls its data
@Component({
  selector: 'tab-test-note',
  template: `<button type="button" (click)="clicked()">Note</button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class NoteComponent {
  protected readonly clicked = injectDialogData<() => void>();
}

// A template whose root element an @if renders, beside the template's own nodes
@Component({
  template: `
    <ng-template #shown>
      @if (true) {
        <p class="shown">Shown</p>
      }
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ShownComponent {
  readonly $shown = viewChild.required<TemplateRef<unknown>>('shown');
}

// A page that imports the dialog module, as every page with a select, a menu or a tooltip does
@Component({
  imports: [TableauUiDialogModule],
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DialogPageComponent {
  readonly dialogs = inject(DialogService);
}

@Component({
  imports: [TableauUiTooltipModule],
  template: `<button type="button" tooltip="Help">Help</button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TooltipPageComponent {
  readonly dialogs = inject(DialogService);
}

@Component({
  template: `<ng-template #question let-name="name">Delete {{ name }}?</ng-template>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class QuestionComponent {
  readonly $question = viewChild.required<TemplateRef<{ name: string }>>('question');
}

describe('DialogService', () => {
  // what the library's stylesheet (styles/_dialog.service.scss) gives every dialog, which a test doesn't load
  const stylesheet = document.createElement('style');
  stylesheet.textContent = '.dialog-container, .dialog-backdrop { position: fixed; }';

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [TableauUiDialogModule] });
    document.head.appendChild(stylesheet);
    await movePointerAway();
  });

  afterEach(() => {
    stylesheet.remove();
    // a dialog left open by a failed test would take the next one's Escape
    document.querySelectorAll('.dialog-container, .dialog-backdrop').forEach(element => element.remove());
    vi.unstubAllGlobals();
  });

  const placed = async () => {
    const container = document.querySelector<HTMLElement>('.dialog-container:last-of-type')!;
    await vi.waitFor(() => {
      expect(container.style.top).not.toBe('-9999px');
    });
    return container;
  };

  // F1: the title was set with innerHTML, so a title built from user data could run script. The header's close control
  // is a button named by its icon, not a focusable image
  it('shows a header title as text, with a close button', async () => {
    const title = '<img src=x onerror="alert(1)">';
    const dialogRef = TestBed.inject(DialogService).openModal(DialogContentComponent, undefined, {
      header: { title, allowClose: true },
    });

    const titleElement = document.querySelector('.dialog-title');
    expect(titleElement).not.toBeNull();
    expect(titleElement?.textContent).toBe(title);
    expect(titleElement?.querySelector('img')).toBeNull();
    TestBed.inject(ApplicationRef).tick();
    const close = document.querySelector<HTMLButtonElement>('.dialog-header button')!;
    expect(close.type).toBe('button');
    expect(close.querySelector('tab-icon')?.getAttribute('aria-label')).toBe('Close');
    expect(close.querySelector('[tabindex]')).toBeNull();
    expect(await axeViolations(document.querySelector('.dialog-container')!)).toEqual([]);

    const closed = vi.fn();
    dialogRef.closed$.subscribe(closed);
    close.click();
    expect(closed).toHaveBeenCalled();
  });

  // The modal opens off screen, is measured, then placed; waiting for it keeps the coverage the same on a slow machine
  it('places a modal on screen once it has measured it', async () => {
    const dialogRef = TestBed.inject(DialogService).openModal(DialogContentComponent, undefined, {
      header: { title: 'Placed', allowClose: true },
    });

    const container = await placed();
    expect(container.style.left).not.toBe('-9999px');

    dialogRef.close();
  });

  // F64: the header's close icon was a view attached to the application and never destroyed, so each dialog with a
  // header leaked one, with its DOM
  it('destroys every view it made when it closes', () => {
    const appRef = TestBed.inject(ApplicationRef);
    const before = appRef.viewCount;
    const dialogRef = TestBed.inject(DialogService).openModal(DialogContentComponent, undefined, {
      header: { title: 'Leak', allowClose: true },
    });
    appRef.tick();
    expect(appRef.viewCount).toBeGreaterThan(before);

    dialogRef.close();

    expect(appRef.viewCount).toBe(before);
    expect(document.querySelector('.dialog-container')).toBeNull();
  });

  // F65: the modal's top was computed from its width, so a modal wider than the screen is tall had its header above it
  it('centres a modal by its height, and keeps a tall one on screen', async () => {
    const dialogs = TestBed.inject(DialogService);
    const wide = dialogs.openModal(DialogContentComponent, undefined, {
      header: { title: 'Wide', allowClose: true },
      width: `${window.innerHeight + 200}px`,
      maxWidth: 'none',
      height: '100px',
    });
    const wideRect = (await placed()).getBoundingClientRect();
    expect(Math.abs(wideRect.top - (window.innerHeight - wideRect.height) / 2)).toBeLessThan(1);
    wide.close();

    const tall = dialogs.openModal(DialogContentComponent, undefined, {
      header: { title: 'Tall', allowClose: true },
      height: `${window.innerHeight + 200}px`,
      maxHeight: 'none',
    });
    const tallContainer = await placed();
    expect(tallContainer.getBoundingClientRect().top).toBe(0);
    expect(tallContainer.querySelector('.dialog-header')!.getBoundingClientRect().top).toBeGreaterThanOrEqual(0);
    tall.close();
  });

  // F76: a modal dropped minWidth and minHeight
  it("keeps a modal's minimum size", async () => {
    const dialogRef = TestBed.inject(DialogService).openModal(DialogContentComponent, undefined, {
      minWidth: '420px',
      minHeight: '120px',
    });

    const container = await placed();
    expect(container.style.minWidth).toBe('420px');
    expect(container.style.minHeight).toBe('120px');
    expect(container.getBoundingClientRect().width).toBeGreaterThanOrEqual(420);

    dialogRef.close();
  });

  // F75: the confirmation dialog ignored its template's context
  it("shows a confirmation template with its context, and answers with the user's choice", async () => {
    const question = TestBed.createComponent(QuestionComponent).componentInstance.$question();
    const answer = TestBed.inject(DialogService).openConfirmationTemplateDialog('Delete', question, { name: 'Report' }, 'error', 'Delete', 'Keep', 'cancel');
    TestBed.inject(ApplicationRef).tick();

    const container = document.querySelector<HTMLElement>('.dialog-container')!;
    expect(container.querySelector('.dialog-content')?.textContent.trim()).toBe('Delete Report?');
    const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>('.dialog-actions button'));
    expect(buttons.map(button => button.textContent.trim())).toEqual(['Keep', 'Delete']);
    expect(document.activeElement).toBe(buttons[0]);
    expect(await axeViolations(container)).toEqual([]);

    buttons[1].click();
    await expect(answer).resolves.toBe(true);
    expect(document.querySelector('.dialog-container')).toBeNull();
  });

  // F74: the dialog module provided its own service, so a page that imported it had a stack of its own, and one
  // Escape closed the top dialog of each
  it('is one stack for the app, so Escape closes only the top dialog', async () => {
    const page = TestBed.createComponent(DialogPageComponent).componentInstance;
    const below = TestBed.inject(DialogService).openModal(DialogContentComponent, undefined);
    const top = page.dialogs.openModal(DialogContentComponent, undefined);
    const closed: string[] = [];
    below.closed$.subscribe(() => closed.push('below'));
    top.closed$.subscribe(() => closed.push('top'));

    await userEvent.keyboard('{Escape}');

    expect(closed).toEqual(['top']);
    below.close();
  });

  // F77: a tooltip is a dialog that ignores Escape, and while one showed, Escape no longer closed the modal under it.
  // Since #60 the first Escape hides the tooltip and goes no further, as WCAG 1.4.13 asks: the user dismisses it
  // without moving the pointer or the focus, and keeps the modal. The next Escape closes the modal
  it('hides a tooltip over a modal on the first Escape, and closes the modal on the next', async () => {
    const fixture = TestBed.createComponent(TooltipPageComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    // the page's own service, which its tooltip uses
    const modal = fixture.componentInstance.dialogs.openModal(DialogContentComponent, undefined);
    const closed = vi.fn();
    modal.closed$.subscribe(closed);
    const help = (fixture.nativeElement as HTMLElement).querySelector('button')!;
    // the modal's backdrop covers the page, so the pointer can't reach the button
    help.dispatchEvent(new MouseEvent('mouseenter'));
    expect(document.querySelectorAll('.dialog-container').length).toBe(2);

    await userEvent.keyboard('{Escape}');

    expect(document.querySelector('[role="tooltip"]')).toBeNull();
    expect(document.querySelectorAll('.dialog-container').length).toBe(1);
    expect(closed).not.toHaveBeenCalled();

    await userEvent.keyboard('{Escape}');

    expect(closed).toHaveBeenCalled();
    expect(document.querySelector('.dialog-container')).toBeNull();
  });

  // A modal shown in the top layer (#58) covers what sits outside it and makes it inert, so an overlay opened over it
  // goes into it
  it("hosts overlays in the topmost modal's container, and in the body once no modal is open", () => {
    const dialogs = TestBed.inject(DialogService);
    expect(dialogs.$overlayHost()).toBeNull();

    const below = dialogs.openModal(DialogContentComponent, undefined);
    const belowContainer = document.querySelector<HTMLElement>('.dialog-container')!;
    expect(dialogs.$overlayHost()).toBe(belowContainer);
    expect(belowContainer.parentElement).toBe(document.body);
    const top = dialogs.openModal(DialogContentComponent, undefined);
    const topContainer = dialogs.$overlayHost()!;
    expect(topContainer).not.toBe(belowContainer);
    // the modal from a modal, and its backdrop, sit in the one below
    expect(topContainer.parentElement).toBe(belowContainer);
    expect(belowContainer.querySelector(':scope > .dialog-backdrop')).not.toBeNull();

    top.close();
    expect(dialogs.$overlayHost()).toBe(belowContainer);
    below.close();
    expect(dialogs.$overlayHost()).toBeNull();
  });

  it("places a tooltip and an app's dialog opened over a modal in it, above its content, where they take clicks", async () => {
    const dialogs = TestBed.inject(DialogService);
    const appRef = TestBed.inject(ApplicationRef);
    const modal = dialogs.openModal(HelpContentComponent, undefined, { width: '80vw', height: '80vh', maxHeight: 'none' });
    appRef.tick();
    const container = await placed();
    const content = container.querySelector<HTMLElement>('tab-test-help-content')!;
    // the element at a box's centre, which a click there reaches; and whether that centre is over the modal's content
    const atCentre = (element: HTMLElement) => {
      const box = element.getBoundingClientRect();
      const [x, y] = [box.left + box.width / 2, box.top + box.height / 2];
      const over = content.getBoundingClientRect();
      expect(x > over.left && x < over.right && y > over.top && y < over.bottom).toBe(true);
      return document.elementFromPoint(x, y);
    };

    await userEvent.hover(content.querySelector<HTMLElement>('.help')!);
    const tooltip = await vi.waitFor(() => {
      const element = document.querySelector<HTMLElement>('[role="tooltip"]');
      expect(element).not.toBeNull();
      expect(element!.style.top).not.toBe('-9999px');
      return element!;
    });
    expect(tooltip.parentElement).toBe(container);
    expect(tooltip.contains(atCentre(tooltip))).toBe(true);
    expect(await axeViolations(container)).toEqual([]);
    const tooltipClicked = vi.fn();
    tooltip.addEventListener('click', tooltipClicked);
    await userEvent.click(tooltip);
    expect(tooltipClicked).toHaveBeenCalled();
    await movePointerAway();
    await vi.waitFor(() => {
      expect(document.querySelector('[role="tooltip"]')).toBeNull();
    });

    const noteClicked = vi.fn();
    dialogs.openDialog(NoteComponent, noteClicked, { top: 'calc(50vh - 1em)', left: 'calc(50vw - 2em)' });
    appRef.tick();
    const note = document.querySelector('tab-test-note')!.closest<HTMLElement>('.dialog-container')!;
    expect(note.parentElement).toBe(container);
    // its backdrop too
    expect(note.previousElementSibling?.classList.contains('dialog-backdrop')).toBe(true);
    await vi.waitFor(() => {
      expect(note.style.top).not.toBe('-9999px');
    });
    const button = note.querySelector('button')!;
    expect(button.contains(atCentre(button))).toBe(true);
    expect(await axeViolations(container)).toEqual([]);
    await userEvent.click(button);
    expect(noteClicked).toHaveBeenCalled();

    modal.close();
    expect(dialogs.dialogStack).toEqual([]);
  });

  // An app's dialog opened from a modal sat in the body: once the modal closed it stayed open on the page, and on the
  // stack, where it took the next Escape
  it('closes the dialogs a modal hosts before it, top first, and the next Escape reaches the page', async () => {
    const dialogs = TestBed.inject(DialogService);
    const closed: string[] = [];
    const track = (name: string, ref: DialogRef<unknown>) => ref.closed$.subscribe(() => closed.push(name));
    const modal = dialogs.openModal(DialogContentComponent, undefined);
    track('modal', modal);
    const content = dialogs.$overlayHost()!.querySelector<HTMLElement>('tab-test-dialog-content')!;
    track('dialog', dialogs.openDialog(DialogContentComponent, undefined, { closeOnEscape: true }));
    // placed after an element in the modal, as a select places its list
    track('list', dialogs.openDialog(DialogContentComponent, undefined, { closeOnEscape: true, skipCreatingBackdrop: true }, new LocalStackOptions(content)));
    track('confirmation', dialogs.openModal(DialogContentComponent, undefined));
    track("confirmation's dialog", dialogs.openDialog(DialogContentComponent, undefined, { closeOnEscape: true }));
    expect(dialogs.dialogStack.length).toBe(5);

    modal.close();

    expect(closed).toEqual(["confirmation's dialog", 'confirmation', 'list', 'dialog', 'modal']);
    expect(dialogs.dialogStack).toEqual([]);
    expect(document.querySelector('.dialog-container, .dialog-backdrop')).toBeNull();
    // an app's own handler
    const app = vi.fn((e: KeyboardEvent) => e.defaultPrevented);
    document.addEventListener('keydown', app);
    try {
      await userEvent.keyboard('{Escape}');
      expect(app).toHaveReturnedWith(false);
    } finally {
      document.removeEventListener('keydown', app);
    }
  });

  it('hands what the app put in a closing modal on to the next host, and takes its own header and content with it', () => {
    const dialogs = TestBed.inject(DialogService);
    const below = dialogs.openModal(DialogContentComponent, undefined, { header: { title: 'Below', allowClose: true } });
    const belowContainer = dialogs.$overlayHost()!;
    const shown = TestBed.createComponent(ShownComponent).componentInstance.$shown();
    const top = dialogs.openTemplateModal(shown, undefined, { header: { title: 'Top', allowClose: true } });
    TestBed.inject(ApplicationRef).tick();
    const topContainer = dialogs.$overlayHost()!;
    const paragraph = topContainer.querySelector(':scope > .shown')!;
    expect(paragraph).not.toBeNull();
    // the app's own overlay, as an app moves it in
    const popover = document.createElement('div');
    dialogs.$overlayHost()!.appendChild(popover);

    top.close();
    expect(popover.parentElement).toBe(belowContainer);
    expect(paragraph.isConnected).toBe(false);
    expect(topContainer.isConnected).toBe(false);
    expect(document.querySelectorAll('.dialog-header').length).toBe(1);

    below.close();
    expect(popover.parentElement).toBe(document.body);
    expect(document.querySelector('.dialog-header, tab-test-dialog-content')).toBeNull();
    popover.remove();
  });

  // The server has no layout and no one to show a dialog to, and one rendered there would stay in the page as dead
  // HTML, since the browser renders the app again
  it('shows nothing on the server', () => {
    const created: string[] = [];
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor() {
          created.push('ResizeObserver');
        }
        observe() {
          // records only
        }
        disconnect() {
          // records only
        }
      },
    );
    TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });
    const dialogRef = TestBed.inject(DialogService).openModal(DialogContentComponent, undefined, {
      header: { title: 'Server', allowClose: true },
    });

    expect(document.querySelector('.dialog-container, .dialog-backdrop')).toBeNull();
    expect(created).toEqual([]);
    expect(TestBed.inject(DialogService).$overlayHost()).toBeNull();
    const closed = vi.fn();
    dialogRef.closed$.subscribe(closed);
    dialogRef.close();
    expect(closed).toHaveBeenCalled();
  });

  // A guard or resolver that awaited a confirmation on the server waited for ever, since no one can answer it there,
  // and held the request or the prerender
  it('answers a confirmation with false at once on the server', async () => {
    TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });
    const question = TestBed.createComponent(QuestionComponent).componentInstance.$question();
    const dialogs = TestBed.inject(DialogService);
    const globals = globalThis as { ngServerMode?: boolean };
    // Angular's own flag for server rendering
    globals.ngServerMode = true;
    try {
      const pending = new Promise(resolve => {
        setTimeout(resolve, 500, 'still waiting');
      });
      const message = dialogs.openConfirmationMessageDialog('Leave', 'Leave this page?', 'primary', undefined, undefined, undefined);
      const template = dialogs.openConfirmationTemplateDialog('Delete', question, { name: 'Report' }, 'error', undefined, undefined, undefined);

      expect(await Promise.race([message, pending])).toBe(false);
      expect(await Promise.race([template, pending])).toBe(false);
      expect(document.querySelector('.dialog-container')).toBeNull();
    } finally {
      delete globals.ngServerMode;
    }
  });

  // Destroying the app with a dialog open left its backdrop, its DOM, its observers and the page's tab order as the
  // dialog had set them
  it('closes its dialogs when the app is destroyed', async () => {
    const page = document.createElement('button');
    page.textContent = 'On the page';
    document.body.appendChild(page);
    try {
      const dialogs = TestBed.inject(DialogService);
      const below = dialogs.openModal(DialogContentComponent, undefined, { header: { title: 'Below', allowClose: true } });
      const top = dialogs.openModal(DialogContentComponent, undefined);
      const closed: string[] = [];
      below.closed$.subscribe(() => closed.push('below'));
      top.closed$.subscribe(() => closed.push('top'));
      expect(page.tabIndex).toBe(-1);

      TestBed.resetTestingModule();

      expect(closed).toEqual(['top', 'below']);
      expect(document.querySelector('.dialog-container, .dialog-backdrop')).toBeNull();
      expect(page.tabIndex).toBe(0);
    } finally {
      page.remove();
    }
  });
});
