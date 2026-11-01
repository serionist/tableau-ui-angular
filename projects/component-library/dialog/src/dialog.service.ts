import type { ComponentRef, EmbeddedViewRef, OnDestroy, Signal, TemplateRef, Type, ViewRef } from '@angular/core';
import { ApplicationRef, createComponent, DOCUMENT, EnvironmentInjector, ErrorHandler, inject, Injectable, Injector, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { DialogRef, IDialogRef } from './dialog.ref';
import { TAB_DIALOG_REF, DialogRefInternal } from './dialog.ref';
import type { IConfirmationDialogArgs, IDialogArgs, IDialogPositionAndSizeArgs, IModalArgs } from './dialog.args';
import { fromEvent, Subscription } from 'rxjs';
import type { FocusableElement } from 'tabbable';
import { isFocusable, tabbable } from 'tabbable';
import type { IConfirmationDialogData } from './confirmation-dialog.component';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { TAB_DATA_REF } from './data.ref';
import { IconComponent } from 'tableau-ui-angular/icon';
import { generateRandomString } from 'tableau-ui-angular/utils';
import type { StackOptions } from './stack-options';
import { GlobalStackOptions, LocalStackOptions } from './stack-options';

// An open modal: its <dialog>, the layer for the overlays it hosts, and the element focus goes back to when it closes
interface OpenModal {
  dialogRef: IDialogRef;
  layer: HTMLElement;
  opener: HTMLElement | null;
  // its showModal(), until it has run
  reveal?: () => void;
}

// The inputs whose picker the browser opens and closes on Escape, the key reaching the page as the picker shuts, and
// whose own fields take Tab
const PICKERS = ['date', 'datetime-local', 'month', 'time', 'week'];
function isPicker(target: EventTarget | null): boolean {
  return target instanceof HTMLInputElement && PICKERS.includes(target.type);
}

// Styles for the dialog container are in _dialog.service.scss in the styles folder
@Injectable({
  providedIn: 'root', // This service is a singleton and should be provided in the root injector
})
export class DialogService implements OnDestroy {
  injector = inject(Injector);
  appRef = inject(ApplicationRef);
  environmentInjector = inject(EnvironmentInjector);
  private readonly document = inject(DOCUMENT);
  // The server shows no dialog: it has no layout and no user, and a dialog rendered there would stay in the page as
  // dead HTML, since the browser renders the app again
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  // The open modals, the bottom one first, a modal whose content renders now included
  private readonly modals: OpenModal[] = [];
  // How many modals' contents render now, one inside another's
  private rendering = 0;
  private readonly $host = signal<HTMLElement | null>(null);
  /**
   * Where an overlay opened now belongs: the overlay layer of the topmost open modal, `div.dialog-overlay-layer` at the
   * end of its `dialog.dialog-container`, or `null` while no modal is open, for the body. The layer is fixed, takes no
   * space, and sits above everything in the modal's content, a toolbar or a map with a z-index of its own included.
   *
   * A modal is a `<dialog>` shown with `showModal()`: the browser puts it in the top layer, above every z-index in the
   * page, and makes everything outside it inert, so an overlay outside the modal shows under it and takes no clicks or
   * focus. The service puts a dialog it opens with `GlobalStackOptions` here, its backdrop included: a tooltip, or a
   * dialog the app opens with `openDialog()` or `openTemplateDialog()`. The snack service moves its stack here too. A
   * dialog with `LocalStackOptions`, such as a select's list or a menu, sits after its element, in the modal already.
   * Such an overlay sits above the modal's content and takes its clicks and focus, and the modal, when it closes, first
   * closes the dialogs inside it, top first. A modal, a confirmation included, goes to the body, a sibling of the modal
   * below, which the top layer stacks under it, so a modal can open the next one and close itself.
   *
   * An app that appends an overlay of its own to the body, opened from a modal, appends it here instead
   * (`$overlayHost() ?? document.body`), `position: fixed` at the viewport coordinates `getBoundingClientRect()` gives:
   * an absolute one is placed against the layer, which has no size, so page coordinates land low by the page's scroll
   * and a percentage size is of nothing. An element the app or the snack service put in a modal's layer moves on to
   * the next host when the modal closes, the topmost modal still open or the body; one that should go with the modal,
   * the app removes. The overlays are `position: fixed` inside the modal's container, so a `transform`, `filter` or
   * `contain` on `.dialog-container` would move and clip them.
   */
  readonly $overlayHost: Signal<HTMLElement | null> = this.$host.asReadonly();

  /**
   * Shows a component in a modal, a `<dialog>` shown with `showModal()`: it sits in the top layer, above the page,
   * which is inert while it is open, and screen readers hear it as a modal dialog named by its header's title, or by
   * `args.label` without a header.
   *
   * As it opens, focus goes to the first of these: an element the content focused as it rendered, the content's first
   * `[autofocus]` element, its first element in the Tab order, the header's close button, the modal itself. Content
   * opened from a modal marks the element to focus `autofocus` rather than focusing it as it renders: until the new
   * modal shows, it is outside the open one, inert, and takes no focus. When it closes, focus goes back to the element
   * focused before it opened, while that is still in the page and no modal opened after it is still open; one opened
   * from a menu that has closed meanwhile gives it back to the menu's button. A menu opened with `trapFocus` false, or
   * a button gone by the time the modal closes, leaves focus on the body. Escape
   * closes the top dialog in it, then the modal, unless `closeOnEscape` is `false`; a press on its backdrop closes it
   * unless `closeOnBackdropClick` is `false`. A modal the content opens as it renders, such as a confirmation from its
   * `ngOnInit`, shows above it.
   */
  openModal<TComponent, TData, TResult>(component: Type<TComponent>, data: TData, args?: IModalArgs): DialogRef<TResult> {
    return this._openModal<TData, TResult>((injector: Injector) => this.createView(component, injector), data, args);
  }

  /**
   * Shows a template in a modal, as `openModal()` shows a component.
   */
  openTemplateModal<TContext, TResult>(contentTemplate: TemplateRef<TContext>, contentTemplateContext: TContext, args?: IModalArgs): DialogRef<TResult> {
    return this._openModal<TContext, TResult>((injector: Injector) => contentTemplate.createEmbeddedView(contentTemplateContext, injector), contentTemplateContext, args);
  }

  _openModal<TData, TResult>(getViewRef: (injector: Injector) => ViewRef, data: TData, args?: IModalArgs): DialogRef<TResult> {
    const a = {
      width: args?.width ?? '300px',
      height: args?.height ?? 'fit-content',
      minWidth: args?.minWidth,
      minHeight: args?.minHeight,
      maxWidth: args?.maxWidth ?? 'calc(100vw - 100px)',
      maxHeight: args?.maxHeight ?? 'calc(80vh - 50px)',
      closeOnBackdropClick: args?.closeOnBackdropClick ?? true,
      closeOnEscape: args?.closeOnEscape ?? true,
      label: args?.label,
      containerCss: {
        backgroundColor: 'var(--twc-color-base)',
        borderColor: 'var(--twc-color-border-light)',
        borderStyle: 'solid',
        borderWidth: '1px',
        borderRadius: '1px',
        boxShadow: '0 2px 10px var(--twc-modal-color-box-shadow)',
        cursor: 'default',
        // which also lays the <dialog> out while it is closed, off the screen, where the browser's own style hides it:
        // its content renders and measures itself before showModal(), as in a <div>
        display: 'flex',
        flexDirection: 'column',
      },

      // centred, but never above or left of the viewport, so a modal larger than the screen keeps its header on it
      left(actualWidth) {
        return `max(0px, calc(50vw - ${actualWidth / 2}px))`;
      },
      top(_actualWidth, actualHeight) {
        return `max(0px, calc(50vh - ${actualHeight / 2}px))`;
      },
      header: args?.header,
      trapFocus: true,
    } as IDialogArgs;

    const ref = this._openDialog<TData, TResult>(getViewRef, data, a, new GlobalStackOptions(), true);
    return ref;
  }

  /**
   * Asks the user to accept or cancel, in a modal with `title` as its header, and resolves `true` when they accept.
   * `autofocus` names the button focus goes to as it opens; without it, focus goes to the cancel button. On the server,
   * where no one can answer, it resolves `false` at once, so a guard or a resolver that awaits it doesn't hold the
   * render.
   */
  async openConfirmationMessageDialog(
    title: string,
    message: string,
    color: 'error' | 'primary' | 'secondary',
    acceptBtnText: string | undefined,
    cancelBtnText: string | undefined,
    autofocus: 'accept' | 'cancel' | undefined,
    args?: IConfirmationDialogArgs,
  ): Promise<boolean> {
    if (!this.isBrowser) {
      return false;
    }
    const modalArgs = {
      ...(args ?? {}),
      header: { title, allowClose: true },
    } as IModalArgs;
    return new Promise(resolve => {
      const data: IConfirmationDialogData = {
        content: message,
        color,
        autofocus,
        acceptBtnText,
        cancelBtnText,
        contentTemplate: undefined,
        contentTemplateContext: undefined,
      };
      const dialogRef = this.openModal<ConfirmationDialogComponent, IConfirmationDialogData, boolean>(ConfirmationDialogComponent, data, modalArgs);
      dialogRef.closed$.subscribe(result => {
        resolve(result ?? false);
      });
    });
  }

  /**
   * Asks the user to accept or cancel, in a modal with `title` as its header and `template` as its content, and resolves `true` when they accept.
   * `autofocus` names the button focus goes to as it opens; without it, the template's first element in the Tab order,
   * else the cancel button. On the server, where no one can answer, it resolves `false` at once, so a guard or a
   * resolver that awaits it doesn't hold the render.
   */
  async openConfirmationTemplateDialog<TContext>(
    title: string,
    template: TemplateRef<TContext>,
    templateContext: TContext,
    color: 'error' | 'primary' | 'secondary',
    acceptBtnText: string | undefined,
    cancelBtnText: string | undefined,
    autofocus: 'accept' | 'cancel' | undefined,
    args?: IConfirmationDialogArgs,
  ): Promise<boolean> {
    if (!this.isBrowser) {
      return false;
    }
    const modalArgs = {
      ...(args ?? {}),
      header: { title, allowClose: true },
    } as IModalArgs;
    return new Promise(resolve => {
      const data: IConfirmationDialogData = {
        content: undefined,
        color,
        autofocus,
        acceptBtnText,
        cancelBtnText,
        contentTemplate: template,
        contentTemplateContext: templateContext,
      };

      const dialogRef = this.openModal<ConfirmationDialogComponent, IConfirmationDialogData, boolean>(ConfirmationDialogComponent, data, modalArgs);
      dialogRef.closed$.subscribe(result => {
        resolve(result ?? false);
      });
    });
  }

  readonly startZIndex = 100;
  readonly zIndexStep = 10;
  private readonly zIndex = this.startZIndex;

  dialogStack: {
    dialogRef: IDialogRef;
    zIndex: number;
    args: IDialogArgs;
  }[] = [];

  /**
   * Shows a template in a dialog that `args` sets up. With `GlobalStackOptions`, the default, it goes into
   * `$overlayHost()`: opened while a modal is open, it sits in that modal and closes with it. It is a `<div>`, not a
   * modal: `args.label` names nothing here. With `trapFocus`, Tab and Shift+Tab move through its elements and wrap at
   * either end, and focus goes back where it was when it closes; the page's own Tab order stays as it is.
   */
  openTemplateDialog<TContext, TResult>(contentTemplate: TemplateRef<TContext>, args: IDialogArgs, contentTemplateContext: TContext, stackOptions: StackOptions = new GlobalStackOptions()) {
    return this._openDialog<TContext, TResult>((injector: Injector) => contentTemplate.createEmbeddedView(contentTemplateContext, injector), contentTemplateContext, args, stackOptions);
  }

  /**
   * Shows a component in a dialog that `args` sets up. With `GlobalStackOptions`, the default, it goes into
   * `$overlayHost()`: opened while a modal is open, it sits in that modal and closes with it. It is a `<div>`, not a
   * modal: `args.label` names nothing here. With `trapFocus`, Tab and Shift+Tab move through its elements and wrap at
   * either end, and focus goes back where it was when it closes; the page's own Tab order stays as it is.
   */
  openDialog<TComponent, TData, TResult>(component: Type<TComponent>, data: TData, args: IDialogArgs = {}, stackOptions: StackOptions = new GlobalStackOptions()): DialogRef<TResult> {
    return this._openDialog<TData, TResult>((injector: Injector) => this.createView(component, injector), data, args, stackOptions);
  }
  private _openDialog<TData, TResult>(
    getViewRef: (injector: Injector) => ViewRef,
    data: TData,
    args: IDialogArgs = {},
    stackOptions: StackOptions = new GlobalStackOptions(),
    modal = false,
  ): DialogRef<TResult> {
    if (!this.isBrowser) {
      // a dialog that is never shown; closing it still tells its caller
      return new DialogRefInternal<TResult>();
    }
    // A dialog with GlobalStackOptions, and its backdrop, go into the topmost modal while one is open, so it sits above
    // the modal's content and is part of the modal: a modal shown in the top layer covers what is outside it, inert. A
    // modal stays in the body, a sibling of the one below, which the top layer stacks above it; nested, it would close
    // with the modal that opened it, as a wizard's next step does when it closes the step before
    const host = modal ? this.document.body : (this.modals.at(-1)?.layer ?? this.document.body);
    // where focus goes back to when a modal closes
    const opener = modal ? this.focusedElement() : null;
    // A non-modal dialog that keeps focus, such as a menu, takes it from the page as it opens; a modal's <dialog> keeps
    // focus in itself
    const trappedFocus = !modal && args.trapFocus === true ? this.trapFocus() : undefined;
    const dialogRef = new DialogRefInternal<TResult>();
    // calculate new zIndex
    let { zIndex } = this;
    if (this.dialogStack.length > 0) {
      zIndex = this.dialogStack[this.dialogStack.length - 1].zIndex + this.zIndexStep;
    }
    // push this dialog to the new stack
    this.dialogStack.push({ dialogRef, zIndex, args });

    // Set the backdrop; a modal's is its <dialog>'s ::backdrop
    const backdrop = modal ? undefined : this.createBackdrop(args, dialogRef, zIndex - 1, stackOptions, host);
    this.listenForKeys();

    // Create an injector that provides the DialogRef
    const injector = Injector.create({
      providers: [
        { provide: TAB_DIALOG_REF, useValue: dialogRef },
        { provide: TAB_DATA_REF, useValue: data },
      ],
      parent: this.injector,
    });

    // Create the component view
    const componentView = getViewRef(injector);
    // Attach component to the application
    this.appRef.attachView(componentView);

    // Create a container for the dialog
    const { dialogElement, headerIcon } = this.createDialogElement(componentView, args, injector, dialogRef, zIndex, modal);
    // the tooltip directive reads it from the DialogRef openDialog returns, to give the tooltip its role, id and pointer;
    // the service reads it to find the dialogs inside another
    dialogRef.dialogElement = dialogElement;

    // always insert element after the backdrop
    if (backdrop) {
      backdrop?.insertAdjacentElement('afterend', dialogElement);
    } else if (stackOptions instanceof LocalStackOptions) {
      stackOptions.insertAfterElement.insertAdjacentElement('afterend', dialogElement);
    } else {
      host.appendChild(dialogElement);
    }
    // A modal's overlays go in a layer at the top of its container (_dialog.service.scss), so a layer of the content
    // with a z-index of its own, such as a sticky toolbar or a map's panes, never covers them
    let overlayLayer: HTMLElement | undefined = undefined;
    if (modal) {
      overlayLayer = this.document.createElement('div');
      overlayLayer.classList.add('dialog-overlay-layer');
      dialogElement.appendChild(overlayLayer);
    }

    // Handle container position and window resize event
    dialogRef.reposition = (getArgs: (originalArgs: IDialogPositionAndSizeArgs) => void) => {
      getArgs(args);
      DialogService.calculateAndSetPosition(dialogElement, args, stackOptions);
    };
    const resizeSubscription = DialogService.manageDialogPosition(dialogElement, args, stackOptions);
    const modalSubscription = dialogElement instanceof HTMLDialogElement ? this.listenToModal(dialogElement, dialogRef, args) : undefined;

    // Handle dialog close
    dialogRef.closed$.subscribe(() => {
      // first the dialogs inside it, so none stays on the stack without its element or takes the next Escape
      this.closeDialogsInside(dialogRef, dialogElement);
      // A modal opened from this dialog and still open, such as a confirmation a menu's item opens before the menu
      // closes, gives focus back where this dialog would have: the menu's own focus return finds the page inert under
      // the modal, and the modal's opener goes with the menu
      if (trappedFocus) {
        for (const open of this.modals) {
          if (open.opener && dialogElement.contains(open.opener)) {
            open.opener = trappedFocus.focusedElement;
          }
        }
      }
      // focus goes back only from the topmost modal, never behind one still open
      let focusBack: HTMLElement | null = null;
      if (overlayLayer) {
        const modalIndex = this.modals.findIndex(open => open.dialogRef === dialogRef);
        if (modalIndex !== -1) {
          const [closing] = this.modals.splice(modalIndex, 1);
          const above = this.modals.slice(modalIndex);
          // A modal opened from this one and still open, as a wizard's next step is, gives focus back where this one
          // would have, since its own opener goes with this modal
          for (const open of above) {
            if (open.opener && dialogElement.contains(open.opener)) {
              open.opener = closing.opener;
            }
          }
          if (above.length === 0) {
            focusBack = closing.opener;
          }
        }
        const next = this.modals.at(-1)?.layer ?? null;
        this.$host.set(next);
        // What the app or the snack service put in the modal's layer goes on to the next host, before focus goes back,
        // which may be to a button in a snack; the layer goes with the modal
        for (const child of Array.from(overlayLayer.children)) {
          (next ?? this.document.body).appendChild(child);
        }
      }
      modalSubscription?.unsubscribe();
      if (resizeSubscription) {
        resizeSubscription.unsubscribe();
      }
      // the application may be gone first, when the app is destroyed with the dialog open, and its views with it
      if (!this.appRef.destroyed) {
        this.appRef.detachView(componentView);
      }
      if (!componentView.destroyed) {
        componentView.destroy();
      }
      // the header's close icon is a view of its own, attached to the application
      if (headerIcon && !headerIcon.hostView.destroyed) {
        headerIcon.destroy();
      }
      // a modal leaves the top layer with its element, and the page under it is no longer inert
      dialogElement.remove();

      const dialogIndex = this.dialogStack.findIndex(d => d.zIndex === zIndex);
      if (dialogIndex !== -1) {
        this.dialogStack.splice(dialogIndex, 1);
      }
      // clear backdrop
      backdrop?.remove();
      this.listenForKeys();
      // give focus back to the element focused before the dialog opened
      if (trappedFocus) {
        this.restoreFocus(trappedFocus);
      }
      if (focusBack?.isConnected === true) {
        focusBack.focus();
      }
    });

    if (dialogElement instanceof HTMLDialogElement) {
      this.showModal(dialogElement, overlayLayer!, componentView, dialogRef, opener);
    }
    return dialogRef;
  }

  // Shows a modal once its content has rendered, so the element focus goes to is there and focus moves once
  private showModal(dialog: HTMLDialogElement, layer: HTMLElement, view: ViewRef, dialogRef: IDialogRef, opener: HTMLElement | null) {
    // Overlays opened from now on go into it, those its content opens as it renders included, such as a dialog from its
    // ngOnInit or the tooltip of a field it focuses: the closed <dialog> is laid out, and they show with it. Its close
    // takes it out of the open modals again, during the render too
    const open: OpenModal = { dialogRef, layer, opener };
    this.modals.push(open);
    this.$host.set(layer);
    this.rendering++;
    try {
      view.detectChanges();
    } catch (error) {
      // as an error in the content's first render at the application's next tick would be, and the modal still shows
      this.injector.get(ErrorHandler).handleError(error);
    } finally {
      this.rendering--;
    }
    open.reveal = () => {
      open.reveal = undefined;
      // unless it closed meanwhile
      if (dialog.isConnected) {
        this.reveal(dialog, layer);
      }
    };
    // A modal opened as another's content rendered, such as a confirmation from its ngOnInit, shows once that one has,
    // above it, in the order they opened
    if (this.rendering === 0) {
      for (const modal of [...this.modals]) {
        modal.reveal?.();
      }
    }
  }

  // The browser's own focusing steps for a <dialog> focus its first [autofocus] element, else its first focusable one,
  // the header's close button, so the service marks the element its order picks
  private reveal(dialog: HTMLDialogElement, layer: HTMLElement) {
    const target = this.initialFocus(dialog, layer);
    const mark = !target.hasAttribute('autofocus');
    if (mark) {
      target.setAttribute('autofocus', '');
    }
    try {
      dialog.showModal();
    } finally {
      if (mark) {
        target.removeAttribute('autofocus');
      }
    }
    // an [autofocus] element before it, where the content focused another as it rendered, took the browser's focus
    if (this.document.activeElement !== target) {
      target.focus();
    }
  }

  // The element focus goes to as a modal opens: one its content focused as it rendered, the content's first focusable
  // [autofocus] element, its first element in the Tab order, the header's close button, else the modal itself. The
  // <dialog> is laid out while closed, off the screen, since its container style shows it, so the Tab order is found
  // as it will be once it shows
  private initialFocus(dialog: HTMLDialogElement, layer: HTMLElement): HTMLElement {
    const header = dialog.querySelector<HTMLElement>(':scope > .dialog-header');
    const inContent = (element: Element) => element !== dialog && header?.contains(element) !== true && !layer.contains(element);
    const focused = this.document.activeElement;
    if (focused instanceof HTMLElement && dialog.contains(focused) && inContent(focused)) {
      return focused;
    }
    const autofocus = Array.from(dialog.querySelectorAll<HTMLElement>('[autofocus]')).find(element => inContent(element) && isFocusable(element));
    if (autofocus) {
      return autofocus;
    }
    const first = tabbable(dialog).find(inContent);
    if (first instanceof HTMLElement) {
      return first;
    }
    return header?.querySelector<HTMLElement>('.dialog-close') ?? dialog;
  }

  // A modal's close requests, its backdrop, and a close the page didn't ask for
  private listenToModal(dialog: HTMLDialogElement, dialogRef: IDialogRef, args: IDialogArgs): Subscription {
    const subscription = new Subscription();
    // A close request other than Escape, whose keydown the service cancels, such as a back gesture or requestClose():
    // it closes what Escape would close in this modal, a dropdown in it first, and nothing where Escape closes nothing.
    // The browser closes the modal anyway when the request can't be cancelled, without a user's action since the last
    subscription.add(
      fromEvent(dialog, 'cancel').subscribe(e => {
        e.preventDefault();
        this.escapeTarget(entry => {
          const element = (entry.dialogRef as DialogRefInternal<unknown>).dialogElement;
          return element !== undefined && dialog.contains(element);
        })?.dialogRef.close();
      }),
    );
    // closed with dialog.close(), or by a close request the page couldn't cancel: its DialogRef closes with it, and the
    // dialogs it hosts
    subscription.add(
      fromEvent(dialog, 'close').subscribe(() => {
        dialogRef.close();
      }),
    );
    // A press on the ::backdrop targets the <dialog> outside its box. The press and its click must both be there, so a
    // text selection dragged out of the modal, a click on its border or in its own area, and a press on an overlay it
    // hosts, drawn past its box, all keep it open; a press on the backdrop of a modal opened from it targets that one
    if (args.closeOnBackdropClick === true) {
      const outside = (e: MouseEvent) => {
        const box = dialog.getBoundingClientRect();
        return e.target === dialog && (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom);
      };
      let pressed = false;
      subscription.add(
        fromEvent<PointerEvent>(dialog, 'pointerdown').subscribe(e => {
          pressed = outside(e);
        }),
      );
      subscription.add(
        fromEvent<MouseEvent>(dialog, 'click').subscribe(e => {
          if (pressed && outside(e)) {
            dialogRef.close();
          }
          pressed = false;
        }),
      );
    }
    return subscription;
  }

  // Closes the dialogs whose element is inside this dialog's, top first: the overlays a modal hosts, a select's list in
  // a dialog. One a closing dialog opens meanwhile is inside too, and closes as well
  private closeDialogsInside(dialogRef: IDialogRef, dialogElement: HTMLElement) {
    const closed = new Set<IDialogRef>([dialogRef]);
    for (;;) {
      const inside = [...this.dialogStack].reverse().find(entry => !closed.has(entry.dialogRef) && dialogElement.contains((entry.dialogRef as DialogRefInternal<unknown>).dialogElement));
      if (!inside) {
        return;
      }
      closed.add(inside.dialogRef);
      inside.dialogRef.close();
    }
  }

  private createBackdrop(args: IDialogArgs, dialogRef: IDialogRef, dialogZIndex: number, stackOptions: StackOptions, host: HTMLElement): HTMLDivElement | undefined {
    if (args.skipCreatingBackdrop === true) {
      return undefined;
    }
    const backdrop = this.document.createElement('div');
    backdrop.classList.add('dialog-backdrop');
    backdrop.style.zIndex = (dialogZIndex - 1).toString();
    if (args.backdropCss) {
      Object.keys(args.backdropCss).forEach(key => {
        (backdrop.style as unknown as Record<string, string>)[key] = args.backdropCss![key];
      });
    }
    if (stackOptions instanceof LocalStackOptions) {
      stackOptions.insertAfterElement.insertAdjacentElement('afterend', backdrop);
    } else {
      host.appendChild(backdrop);
    }
    if (args.closeOnBackdropClick === true) {
      backdrop.onclick = () => {
        dialogRef.close();
      };
    }
    return backdrop;
  }

  // The window's keydown, while a dialog is open: Escape, and Tab in a dialog that keeps focus
  escapeSubscription: Subscription | null = null;

  // An app destroyed with dialogs open closes them, top first: their backdrops, DOM, observers and listeners go, and
  // the page is no longer inert
  ngOnDestroy(): void {
    for (const { dialogRef } of [...this.dialogStack].reverse()) {
      dialogRef.close();
    }
    this.escapeSubscription?.unsubscribe();
    this.escapeSubscription = null;
  }

  // One listener on the window, in the bubble phase, while a dialog is open: a handler of the app's on an element or on
  // the document runs first, and can keep a dialog open by cancelling the key
  private listenForKeys() {
    if (this.dialogStack.length === 0) {
      this.escapeSubscription?.unsubscribe();
      this.escapeSubscription = null;
      return;
    }
    this.escapeSubscription ??= fromEvent<KeyboardEvent>(this.document.defaultView!, 'keydown').subscribe(e => {
      if (e.key === 'Escape') {
        this.onEscape(e);
      } else if (e.key === 'Tab') {
        this.keepFocusIn(e);
      }
    });
  }

  // Escape closes the top dialog that closes on Escape. It skips a key the app cancelled, and one from a date or time
  // input, which can reach the page as the input's own picker closes. While a modal is open it cancels the key, which
  // stops the browser's own close request for the <dialog>, so a modal that ignores Escape stays open however often it
  // is pressed
  private onEscape(e: KeyboardEvent) {
    if (e.defaultPrevented) {
      return;
    }
    const target = isPicker(e.target) ? undefined : this.escapeTarget();
    if (target) {
      e.preventDefault();
      target.dialogRef.close();
    } else if (this.modals.length > 0) {
      e.preventDefault();
    }
  }

  // The dialog Escape closes, of those `include` takes: the top one that closes on Escape. One above it with no
  // backdrop that ignores Escape, such as a tooltip, lets the key through; one with a backdrop that ignores Escape, a
  // modal's ::backdrop included, keeps the ones below it open
  private escapeTarget(include: (entry: (typeof this.dialogStack)[number]) => boolean = () => true) {
    for (const entry of [...this.dialogStack].reverse()) {
      if (!include(entry)) {
        continue;
      }
      if (entry.args.closeOnEscape === true) {
        return entry;
      }
      if (entry.args.skipCreatingBackdrop !== true) {
        return undefined;
      }
    }
    return undefined;
  }

  // Tab and Shift+Tab keep focus in the top dialog that keeps it, such as a menu, and in the dialogs opened above it
  // outside it, such as an app's dialog a menu item opens while the menu stays open. The browser moves focus within
  // each, a date input's own fields included; the service steps in only at an end, where Tab goes on to the next
  // dialog's first element, wrapping from the last to the first, and Shift+Tab back, and where focus is outside them
  // all. The page's own tabindex stays as it is, so a Tab stop the page moves meanwhile, as a button toggle's does when
  // its value changes, stays where the page put it. A modal's <dialog> keeps focus by itself, since the browser makes
  // the rest inert
  private keepFocusIn(e: KeyboardEvent) {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || isPicker(e.target)) {
      return;
    }
    const element = (entry: (typeof this.dialogStack)[number]) => (entry.dialogRef as DialogRefInternal<unknown>).dialogElement;
    const topIndex = this.dialogStack.map(entry => entry.args.trapFocus === true).lastIndexOf(true);
    if (topIndex === -1 || element(this.dialogStack[topIndex]) instanceof HTMLDialogElement) {
      return;
    }
    // the dialog and those above it, each once: a select's list in a menu is part of the menu
    const regions: HTMLElement[] = [];
    for (const entry of this.dialogStack.slice(topIndex)) {
      const candidate = element(entry);
      if (!regions.some(region => region.contains(candidate))) {
        regions.push(candidate);
      }
    }
    const stops = regions.map(region => tabbable(region));
    if (stops.every(own => own.length === 0)) {
      e.preventDefault();
      return;
    }
    const active = this.document.activeElement;
    const at = regions.findIndex(region => active instanceof Node && region.contains(active));
    const own = at === -1 ? [] : stops[at];
    // the regions after this one, or before it for Shift+Tab, wrapping round to it
    const order = e.shiftKey ? [...stops.slice(0, at).reverse(), ...stops.slice(at).reverse()] : [...stops.slice(at + 1), ...stops.slice(0, at + 1)];
    let next: FocusableElement | undefined;
    if (at === -1) {
      const all = stops.flat();
      next = e.shiftKey ? all.at(-1) : all[0];
    } else if (own.length === 0 || active === (e.shiftKey ? own[0] : own.at(-1))) {
      const following = order.find(stopsOf => stopsOf.length > 0)!;
      next = e.shiftKey ? following.at(-1) : following[0];
    }
    if (next) {
      e.preventDefault();
      next.focus();
    }
  }

  private createView<TComponent>(component: Type<TComponent>, injector: Injector): ViewRef {
    const componentRef: ComponentRef<TComponent> = createComponent(component, {
      environmentInjector: this.environmentInjector,
      elementInjector: injector,
    });
    return componentRef.hostView;
  }

  private createDialogElement(
    viewRef: ViewRef,
    args: IDialogArgs,
    injector: Injector,
    dialogRef: IDialogRef,
    zIndex: number,
    modal: boolean,
  ): { dialogElement: HTMLElement; headerIcon: ComponentRef<IconComponent> | undefined } {
    const embeddedViewRef = viewRef as EmbeddedViewRef<unknown>;
    let headerIcon: ComponentRef<IconComponent> | undefined = undefined;

    // A modal is a <dialog>, which showModal() shows in the top layer as a modal dialog. It takes focus itself when
    // nothing in it does
    const dialogElement = this.document.createElement(modal ? 'dialog' : 'div');
    dialogElement.classList.add('dialog-container');
    dialogElement.style.zIndex = zIndex.toString();
    if (modal) {
      dialogElement.tabIndex = -1;
    }
    for (const rootNode of embeddedViewRef.rootNodes) {
      dialogElement.appendChild(rootNode as Node);
    }

    if (args.containerCss) {
      Object.keys(args.containerCss).forEach(key => {
        (dialogElement.style as unknown as Record<string, string>)[key] = args.containerCss![key];
      });
    }
    if (args.header) {
      const headerElement = this.document.createElement('div');
      headerElement.classList.add('dialog-header');
      const titleElement = this.document.createElement('div');
      titleElement.classList.add('dialog-title');
      // the title is text: callers build it from their data, so it must never be parsed as HTML
      titleElement.textContent = args.header.title;
      // a modal's name
      if (modal) {
        titleElement.id = generateRandomString();
        dialogElement.setAttribute('aria-labelledby', titleElement.id);
      }
      headerElement.appendChild(titleElement);
      if (args.header.allowClose) {
        // A button, so a screen reader says what it is and Enter and Space press it; its labelled icon names it
        const closeButton = this.document.createElement('button');
        closeButton.type = 'button';
        closeButton.classList.add('dialog-close');
        closeButton.addEventListener('click', () => {
          dialogRef.close();
        });
        headerIcon = createComponent(IconComponent, {
          environmentInjector: this.environmentInjector,
          elementInjector: injector,
        });
        headerIcon.setInput('value', 'close');
        headerIcon.setInput('label', 'Close');
        this.appRef.attachView(headerIcon.hostView);
        // rendered now, so the button has its name when a modal shows and focuses it
        headerIcon.changeDetectorRef.detectChanges();
        closeButton.appendChild(headerIcon.location.nativeElement as HTMLElement);
        headerElement.appendChild(closeButton);
      }
      dialogElement.insertBefore(headerElement, dialogElement.firstChild);
    } else if (modal && args.label !== undefined && args.label.trim() !== '') {
      // a modal without a header is named by its label; one with no words names nothing
      dialogElement.setAttribute('aria-label', args.label);
    }
    return { dialogElement, headerIcon };
  }

  private static manageDialogPosition(dialogElement: HTMLElement, args: IDialogPositionAndSizeArgs, stackOptions: StackOptions): Subscription | null {
    // Temporarily position the dialog offscreen to get its dimensions
    dialogElement.style.top = '-9999px';
    dialogElement.style.left = '-9999px';

    setTimeout(() => {
      DialogService.calculateAndSetPosition(dialogElement, args, stackOptions);
    }, 10);

    let resizeSubscription: Subscription | null = null;

    // Handle window resize event
    resizeSubscription = fromEvent(dialogElement.ownerDocument.defaultView!, 'resize').subscribe(() => {
      DialogService.calculateAndSetPosition(dialogElement, args, stackOptions);
    });
    // and any scroll, of the page or a container, which moves the element a dropdown or menu is placed from
    const scrollSubscription = fromEvent(dialogElement.ownerDocument, 'scroll', { capture: true, passive: true }).subscribe(() => {
      DialogService.calculateAndSetPosition(dialogElement, args, stackOptions);
    });

    // Monitor changes to the size of the dialog
    const resizeObserver = new ResizeObserver(() => {
      DialogService.calculateAndSetPosition(dialogElement, args, stackOptions);
    });

    // Start observing the dialog element
    resizeObserver.observe(dialogElement);

    // Monitor changes to the size of the insertAfterElement
    const insertAfterResizeObserver = new ResizeObserver(() => {
      DialogService.calculateAndSetPosition(dialogElement, args, stackOptions);
    });
    // Start observing the referenceElement if it exists
    const referenceElement = this.getReferenceElement(stackOptions);
    if (referenceElement) {
      insertAfterResizeObserver.observe(referenceElement);
    }
    // Return a subscription-like object that also disconnects the observer
    return new Subscription(() => {
      resizeObserver.disconnect();
      resizeSubscription?.unsubscribe();
      scrollSubscription.unsubscribe();
      insertAfterResizeObserver.disconnect();
    });
  }
  private static getReferenceElement(stackOptions: StackOptions): HTMLElement | undefined {
    if (stackOptions instanceof LocalStackOptions) {
      return stackOptions.referenceElement ?? stackOptions.insertAfterElement;
    } else if (stackOptions instanceof GlobalStackOptions) {
      return stackOptions.referenceElement;
    }
    return undefined;
  }
  private static calculateAndSetPosition(dialogElement: HTMLElement, args: IDialogPositionAndSizeArgs, stackOptions: StackOptions) {
    const referenceElement = this.getReferenceElement(stackOptions);
    const referenceElementRect = referenceElement?.getBoundingClientRect();
    const getWidthHeight = (name: string, defaultValue: string, value: string | ((referenceElementRect: DOMRect) => string | undefined) | undefined) => {
      if (value === undefined) {
        return defaultValue;
      } else if (typeof value === 'function') {
        if (!referenceElementRect) {
          throw new Error(`When using a function for ${name}, insertAfterElement must be provided.`);
        }
        return value(referenceElementRect) ?? defaultValue;
      } else {
        return value;
      }
    };

    dialogElement.style.minWidth = getWidthHeight('minWidth', 'auto', args.minWidth);
    dialogElement.style.minHeight = getWidthHeight('minHeight', '0', args.minHeight);
    dialogElement.style.width = getWidthHeight('width', 'fit-content', args.width);
    dialogElement.style.height = getWidthHeight('height', 'fit-content', args.height);
    dialogElement.style.maxWidth = getWidthHeight('maxWidth', 'none', args.maxWidth);
    dialogElement.style.maxHeight = getWidthHeight('maxHeight', 'none', args.maxHeight);

    dialogElement.style.overflowX = 'hidden';
    dialogElement.style.overflowY = 'hidden';
    const actualWidth = dialogElement.offsetWidth;
    const actualHeight = dialogElement.offsetHeight;

    const getTopLeft = (name: string, value: string | ((actualWidth: number, actualHeight: number, referenceElementRect?: DOMRect) => string | undefined) | undefined) => {
      if (value === undefined) {
        return 'auto';
      } else if (typeof value === 'function') {
        return value(actualWidth, actualHeight, referenceElementRect) ?? 'auto';
      } else {
        return value;
      }
    };
    dialogElement.style.top = getTopLeft('top', args.top);
    dialogElement.style.left = getTopLeft('left', args.left);

    // if dialog is higher than the available page height, set it to scroll
    const view = dialogElement.ownerDocument.defaultView!;
    if (actualHeight + dialogElement.offsetTop > view.innerHeight) {
      dialogElement.style.height = `calc(100vh - ${dialogElement.offsetTop}px)`;
      dialogElement.style.overflowY = 'auto';
    }
    // if dialog is wider than the available page width, set it to scroll
    if (actualWidth + dialogElement.offsetLeft > view.innerWidth) {
      dialogElement.style.width = `calc(100vw - ${dialogElement.offsetLeft}px)`;
      dialogElement.style.overflowX = 'auto';
    }
  }

  // The element that has focus, none for the body
  private focusedElement(): HTMLElement | null {
    const { activeElement } = this.document;
    return activeElement instanceof HTMLElement && activeElement !== this.document.body ? activeElement : null;
  }

  // A non-modal dialog that keeps focus takes it from the page as it opens, and gives it back as it closes; Tab keeps
  // it in the dialog (keepFocusIn)
  private trapFocus(): { focusedElement: HTMLElement | null } {
    const focusedElement = this.focusedElement();
    focusedElement?.blur();
    return { focusedElement };
  }
  private restoreFocus(trapped: { focusedElement: HTMLElement | null }) {
    trapped.focusedElement?.focus();
  }
}
