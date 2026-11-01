import type { AfterViewInit, ElementRef, OnInit, TemplateRef, Type } from '@angular/core';
import { ApplicationRef, ChangeDetectionStrategy, Component, inject, PLATFORM_ID, viewChild, ViewEncapsulation } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { userEvent } from 'vitest/browser';
// the Playwright options of userEvent's click and dragAndDrop, such as force
import type {} from '@vitest/browser-playwright';
import { TableauUiAutoCompleteModule } from 'tableau-ui-angular/autocomplete';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiMenuModule } from 'tableau-ui-angular/menu';
import { TableauUiSelectModule } from 'tableau-ui-angular/select';
import { TableauUiTooltipModule } from 'tableau-ui-angular/tooltip';
import { axeViolations } from '../../testing/axe';
import { movePointerAway } from '../../testing/pointer';
import { injectDialogData } from './data.ref';
import type { IModalArgs } from './dialog.args';
import type { DialogRef } from './dialog.ref';
import { injectDialogRef } from './dialog.ref';
import { DialogService } from './dialog.service';
import { LocalStackOptions } from './stack-options';
import { TableauUiDialogModule } from './tableau-ui-dialog.module';

@Component({
  selector: 'tab-test-dialog-content',
  template: 'Content',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DialogContentComponent {}

// A modal's content that fills it: a sticky toolbar at z-index 1000, with a button whose tooltip shows below it, over
// the toolbar, and a map layer at z-index 400 with a transform, as a map library draws its panes
@Component({
  selector: 'tab-test-help-content',
  imports: [TableauUiTooltipModule],
  template: `
    <div class="toolbar"><button type="button" class="help" tooltip="Help" tooltipPosition="bottom">Help</button></div>
    <div class="map"></div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      height: 6rem;
      padding: 0.5rem;
    }

    .map {
      position: relative;
      z-index: 400;
      flex: 1;
      transform: translate3d(0, 0, 0);
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

// A template with two roots, its fields and the action row below them
@Component({
  template: `
    <ng-template #form>
      <div class="fields"><button type="button" class="region">Region</button></div>
      <div class="actions"><button type="button" class="save">Save</button></div>
    </ng-template>
  `,
  styles: `
    .fields {
      padding: 0.5rem;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      padding: 0.5rem 0.5rem 4rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FormComponent {
  readonly $form = viewChild.required<TemplateRef<unknown>>('form');
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

// Two fields and a button, the second field marked by the app to take focus first
@Component({
  selector: 'tab-test-autofocus-content',
  template: `<input class="name" aria-label="Name" /><input class="note" aria-label="Note" autofocus /><button type="button">Save</button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class AutofocusContentComponent {}

@Component({
  selector: 'tab-test-fields-content',
  template: `<input class="name" aria-label="Name" /><button type="button">Save</button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FieldsContentComponent {}

// Focuses its second field as it renders, as a component that picks its own field does
@Component({
  selector: 'tab-test-focusing-content',
  template: `<input aria-label="Name" /><input #note class="note" aria-label="Note" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FocusingContentComponent implements AfterViewInit {
  private readonly $note = viewChild.required<ElementRef<HTMLInputElement>>('note');
  ngAfterViewInit() {
    this.$note().nativeElement.focus();
  }
}

@Component({
  selector: 'tab-test-date-content',
  template: `<input type="date" aria-label="From" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DateContentComponent {}

// A field, which takes focus as the modal opens, and a button with a tooltip
@Component({
  selector: 'tab-test-hint-content',
  imports: [TableauUiTooltipModule],
  template: `<input aria-label="Name" /><button type="button" class="hint" tooltip="A hint">Hint</button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HintContentComponent {}

// What a modal's content renders with, as the tests below read it
const rendered: { made?: HTMLElement | null; host?: HTMLElement | null; answer?: Promise<boolean> } = {};

// Opens an app's dialog as it renders, and notes where overlays go then
@Component({
  selector: 'tab-test-opening-content',
  template: 'Opening',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class OpeningContentComponent implements OnInit {
  private readonly dialogs = inject(DialogService);
  // as it is made
  protected readonly made = (rendered.made = this.dialogs.$overlayHost());
  ngOnInit() {
    rendered.host = this.dialogs.$overlayHost();
    this.dialogs.openDialog(DialogContentComponent, undefined, { closeOnEscape: true });
  }
}

// Closes its modal as it renders
@Component({
  selector: 'tab-test-closing-content',
  template: 'Closing',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ClosingContentComponent implements OnInit {
  private readonly dialogRef = injectDialogRef();
  ngOnInit() {
    this.dialogRef.close();
  }
}

// Asks whether to restore a draft as it renders, in a confirmation of its own
@Component({
  selector: 'tab-test-draft-content',
  template: `<button type="button" class="edit">Edit</button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DraftContentComponent implements OnInit {
  private readonly dialogs = inject(DialogService);
  ngOnInit() {
    rendered.answer = this.dialogs.openConfirmationMessageDialog('Restore your draft?', 'A draft of this note is saved.', 'primary', 'Restore', 'Discard', 'accept');
  }
}

// A select at the bottom of a small modal, whose list hangs below the modal's box
@Component({
  imports: [ReactiveFormsModule, TableauUiSelectModule, TableauUiCommonModule],
  template: `
    <ng-template #picker>
      <tab-single-select aria-label="Country" [formControl]="country">
        <tab-option value="hu" text="Hungary" />
        <tab-option value="de" text="Germany" />
        <tab-option value="fr" text="France" />
      </tab-single-select>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PickerComponent {
  readonly country = new FormControl<string | null>(null);
  readonly $picker = viewChild.required<TemplateRef<unknown>>('picker');
}

// Each overlay a modal's content opens: a select's list, an autocomplete's suggestions, a menu and a tooltip
@Component({
  imports: [ReactiveFormsModule, TableauUiSelectModule, TableauUiCommonModule, TableauUiAutoCompleteModule, TableauUiMenuModule, TableauUiTooltipModule],
  template: `
    <ng-template #overlays>
      <div class="overlays">
        <!-- first, where no list hangs over it -->
        <button type="button" class="hint" tooltip="A hint">Hint</button>
        <tab-single-select aria-label="Country" [formControl]="country">
          <tab-option value="hu" text="Hungary" />
          <tab-option value="de" text="Germany" />
        </tab-single-select>
        <input class="city" type="text" aria-label="City" [tabAutoComplete]="cities" />
        <tab-autocomplete #cities>
          <tab-option value="Budapest" text="Budapest" />
          <tab-option value="Bern" text="Bern" />
        </tab-autocomplete>
        <button type="button" class="more" [attachedMenu]="more">More</button>
        <ng-template #more="menu" menu>
          <button type="button" class="help" (click)="helped = true">Help</button>
        </ng-template>
      </div>
    </ng-template>
  `,
  styles: `
    .overlays {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 0.5rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class OverlaysComponent {
  readonly country = new FormControl<string | null>(null);
  helped = false;
  readonly $overlays = viewChild.required<TemplateRef<unknown>>('overlays');
}

// The library's styles, as an app imports them, while a fixture of it lives: the dialogs', the overlay layer's and the
// snacks' rules among them
@Component({
  template: '',
  styleUrl: '../../styles/lib-styles.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class LibraryStylesComponent {}

describe('DialogService', () => {
  // what the library's stylesheet (styles/_dialog.service.scss) gives every dialog, which most tests don't load; those
  // that stack overlays above a modal's content load the library's styles themselves
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
    document.querySelectorAll('.dialog-container, .dialog-backdrop, .test-page').forEach(element => element.remove());
    document.documentElement.classList.remove('dark-mode');
    vi.unstubAllGlobals();
  });

  const placed = async () => {
    const container = document.querySelector<HTMLElement>('.dialog-container:last-of-type')!;
    await vi.waitFor(() => {
      expect(container.style.top).not.toBe('-9999px');
    });
    return container;
  };

  // The top modal's <dialog>, once the service has placed it
  const shown = async () => {
    const dialog = Array.from(document.querySelectorAll<HTMLDialogElement>('dialog.dialog-container')).at(-1)!;
    await vi.waitFor(() => {
      expect(dialog.style.top).not.toBe('-9999px');
    });
    return dialog;
  };
  // Shown in the top layer as a modal
  const isModal = (dialog: HTMLDialogElement) => dialog.isConnected && dialog.open && dialog.matches(':modal');
  // A close event the browser queues runs in a task of its own
  const settle = async () =>
    new Promise(resolve => {
      setTimeout(resolve, 50);
    });

  // A button of the page at its top left corner, outside every modal's box: the real pointer pressed there lands on
  // the top modal's ::backdrop, which targets its <dialog>
  const onThePage = () => {
    const page = document.createElement('button');
    page.type = 'button';
    page.className = 'test-page';
    page.textContent = 'On the page';
    page.style.cssText = 'position: fixed; left: 4px; top: 4px';
    document.body.appendChild(page);
    return page;
  };

  // Whether Escape, pressed now, reaches a listener on the window after the service's own uncancelled
  const escapeReachesThePage = async () => {
    const app = vi.fn((e: KeyboardEvent) => e.defaultPrevented);
    window.addEventListener('keydown', app);
    try {
      await userEvent.keyboard('{Escape}');
    } finally {
      window.removeEventListener('keydown', app);
    }
    return app.mock.results.every(result => result.value === false) && app.mock.calls.length > 0;
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
    // the library's styles, which set aside the browser's own margin and inset for a <dialog>
    TestBed.createComponent(LibraryStylesComponent);
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
  it('hosts overlays in a layer at the end of the topmost modal, and in the body once no modal is open', () => {
    const dialogs = TestBed.inject(DialogService);
    expect(dialogs.$overlayHost()).toBeNull();

    const below = dialogs.openModal(DialogContentComponent, undefined, { header: { title: 'Below', allowClose: true } });
    const belowContainer = document.querySelector<HTMLElement>('.dialog-container')!;
    const belowLayer = dialogs.$overlayHost()!;
    expect(belowLayer.classList.contains('dialog-overlay-layer')).toBe(true);
    expect(belowContainer.lastElementChild).toBe(belowLayer);
    expect(belowContainer.parentElement).toBe(document.body);
    // a modal opened from a modal sits beside it in the body, with its backdrop, and takes the overlays
    const top = dialogs.openModal(DialogContentComponent, undefined);
    const topLayer = dialogs.$overlayHost()!;
    expect(topLayer).not.toBe(belowLayer);
    expect(topLayer.closest('.dialog-container')!.parentElement).toBe(document.body);
    expect(belowContainer.querySelector('.dialog-backdrop, .dialog-container')).toBeNull();

    top.close();
    expect(dialogs.$overlayHost()).toBe(belowLayer);
    expect(topLayer.isConnected).toBe(false);
    below.close();
    expect(dialogs.$overlayHost()).toBeNull();
  });

  // In the modal's container they shared its stacking context with the content, so a sticky toolbar or a map's panes
  // with a z-index above theirs covered them
  it("places a tooltip and an app's dialog opened over a modal above its content, whatever its z-indexes, where they take clicks", async () => {
    const dialogs = TestBed.inject(DialogService);
    const appRef = TestBed.inject(ApplicationRef);
    TestBed.createComponent(LibraryStylesComponent);
    const modal = dialogs.openModal(HelpContentComponent, undefined, { width: '80vw', height: '80vh', maxHeight: 'none' });
    appRef.tick();
    const container = await placed();
    const layer = dialogs.$overlayHost()!;
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
    expect(tooltip.parentElement).toBe(layer);
    // over the toolbar, at z-index 1000
    const toolbar = content.querySelector('.toolbar')!.getBoundingClientRect();
    expect(tooltip.getBoundingClientRect().bottom).toBeLessThan(toolbar.bottom);
    expect(tooltip.contains(atCentre(tooltip))).toBe(true);
    expect(await axeViolations(container)).toEqual([]);
    const tooltipClicked = vi.fn();
    tooltip.addEventListener('click', tooltipClicked);
    await userEvent.click(tooltip);
    expect(tooltipClicked).toHaveBeenCalled();
    // away to the map: the modal's backdrop covers the rest of the page
    await userEvent.hover(content.querySelector<HTMLElement>('.map')!);
    await vi.waitFor(() => {
      expect(document.querySelector('[role="tooltip"]')).toBeNull();
    });

    const noteClicked = vi.fn();
    dialogs.openDialog(NoteComponent, noteClicked, { top: 'calc(50vh - 1em)', left: 'calc(50vw - 2em)' });
    appRef.tick();
    const note = document.querySelector('tab-test-note')!.closest<HTMLElement>('.dialog-container')!;
    expect(note.parentElement).toBe(layer);
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

    // a confirmation over the map
    const answer = dialogs.openConfirmationMessageDialog('Discard', 'Discard the changes?', 'primary', 'OK', 'Cancel', undefined);
    appRef.tick();
    const ok = await vi.waitFor(() => {
      const element = Array.from(document.querySelectorAll<HTMLButtonElement>('.dialog-actions button')).find(candidate => candidate.textContent.trim() === 'OK');
      expect(element).toBeDefined();
      expect(element!.contains(atCentre(element!))).toBe(true);
      return element!;
    });
    await userEvent.click(ok);
    await expect(answer).resolves.toBe(true);

    modal.close();
    expect(dialogs.dialogStack).toEqual([]);
  });

  // Each root of a template modal stacks in the modal as it did before the overlay layer: a list a select in one root
  // opens hangs over the next root, and a press there lands on the list
  it('keeps a list opened in one root of a template modal above the root after it', async () => {
    const dialogs = TestBed.inject(DialogService);
    TestBed.createComponent(LibraryStylesComponent);
    const form = TestBed.createComponent(FormComponent).componentInstance.$form();
    const modal = dialogs.openTemplateModal(form, undefined, { width: '600px', header: { title: 'Template', allowClose: true } });
    TestBed.inject(ApplicationRef).tick();
    await placed();
    const region = document.querySelector<HTMLElement>('.region')!;
    const box = region.getBoundingClientRect();
    dialogs.openDialog(DialogContentComponent, undefined, { top: `${box.bottom}px`, left: `${box.left}px`, width: '600px', height: '10rem' }, new LocalStackOptions(region));
    const list = document.querySelector<HTMLElement>('.fields .dialog-container')!;
    await vi.waitFor(() => {
      expect(list.style.top).not.toBe('-9999px');
    });

    const save = document.querySelector<HTMLElement>('.save')!.getBoundingClientRect();
    expect(list.contains(document.elementFromPoint(save.left + save.width / 2, save.top + save.height / 2))).toBe(true);
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
    const content = document.querySelector<HTMLElement>('tab-test-dialog-content')!;
    track('dialog', dialogs.openDialog(DialogContentComponent, undefined, { closeOnEscape: true }));
    // placed after an element in the modal, as a select places its list
    track('list', dialogs.openDialog(DialogContentComponent, undefined, { closeOnEscape: true, skipCreatingBackdrop: true }, new LocalStackOptions(content)));
    track('second dialog', dialogs.openDialog(DialogContentComponent, undefined, { closeOnEscape: true }));
    expect(dialogs.dialogStack.length).toBe(4);

    modal.close();

    expect(closed).toEqual(['second dialog', 'list', 'dialog', 'modal']);
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

  // A wizard opens its next modal, then closes the one before: nested in it, the next one closed with it at once
  it('keeps a modal opened from a modal open when the one below closes, and Escape closes it next', async () => {
    const dialogs = TestBed.inject(DialogService);
    const first = dialogs.openModal(DialogContentComponent, undefined);
    const next = dialogs.openModal(DialogContentComponent, undefined);
    const nextLayer = dialogs.$overlayHost()!;
    const closed = vi.fn();
    next.closed$.subscribe(closed);

    first.close();

    expect(closed).not.toHaveBeenCalled();
    expect(nextLayer.isConnected).toBe(true);
    expect(dialogs.dialogStack.map(entry => entry.dialogRef)).toEqual([next]);
    expect(dialogs.$overlayHost()).toBe(nextLayer);
    await userEvent.keyboard('{Escape}');
    expect(closed).toHaveBeenCalled();
    expect(dialogs.dialogStack).toEqual([]);
  });

  // An app that closed a modal when a dialog in it closed ran the modal's close twice, and the second run took the
  // modal below off the stack and out of the hosts, so Escape no longer closed it
  it('closes a modal once when a dialog it hosts closes it again, and keeps the modal below', async () => {
    const dialogs = TestBed.inject(DialogService);
    const below = dialogs.openModal(DialogContentComponent, undefined);
    const belowLayer = dialogs.$overlayHost()!;
    const modal = dialogs.openModal(DialogContentComponent, undefined);
    const dialog = dialogs.openDialog(DialogContentComponent, undefined);
    dialog.closed$.subscribe(() => {
      modal.close();
    });
    const closed = vi.fn();
    modal.closed$.subscribe(closed);

    modal.close();

    expect(closed).toHaveBeenCalledTimes(1);
    expect(dialogs.dialogStack.map(entry => entry.dialogRef)).toEqual([below]);
    expect(dialogs.$overlayHost()).toBe(belowLayer);
    expect(belowLayer.isConnected).toBe(true);
    const belowClosed = vi.fn();
    below.closed$.subscribe(belowClosed);
    await userEvent.keyboard('{Escape}');
    expect(belowClosed).toHaveBeenCalled();
  });

  // Any dialog closes the dialogs inside it, as an app's dialog does a select's list in it
  it("closes a dialog placed inside an app's dialog with it, and the next Escape reaches the page", async () => {
    const dialogs = TestBed.inject(DialogService);
    const outer = dialogs.openDialog(DialogContentComponent, undefined);
    const content = document.querySelector<HTMLElement>('tab-test-dialog-content')!;
    const inner = dialogs.openDialog(DialogContentComponent, undefined, { closeOnEscape: true, skipCreatingBackdrop: true }, new LocalStackOptions(content));
    const innerClosed = vi.fn();
    inner.closed$.subscribe(innerClosed);

    outer.close();

    expect(innerClosed).toHaveBeenCalled();
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
    const belowLayer = dialogs.$overlayHost()!;
    const shown = TestBed.createComponent(ShownComponent).componentInstance.$shown();
    const top = dialogs.openTemplateModal(shown, undefined, { header: { title: 'Top', allowClose: true } });
    TestBed.inject(ApplicationRef).tick();
    const topLayer = dialogs.$overlayHost()!;
    const topContainer = topLayer.parentElement!;
    const paragraph = topContainer.querySelector(':scope > .shown')!;
    expect(paragraph).not.toBeNull();
    // the app's own overlay, as an app moves it in
    const popover = document.createElement('div');
    dialogs.$overlayHost()!.appendChild(popover);

    top.close();
    expect(popover.parentElement).toBe(belowLayer);
    expect(paragraph.isConnected).toBe(false);
    expect(topContainer.isConnected).toBe(false);
    expect(document.querySelectorAll('.dialog-header').length).toBe(1);

    below.close();
    expect(popover.parentElement).toBe(document.body);
    expect(document.querySelector('.dialog-header, tab-test-dialog-content')).toBeNull();
    popover.remove();
  });

  // #57: a modal was a <div> with no role and no name; #58: the browser shows a <dialog> as a modal in the top layer
  it('shows a modal as an open <dialog> in the top layer, named by its title, or by its label without a header', async () => {
    const dialogs = TestBed.inject(DialogService);
    TestBed.createComponent(LibraryStylesComponent);
    const modal = () => document.querySelector<HTMLDialogElement>('dialog.dialog-container')!;

    const titled = dialogs.openModal(DialogContentComponent, undefined, { header: { title: 'Rename', allowClose: true }, label: 'Not this' });
    TestBed.inject(ApplicationRef).tick();
    expect(isModal(modal())).toBe(true);
    expect(document.getElementById(modal().getAttribute('aria-labelledby')!)?.textContent).toBe('Rename');
    expect(modal().hasAttribute('aria-label')).toBe(false);
    expect(await axeViolations(modal())).toEqual([]);
    titled.close();

    const labelled = dialogs.openModal(DialogContentComponent, undefined, { label: 'Filters' });
    expect(isModal(modal())).toBe(true);
    expect(modal().getAttribute('aria-label')).toBe('Filters');
    expect(modal().hasAttribute('aria-labelledby')).toBe(false);
    expect(await axeViolations(modal())).toEqual([]);
    labelled.close();

    // a label with no words names nothing
    const blank = dialogs.openModal(DialogContentComponent, undefined, { label: '  ' });
    expect(modal().hasAttribute('aria-label')).toBe(false);
    blank.close();

    // a confirmation is a modal named by its title and described by its message, which a screen reader reads with the
    // button that takes focus
    void dialogs.openConfirmationMessageDialog('Discard', 'Discard the changes?', 'primary', undefined, undefined, undefined);
    expect(isModal(modal())).toBe(true);
    expect(document.getElementById(modal().getAttribute('aria-labelledby')!)?.textContent).toBe('Discard');
    expect(document.getElementById(modal().getAttribute('aria-describedby')!)?.textContent.trim()).toBe('Discard the changes?');
    expect(await axeViolations(modal())).toEqual([]);
    dialogs.dialogStack[0].dialogRef.close();

    // a dialog that isn't a modal is a <div>, which a label doesn't name
    const note = dialogs.openDialog(DialogContentComponent, undefined, { label: 'Note', header: { title: 'Note', allowClose: true } });
    const div = document.querySelector('.dialog-container')!;
    expect(div.tagName).toBe('DIV');
    expect(div.hasAttribute('aria-label')).toBe(false);
    expect(div.hasAttribute('aria-labelledby')).toBe(false);
    expect(document.querySelector('dialog')).toBeNull();
    note.close();
  });

  // #57: focus stayed on the page as a modal opened; and the browser's own steps focus the header's close button first
  it("moves focus into a modal once: to an [autofocus] element, the first in the Tab order, the header's close button, or the modal", () => {
    const dialogs = TestBed.inject(DialogService);
    const header = { title: 'Edit', allowClose: true };
    const focused: EventTarget[] = [];
    // the close button's name as it takes focus, before any tick renders its icon
    const closeNames: (string | null | undefined)[] = [];
    const track = (e: FocusEvent) => {
      focused.push(e.target!);
      if (e.target instanceof Element && e.target.matches('.dialog-close')) {
        closeNames.push(e.target.querySelector('tab-icon')?.getAttribute('aria-label'));
      }
    };
    document.addEventListener('focusin', track);
    try {
      const open = (component: Type<unknown>, args?: IModalArgs) => {
        focused.length = 0;
        return dialogs.openModal(component, undefined, args);
      };

      // the app's own [autofocus], past the close button and the first field; its attribute stays
      let ref = open(AutofocusContentComponent, { header });
      const note = document.querySelector('.note')!;
      expect(focused).toEqual([note]);
      expect(note.hasAttribute('autofocus')).toBe(true);
      ref.close();

      // the first field; the service's own mark is gone once the modal shows
      ref = open(FieldsContentComponent, { header });
      const name = document.querySelector('.name')!;
      expect(focused).toEqual([name]);
      expect(name.hasAttribute('autofocus')).toBe(false);
      ref.close();

      // the field the content focused as it rendered stays focused
      ref = open(FocusingContentComponent, { header });
      expect(focused).toEqual([document.querySelector('.note')]);
      ref.close();

      // nothing in the content takes focus: the header's close button
      ref = open(DialogContentComponent, { header });
      expect(focused).toEqual([document.querySelector('.dialog-close')]);
      expect(closeNames).toEqual(['Close']);
      ref.close();

      // nothing in it takes focus: the modal itself
      ref = open(DialogContentComponent);
      const dialog = document.querySelector('dialog.dialog-container')!;
      expect(focused).toEqual([dialog]);
      expect(dialog.hasAttribute('autofocus')).toBe(false);
      ref.close();

      // a confirmation's chosen button
      focused.length = 0;
      void dialogs.openConfirmationMessageDialog('Discard', 'Discard the changes?', 'primary', 'Discard', 'Keep', 'accept');
      expect(focused.map(target => (target as HTMLElement).textContent.trim())).toEqual(['Discard']);
      dialogs.dialogStack[0].dialogRef.close();
    } finally {
      document.removeEventListener('focusin', track);
    }
  });

  it('gives focus back to the element focused before a modal opened, and from a wizard, back to the page', () => {
    const dialogs = TestBed.inject(DialogService);
    const page = onThePage();
    page.focus();
    const element = (ref: DialogRef<unknown>) => (ref as DialogRef<unknown> & { dialogElement: HTMLElement }).dialogElement;
    const button = (ref: DialogRef<unknown>) => element(ref).querySelector('button')!;

    const modal = dialogs.openModal(FieldsContentComponent, undefined);
    expect(document.activeElement).not.toBe(page);
    // a modal opened from it gives focus back to the button in it
    button(modal).focus();
    const above = dialogs.openModal(FieldsContentComponent, undefined);
    above.close();
    expect(document.activeElement).toBe(button(modal));
    modal.close();
    expect(document.activeElement).toBe(page);

    // a wizard: the next step opens from a button in the first, which then closes; focus stays in the step still open
    const first = dialogs.openModal(FieldsContentComponent, undefined);
    button(first).focus();
    const next = dialogs.openModal(FieldsContentComponent, undefined);
    const field = document.activeElement;
    expect(field?.closest('dialog')).toBe(element(next));
    first.close();
    expect(document.activeElement).toBe(field);
    next.close();
    expect(document.activeElement).toBe(page);

    // an element gone from the page takes no focus
    const gone = onThePage();
    gone.focus();
    const last = dialogs.openModal(FieldsContentComponent, undefined);
    gone.remove();
    last.close();
    expect(document.activeElement).toBe(document.body);
  });

  // #57: every element of the page took tabindex -1 to keep focus in a modal, a screen reader still read the page, and
  // a script could focus it
  it('keeps focus in a modal: the page outside takes none, from Tab or from a script', async () => {
    const page = onThePage();
    const modal = TestBed.inject(DialogService).openModal(FieldsContentComponent, undefined, { header: { title: 'Edit', allowClose: true } });
    for (let i = 0; i < 5; i++) {
      await userEvent.keyboard('{Tab}');
      expect(document.activeElement).not.toBe(page);
    }
    page.focus();
    expect(document.activeElement).not.toBe(page);
    expect(page.tabIndex).toBe(0);
    modal.close();
  });

  it('closes the top dialog in a modal on Escape first, then the modal', async () => {
    const dialogs = TestBed.inject(DialogService);
    const modal = dialogs.openModal(DialogContentComponent, undefined);
    const dialog = document.querySelector<HTMLDialogElement>('dialog.dialog-container')!;
    // placed after an element in the modal, as a select places its list
    const content = document.querySelector<HTMLElement>('tab-test-dialog-content')!;
    const list = dialogs.openDialog(DialogContentComponent, undefined, { closeOnEscape: true, skipCreatingBackdrop: true }, new LocalStackOptions(content));
    const closed: string[] = [];
    list.closed$.subscribe(() => closed.push('list'));
    modal.closed$.subscribe(() => closed.push('modal'));

    await userEvent.keyboard('{Escape}');
    await settle();
    expect(closed).toEqual(['list']);
    expect(isModal(dialog)).toBe(true);

    await userEvent.keyboard('{Escape}');
    expect(closed).toEqual(['list', 'modal']);
    expect(dialog.isConnected).toBe(false);
  });

  // The browser's own close request on Escape would close a <dialog> the app keeps open, the second time without a
  // user's action in between
  it('keeps a modal that ignores Escape open however often it is pressed, a dropdown in it closing first', async () => {
    const dialogs = TestBed.inject(DialogService);
    const modal = dialogs.openModal(DialogContentComponent, undefined, { closeOnEscape: false });
    const dialog = document.querySelector<HTMLDialogElement>('dialog.dialog-container')!;
    const content = document.querySelector<HTMLElement>('tab-test-dialog-content')!;
    const list = dialogs.openDialog(DialogContentComponent, undefined, { closeOnEscape: true, skipCreatingBackdrop: true }, new LocalStackOptions(content));
    const listClosed = vi.fn();
    list.closed$.subscribe(listClosed);
    const closed = vi.fn();
    modal.closed$.subscribe(closed);

    for (let i = 0; i < 3; i++) {
      await userEvent.keyboard('{Escape}');
      await settle();
    }

    expect(listClosed).toHaveBeenCalled();
    expect(closed).not.toHaveBeenCalled();
    expect(isModal(dialog)).toBe(true);
    modal.close();
  });

  it('keeps both open on Escape when a modal that ignores it sits over another', async () => {
    const dialogs = TestBed.inject(DialogService);
    const below = dialogs.openModal(DialogContentComponent, undefined);
    const top = dialogs.openModal(DialogContentComponent, undefined, { closeOnEscape: false });
    const closed = vi.fn();
    below.closed$.subscribe(closed);
    top.closed$.subscribe(closed);

    await userEvent.keyboard('{Escape}');
    await userEvent.keyboard('{Escape}');
    await settle();

    expect(closed).not.toHaveBeenCalled();
    expect(Array.from(document.querySelectorAll<HTMLDialogElement>('dialog.dialog-container')).map(isModal)).toEqual([true, true]);
    top.close();
    below.close();
  });

  // The service listened on the document, so an app's own handler there could run after it and lose
  it("leaves a modal open when an app's handler on the document cancels Escape, before and after a tooltip shows", async () => {
    const dialogs = TestBed.inject(DialogService);
    const keep = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
      }
    };
    const modal = dialogs.openModal(HintContentComponent, undefined, { header: { title: 'Hints', allowClose: true } });
    TestBed.inject(ApplicationRef).tick();
    const dialog = await shown();
    const closed = vi.fn();
    modal.closed$.subscribe(closed);
    document.addEventListener('keydown', keep);
    try {
      await userEvent.keyboard('{Escape}');
      await settle();
      expect(isModal(dialog)).toBe(true);

      await userEvent.hover(dialog.querySelector<HTMLElement>('.hint')!);
      await vi.waitFor(() => {
        expect(document.querySelector('[role="tooltip"]')).not.toBeNull();
      });
      // the tooltip takes the first Escape, the app's handler the next
      await userEvent.keyboard('{Escape}');
      expect(document.querySelector('[role="tooltip"]')).toBeNull();
      await userEvent.keyboard('{Escape}');
      await settle();
      expect(closed).not.toHaveBeenCalled();
      expect(isModal(dialog)).toBe(true);
    } finally {
      document.removeEventListener('keydown', keep);
    }
    await userEvent.keyboard('{Escape}');
    expect(closed).toHaveBeenCalled();
  });

  // The browser's picker for a date closes on Escape, and the key can reach the page as the picker shuts
  it('leaves a modal open on Escape from a date input in it', async () => {
    const modal = TestBed.inject(DialogService).openModal(DateContentComponent, undefined);
    const dialog = document.querySelector<HTMLDialogElement>('dialog.dialog-container')!;
    const date = dialog.querySelector('input')!;
    expect(document.activeElement).toBe(date);
    const closed = vi.fn();
    modal.closed$.subscribe(closed);

    await userEvent.keyboard('{Escape}');
    await settle();

    expect(closed).not.toHaveBeenCalled();
    expect(isModal(dialog)).toBe(true);
    modal.close();
  });

  it('leaves Escape to the page while only a dialog that ignores it is open', async () => {
    const dialogs = TestBed.inject(DialogService);
    const panel = dialogs.openDialog(DialogContentComponent, undefined, { closeOnEscape: false });
    const closed = vi.fn();
    panel.closed$.subscribe(closed);

    expect(await escapeReachesThePage()).toBe(true);
    expect(closed).not.toHaveBeenCalled();
    panel.close();
  });

  // A close request other than Escape, such as a back gesture, fires cancel on the <dialog>, and closed it under a
  // dropdown, or one that ignores Escape
  it('closes what Escape would on requestClose(): a dropdown first, then nothing for a modal that ignores Escape', async () => {
    const dialogs = TestBed.inject(DialogService);
    const modal = dialogs.openModal(DialogContentComponent, undefined, { closeOnEscape: false });
    const dialog = document.querySelector<HTMLDialogElement>('dialog.dialog-container')!;
    const content = document.querySelector<HTMLElement>('tab-test-dialog-content')!;
    const list = dialogs.openDialog(DialogContentComponent, undefined, { closeOnEscape: true, skipCreatingBackdrop: true }, new LocalStackOptions(content));
    const listClosed = vi.fn();
    list.closed$.subscribe(listClosed);
    const closed = vi.fn();
    modal.closed$.subscribe(closed);

    dialog.requestClose();
    await settle();
    expect(listClosed).toHaveBeenCalled();
    expect(isModal(dialog)).toBe(true);

    dialog.requestClose();
    await settle();
    expect(closed).not.toHaveBeenCalled();
    expect(isModal(dialog)).toBe(true);
    modal.close();

    // one that closes on Escape closes
    const other = dialogs.openModal(DialogContentComponent, undefined);
    const otherClosed = vi.fn();
    other.closed$.subscribe(otherClosed);
    document.querySelector<HTMLDialogElement>('dialog.dialog-container')!.requestClose();
    await settle();
    expect(otherClosed).toHaveBeenCalled();
    expect(document.querySelector('dialog')).toBeNull();
  });

  it('closes the DialogRef and the dialogs a modal hosts when its <dialog> is closed directly, and the next Escape reaches the page', async () => {
    const dialogs = TestBed.inject(DialogService);
    const modal = dialogs.openModal(DialogContentComponent, undefined);
    const dialog = document.querySelector<HTMLDialogElement>('dialog.dialog-container')!;
    const note = dialogs.openDialog(DialogContentComponent, undefined, { closeOnEscape: true });
    const closed: string[] = [];
    note.closed$.subscribe(() => closed.push('note'));
    modal.closed$.subscribe(() => closed.push('modal'));

    dialog.close();
    await vi.waitFor(() => {
      expect(closed).toEqual(['note', 'modal']);
    });

    expect(dialog.isConnected).toBe(false);
    expect(dialogs.dialogStack).toEqual([]);
    expect(dialogs.$overlayHost()).toBeNull();
    expect(await escapeReachesThePage()).toBe(true);
  });

  it('closes a modal on a press on its backdrop, and not on a press that starts or ends in it', async () => {
    TestBed.createComponent(LibraryStylesComponent);
    const dialogs = TestBed.inject(DialogService);
    const page = onThePage();

    const modal = dialogs.openModal(FieldsContentComponent, undefined, { height: '12rem' });
    const dialog = await shown();
    const closed = vi.fn();
    modal.closed$.subscribe(closed);
    // a click in the modal's own area, below its content, and on its border, outside its padding box
    await userEvent.click(dialog, { position: { x: 20, y: dialog.clientHeight - 10 } });
    await userEvent.click(dialog, { position: { x: -0.5, y: dialog.clientHeight - 10 }, force: true });
    // a text selection dragged from its field out to the backdrop
    const name = dialog.querySelector<HTMLInputElement>('.name')!;
    name.value = 'Ada Lovelace';
    await userEvent.dragAndDrop(name, page, { force: true });
    // the same as events, for a browser whose drag sends no click: the press on the field, the click on the <dialog>
    // outside its box, as the backdrop takes it
    const outside = { bubbles: true, clientX: 2, clientY: 2 };
    name.dispatchEvent(new PointerEvent('pointerdown', outside));
    dialog.dispatchEvent(new MouseEvent('click', outside));
    // a click() with no press, as a test that moved over from the old backdrop's click might send
    dialog.click();
    expect(closed).not.toHaveBeenCalled();
    expect(isModal(dialog)).toBe(true);

    // a press on the backdrop
    await userEvent.click(page, { force: true });
    expect(closed).toHaveBeenCalled();
    expect(dialog.isConnected).toBe(false);

    // one that keeps it
    dialogs.openModal(DialogContentComponent, undefined, { closeOnBackdropClick: false });
    const kept = await shown();
    await userEvent.click(page, { force: true });
    expect(isModal(kept)).toBe(true);
  });

  // The list a select opens hangs below a small modal, outside its box, and its backdrop covers the window
  it('keeps a modal open on a press on an option of a list that hangs below it, and on one outside the list, which closes it', async () => {
    TestBed.createComponent(LibraryStylesComponent);
    const dialogs = TestBed.inject(DialogService);
    const picker = TestBed.createComponent(PickerComponent);
    const page = onThePage();
    const modal = dialogs.openTemplateModal(picker.componentInstance.$picker(), undefined, { label: 'Country' });
    TestBed.inject(ApplicationRef).tick();
    const dialog = await shown();
    const closed = vi.fn();
    modal.closed$.subscribe(closed);
    const select = dialog.querySelector<HTMLElement>('tab-single-select')!;

    await userEvent.click(select);
    const france = await vi.waitFor(() => {
      const option = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).find(element => element.textContent.includes('France'));
      expect(option).toBeDefined();
      const box = option!.getBoundingClientRect();
      expect(box.top).toBeGreaterThan(dialog.getBoundingClientRect().bottom);
      expect(option!.contains(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2))).toBe(true);
      return option!;
    });
    await userEvent.click(france);
    expect(picker.componentInstance.country.value).toBe('fr');
    expect(isModal(dialog)).toBe(true);

    await userEvent.click(select);
    await vi.waitFor(() => {
      expect(document.querySelector('[role="listbox"]')).not.toBeNull();
    });
    await userEvent.click(page, { force: true });
    await vi.waitFor(() => {
      expect(document.querySelector('[role="listbox"]')).toBeNull();
    });
    await settle();
    expect(closed).not.toHaveBeenCalled();
    expect(isModal(dialog)).toBe(true);
    modal.close();
  });

  it('closes only a confirmation on a press on its backdrop, over a modal', async () => {
    TestBed.createComponent(LibraryStylesComponent);
    const dialogs = TestBed.inject(DialogService);
    const page = onThePage();
    const modal = dialogs.openModal(DialogContentComponent, undefined);
    const below = await shown();
    const closed = vi.fn();
    modal.closed$.subscribe(closed);
    const answer = dialogs.openConfirmationMessageDialog('Discard', 'Discard the changes?', 'primary', undefined, undefined, undefined);
    const confirmation = await shown();
    expect(confirmation).not.toBe(below);

    await userEvent.click(page, { force: true });

    await expect(answer).resolves.toBe(false);
    expect(confirmation.isConnected).toBe(false);
    expect(closed).not.toHaveBeenCalled();
    expect(isModal(below)).toBe(true);
    modal.close();
  });

  // A dialog the content opened as it rendered went to the host before the modal, under it once it showed
  it('puts a dialog its content opens as it renders in the modal, and takes a modal its content closes out of the hosts', () => {
    const dialogs = TestBed.inject(DialogService);
    const modal = dialogs.openModal(OpeningContentComponent, undefined);
    const layer = document.querySelector('dialog.dialog-container > .dialog-overlay-layer')!;
    expect(rendered.made).toBe(layer);
    expect(rendered.host).toBe(layer);
    expect(document.querySelector('tab-test-dialog-content')!.closest('.dialog-container')!.parentElement).toBe(layer);
    modal.close();
    expect(dialogs.dialogStack).toEqual([]);

    dialogs.openModal(ClosingContentComponent, undefined);
    expect(document.querySelector('dialog')).toBeNull();
    expect(dialogs.$overlayHost()).toBeNull();
    expect(dialogs.dialogStack).toEqual([]);
  });

  // A modal the content opened as it rendered, such as "Restore your draft?", showed first, and the outer one's
  // showModal() then covered it, inert, while Escape closed it unseen
  it('shows a modal its content opens as it renders above it, and gives focus back into it', async () => {
    TestBed.createComponent(LibraryStylesComponent);
    const dialogs = TestBed.inject(DialogService);
    const page = onThePage();
    page.focus();
    const outer = dialogs.openModal(DraftContentComponent, undefined, { header: { title: 'Note', allowClose: true } });
    TestBed.inject(ApplicationRef).tick();
    const [note, draft] = Array.from(document.querySelectorAll<HTMLDialogElement>('dialog.dialog-container'));
    expect(draft.textContent).toContain('Restore your draft?');
    expect([note, draft].map(isModal)).toEqual([true, true]);
    expect(dialogs.$overlayHost()).toBe(draft.querySelector('.dialog-overlay-layer'));

    // on top: focus is on its Restore button, the note under it takes none, and a press at the button reaches it
    const restore = Array.from(draft.querySelectorAll('button')).find(button => button.textContent.trim() === 'Restore')!;
    expect(document.activeElement).toBe(restore);
    note.querySelector<HTMLElement>('.edit')!.focus();
    expect(document.activeElement).toBe(restore);
    await vi.waitFor(() => {
      expect(note.style.top).not.toBe('-9999px');
      expect(draft.style.top).not.toBe('-9999px');
      const box = restore.getBoundingClientRect();
      expect(restore.contains(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2))).toBe(true);
    });

    // focus goes back into the note, where it was as the confirmation showed, not to the page under the note
    await userEvent.keyboard('{Escape}');
    await expect(rendered.answer).resolves.toBe(false);
    expect(isModal(note)).toBe(true);
    expect(document.activeElement).toBe(note.querySelector('.edit'));
    outer.close();
    expect(document.activeElement).toBe(page);
  });

  it("draws a modal's backdrop in the theme's backdrop colour, light and dark", async () => {
    TestBed.createComponent(LibraryStylesComponent);
    const modal = TestBed.inject(DialogService).openModal(DialogContentComponent, undefined);
    const dialog = document.querySelector<HTMLDialogElement>('dialog.dialog-container')!;
    // the property's colour, as the page computes it
    const probe = document.createElement('div');
    probe.className = 'test-page';
    probe.style.backgroundColor = 'var(--twc-modal-color-backdrop)';
    document.body.appendChild(probe);
    const backdrop = () => getComputedStyle(dialog, '::backdrop').backgroundColor;

    const light = getComputedStyle(probe).backgroundColor;
    expect(backdrop()).toBe(light);
    document.documentElement.classList.add('dark-mode');
    const dark = getComputedStyle(probe).backgroundColor;
    expect(dark).not.toBe(light);
    expect(backdrop()).toBe(dark);
    modal.close();
  });

  // A modal in the top layer covers whatever is outside it and makes it inert, so each overlay its content opens sits
  // in it, above it
  it("shows a select's list, an autocomplete's suggestions, a menu and a tooltip opened in a modal above it, where they take focus and clicks", async () => {
    TestBed.createComponent(LibraryStylesComponent);
    const dialogs = TestBed.inject(DialogService);
    const fixture = TestBed.createComponent(OverlaysComponent);
    const host = fixture.componentInstance;
    const modal = dialogs.openTemplateModal(host.$overlays(), undefined, { width: '20rem', header: { title: 'Overlays', allowClose: true } });
    TestBed.inject(ApplicationRef).tick();
    const dialog = await shown();
    // the element a press at the centre of an element's box reaches
    const atCentre = (element: Element) => {
      const box = element.getBoundingClientRect();
      return document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    };
    const option = async (text: string) =>
      vi.waitFor(() => {
        const element = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).find(candidate => candidate.textContent.includes(text));
        expect(element).toBeDefined();
        expect(element!.closest('dialog')).toBe(dialog);
        expect(element!.contains(atCentre(element!))).toBe(true);
        return element!;
      });

    await userEvent.click(dialog.querySelector('tab-single-select')!);
    await userEvent.click(await option('Germany'));
    expect(host.country.value).toBe('de');

    const city = dialog.querySelector<HTMLInputElement>('.city')!;
    await userEvent.click(city);
    await userEvent.click(await option('Bern'));
    expect(city.value).toBe('Bern');

    await userEvent.click(dialog.querySelector('.more')!);
    const help = await vi.waitFor(() => {
      const element = document.querySelector<HTMLButtonElement>('.help')!;
      expect(element.closest('dialog')).toBe(dialog);
      expect(element.contains(atCentre(element))).toBe(true);
      return element;
    });
    // the menu keeps focus: Tab goes into it
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(help);
    expect(await axeViolations(dialog)).toEqual([]);
    await userEvent.click(help);
    expect(host.helped).toBe(true);
    await userEvent.keyboard('{Escape}');

    await userEvent.hover(dialog.querySelector('.hint')!);
    const tooltip = await vi.waitFor(() => {
      const element = document.querySelector<HTMLElement>('[role="tooltip"]')!;
      expect(element.closest('dialog')).toBe(dialog);
      expect(element.style.top).not.toBe('-9999px');
      expect(element.contains(atCentre(element))).toBe(true);
      return element;
    });
    const clicked = vi.fn();
    tooltip.addEventListener('click', clicked);
    await userEvent.click(tooltip);
    expect(clicked).toHaveBeenCalled();

    expect(isModal(dialog)).toBe(true);
    modal.close();
    expect(dialogs.dialogStack).toEqual([]);
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

  // Destroying the app with a dialog open left its backdrop, its DOM, its observers and the page inert
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
      // inert under the modals, its own tabindex untouched
      page.focus();
      expect(document.activeElement).not.toBe(page);
      expect(page.tabIndex).toBe(0);

      TestBed.resetTestingModule();

      expect(closed).toEqual(['top', 'below']);
      expect(document.querySelector('.dialog-container, .dialog-backdrop')).toBeNull();
      page.focus();
      expect(document.activeElement).toBe(page);
    } finally {
      page.remove();
    }
  });
});
