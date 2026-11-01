import type { ComponentRef, EmbeddedViewRef, TemplateRef, Type, ViewRef } from '@angular/core';
import { ApplicationRef, createComponent, DOCUMENT, effect, EnvironmentInjector, inject, Injectable, Injector, PLATFORM_ID, untracked } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DialogService } from 'tableau-ui-angular/dialog';
import { SnackRef, TAB_SNACK_REF } from './snack.ref';
import type { SnackComponentData } from './snack.component';
import { SnackComponent } from './snack.component';
import { TAB_SNACK_DATA_REF } from './data.ref';

// How long a snack's live region is in the page, empty, before the snack moves into it: a screen reader announces a
// change to a region it already knows, not a region added with its text
const ANNOUNCE_DELAY_MS = 150;

// Styles for the snack container are in _snack.service.scss in the styles folder
// One for the app: the snacks share the page's containers, whatever injector opened them
@Injectable({
  providedIn: 'root',
})
export class SnackService {
  private readonly injector = inject(Injector);
  private readonly appRef = inject(ApplicationRef);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly document = inject(DOCUMENT);
  // The server shows no snack: it has no one to tell, and a snack rendered there would stay in the page, since the
  // browser renders the app again
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly dialogService = inject(DialogService);

  // The snacks sit in the topmost modal while one is open, so they show above it and take clicks: the stacks move in
  // when a modal opens, and the dialog service hands them on to the next host when it closes
  private readonly followOverlayHost = effect(() => {
    const host = this.dialogService.$overlayHost();
    if (this.isBrowser) {
      untracked(() => {
        this.document.querySelectorAll<HTMLElement>('.tab-snacks').forEach(stack => {
          this.place(stack, host);
        });
      });
    }
  });

  openSnack(message: string, duration: number | undefined = 5000, type: 'error' | 'info' | 'success' = 'info', location: 'bottom' | 'top' = 'top'): SnackRef<boolean> {
    return this.openSnackComponent<SnackComponent<unknown>, SnackComponentData<unknown>, boolean>(
      SnackComponent,
      {
        type,
        message,
        contentTemplate: undefined,
        contentTemplateContext: undefined,
      },
      duration,
      type,
      location,
    );
  }

  openSnackWithAction(
    message: string,
    actionLabel: string,
    action: (s: SnackRef<boolean>) => void,
    duration: number | undefined = 5000,
    type: 'error' | 'info' | 'success' = 'info',
    location: 'bottom' | 'top' = 'top',
  ): SnackRef<boolean> {
    return this.openSnackComponent<SnackComponent<unknown>, SnackComponentData<unknown>, boolean>(
      SnackComponent,
      {
        type,
        message,
        actionLink: actionLabel,
        action: action,
        contentTemplate: undefined,
        contentTemplateContext: undefined,
      },
      duration,
      type,
      location,
    );
  }
  openSnackFromTemplate<TContext>(
    template: TemplateRef<TContext>,
    templateContext?: TContext,
    duration: number | undefined = 5000,
    type: 'error' | 'info' | 'success' = 'info',
    location: 'bottom' | 'top' = 'top',
  ) {
    return this.openSnackComponent<SnackComponent<TContext>, SnackComponentData<TContext>, boolean>(
      SnackComponent,
      {
        type,
        message: undefined,
        contentTemplate: template,
        contentTemplateContext: templateContext,
      },
      duration,
      type,
      location,
    );
  }

  openSnackComponent<TComponent, TData, TResult>(
    component: Type<TComponent>,
    data: TData,
    duration: number | undefined = 5000,
    type: 'error' | 'info' | 'success' = 'info',
    location: 'bottom' | 'top' = 'top',
  ): SnackRef<TResult> {
    const snackRef = new SnackRef<TResult>();
    if (!this.isBrowser) {
      // a snack that is never shown; closing it still tells its caller
      return snackRef;
    }
    const { document } = this;
    // check if snack container exists
    let container = document.querySelector(`.tab-snacks.${location} .snack-container`);
    let tabSnacks = container?.parentElement;
    if (!container || !tabSnacks) {
      tabSnacks = document.createElement('div');
      tabSnacks.classList.add('tab-snacks', location);
      container = document.createElement('div');
      container.classList.add('snack-container');
      tabSnacks.appendChild(container);
    }
    // in the topmost modal, or the body; read untracked, so an effect that opens a snack doesn't run again as modals
    // open and close
    this.place(tabSnacks, untracked(this.dialogService.$overlayHost));

    // create the snack wrapper
    const snackWrapper = document.createElement('div');
    snackWrapper.classList.add('snack-wrapper', type);

    // A live region, so a screen reader announces the snack: assertive for an error, polite otherwise
    const live = document.createElement('div');
    live.classList.add('snack-live');
    live.setAttribute('role', type === 'error' ? 'alert' : 'status');
    live.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
    live.setAttribute('aria-atomic', 'true');
    snackWrapper.appendChild(live);

    // Create an injector that provides the SnackRef
    const injector = Injector.create({
      providers: [
        { provide: TAB_SNACK_REF, useValue: snackRef },
        { provide: TAB_SNACK_DATA_REF, useValue: data },
      ],
      parent: this.injector,
    });

    // Create the component view
    const componentView = this.createView(component, injector);
    // Attach component to the application
    this.appRef.attachView(componentView);

    // shown at once, beside the live region, and moved into it once the region is known
    const componentElement = (componentView as EmbeddedViewRef<unknown>).rootNodes[0] as HTMLElement;
    snackWrapper.appendChild(componentElement);
    const announceTimer = setTimeout(() => {
      // the move takes focus from a button in the snack, so it goes back
      const { activeElement } = document;
      const focused = activeElement instanceof HTMLElement && componentElement.contains(activeElement) ? activeElement : null;
      live.appendChild(componentElement);
      focused?.focus();
    }, ANNOUNCE_DELAY_MS);

    // add timer if needed
    let timer: HTMLElement | undefined;
    if (duration > 0) {
      timer = document.createElement('div');
      timer.classList.add('timer');
      timer.style.transitionDuration = `${duration}ms`;
      snackWrapper.appendChild(timer);
    }
    if (location === 'top') {
      container.appendChild(snackWrapper);
    } else {
      container.insertBefore(snackWrapper, container.firstChild);
    }

    const getMargin = () => {
      const height = snackWrapper.offsetHeight + 3;
      if (location === 'top') {
        return `-${height}px 0 3px 0`;
      } else {
        return `3px 0 -${height}px 0`;
      }
    };
    snackWrapper.style.margin = getMargin();

    const showTimer = setTimeout(() => {
      snackWrapper.style.transition = 'margin 200ms ease-in-out, opacity 200ms ease-in-out';
      if (location === 'top') {
        snackWrapper.style.marginTop = '0';
      } else {
        snackWrapper.style.marginBottom = '0';
      }
      snackWrapper.style.opacity = '1';
    }, 1);

    // Remove snack after duration, which waits while the pointer or focus is on it, so the user can read it and reach
    // its buttons
    const countdown =
      duration > 0
        ? SnackService.countdown(snackWrapper, timer!, duration, () => {
            snackRef.close(undefined);
          })
        : undefined;

    snackRef.closed$.subscribe(() => {
      clearTimeout(announceTimer);
      clearTimeout(showTimer);
      countdown?.stop();
      snackWrapper.style.margin = getMargin();
      snackWrapper.style.opacity = '0';
      setTimeout(() => {
        snackWrapper.remove();
        // destroyed, not only detached, so the snack's component and what it holds are let go
        componentView.destroy();
      }, 200);
    });

    return snackRef;
  }

  // Moves a snack stack into the overlay host, the body for none, unless it is there already
  private place(stack: HTMLElement, host: HTMLElement | null) {
    const parent = host ?? this.document.body;
    if (stack.parentElement !== parent) {
      parent.appendChild(stack);
    }
  }

  /**
   * Calls `done` after `duration` ms, and shrinks the timer bar with it. The countdown waits while the pointer is over
   * the snack or focus is in it, and goes on from where it was when both have left.
   */
  private static countdown(snack: HTMLElement, bar: HTMLElement, duration: number, done: () => void): { stop: () => void } {
    const holds = new Set<'focus' | 'pointer'>();
    let remaining = duration;
    // false until the snack is drawn, when the bar starts shrinking
    let started = false;
    let startedAt = 0;
    let closeTimer: ReturnType<typeof setTimeout> | undefined = undefined;
    const run = () => {
      startedAt = Date.now();
      bar.style.transitionDuration = `${remaining}ms`;
      bar.style.width = '0';
      closeTimer = setTimeout(done, remaining);
    };
    const hold = (reason: 'focus' | 'pointer') => {
      if (holds.size === 0 && closeTimer !== undefined) {
        clearTimeout(closeTimer);
        closeTimer = undefined;
        remaining = Math.max(0, remaining - (Date.now() - startedAt));
        // the bar stops where it is
        bar.style.width = snack.ownerDocument.defaultView!.getComputedStyle(bar).width;
        bar.style.transitionDuration = '0ms';
      }
      holds.add(reason);
    };
    const release = (reason: 'focus' | 'pointer') => {
      holds.delete(reason);
      if (holds.size === 0 && started && closeTimer === undefined) {
        run();
      }
    };
    const onPointerEnter = () => {
      hold('pointer');
    };
    const onPointerLeave = () => {
      release('pointer');
    };
    const onFocusIn = () => {
      hold('focus');
    };
    const onFocusOut = (e: FocusEvent) => {
      if (!(e.relatedTarget instanceof Node && snack.contains(e.relatedTarget))) {
        release('focus');
      }
    };
    snack.addEventListener('mouseenter', onPointerEnter);
    snack.addEventListener('mouseleave', onPointerLeave);
    snack.addEventListener('focusin', onFocusIn);
    snack.addEventListener('focusout', onFocusOut);
    const startTimer = setTimeout(() => {
      started = true;
      if (holds.size === 0) {
        run();
      }
    }, 1);
    return {
      stop: () => {
        clearTimeout(startTimer);
        clearTimeout(closeTimer);
        snack.removeEventListener('mouseenter', onPointerEnter);
        snack.removeEventListener('mouseleave', onPointerLeave);
        snack.removeEventListener('focusin', onFocusIn);
        snack.removeEventListener('focusout', onFocusOut);
      },
    };
  }

  private createView<TComponent>(component: Type<TComponent>, injector: Injector): ViewRef {
    const componentRef: ComponentRef<TComponent> = createComponent(component, {
      environmentInjector: this.environmentInjector,
      elementInjector: injector,
    });
    return componentRef.hostView;
  }
}
