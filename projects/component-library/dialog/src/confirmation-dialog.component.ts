import type { AfterViewInit, Signal, TemplateRef } from '@angular/core';
import { ChangeDetectionStrategy, Component, ElementRef, inject, viewChild } from '@angular/core';
import { generateRandomString } from 'tableau-ui-angular/utils';
import { injectDialogRef } from './dialog.ref';
import { injectDialogData, TAB_DATA_REF } from './data.ref';
@Component({
  selector: 'tab-confirmation-dialog',
  standalone: false,
  template: `
    <div class="dialog-content" [id]="contentId">
      @if (data.contentTemplate) {
        <div>
          <ng-container *ngTemplateOutlet="data.contentTemplate; context: data.contentTemplateContext" />
        </div>
      } @else {
        <div>{{ data.content }}</div>
      }
    </div>
    <div class="dialog-actions">
      <button #cancel tabindex="0" (click)="dialogRef.close(false)">
        {{ data.cancelBtnText ?? 'Cancel' }}
      </button>
      <button #accept tabindex="0" [color]="data.color" (click)="dialogRef.close(true)">
        {{ data.acceptBtnText ?? 'OK' }}
      </button>
    </div>
  `,
  styles: `
    .dialog-content {
      padding: 12px 18px;
    }
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1em;
      padding: 12px;
      padding-top: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationDialogComponent implements AfterViewInit {
  protected data = inject<IConfirmationDialogData>(TAB_DATA_REF);

  protected readonly data2 = injectDialogData<IConfirmationDialogData>();

  protected dialogRef = injectDialogRef<boolean>();

  // the message, which describes the modal
  protected readonly contentId = generateRandomString();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly $accept: Signal<ElementRef<HTMLElement>> = viewChild.required('accept', { read: ElementRef });
  private readonly $cancel: Signal<ElementRef<HTMLElement>> = viewChild.required('cancel', { read: ElementRef });

  // In the first render, which the dialog service runs in the modal's <dialog> before showModal(), the message comes to
  // describe the <dialog>, so a screen reader reads it with the button focus goes to, and the button `autofocus`
  // names takes the attribute: the browser focuses it as the modal opens, and focus moves once. Lint refuses the
  // attribute in a template outside a <dialog> element, which this one is in only once the service has placed it
  ngAfterViewInit() {
    this.host.nativeElement.closest('dialog')?.setAttribute('aria-describedby', this.contentId);
    const { autofocus } = this.data;
    if (autofocus) {
      (autofocus === 'accept' ? this.$accept() : this.$cancel()).nativeElement.setAttribute('autofocus', '');
    }
  }
}

export class IConfirmationDialogData<T = unknown> {
  content: string | undefined;
  contentTemplate: TemplateRef<T> | undefined;
  contentTemplateContext: T | undefined;
  color: 'error' | 'primary' | 'secondary' = 'secondary';
  acceptBtnText: string | undefined;
  cancelBtnText: string | undefined;
  autofocus: 'accept' | 'cancel' | undefined;
}
