import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { DialogService, GlobalStackOptions, injectDialogRef } from 'tableau-ui-angular/dialog';
import { SnackService } from 'tableau-ui-angular/snack';
import { TableauUiTooltipModule } from 'tableau-ui-angular/tooltip';

// A note the modal opens below its button with openDialog
@Component({
  selector: 'app-example-note',
  template: `<p>This dialog sits in the modal, and closes with it.</p>`,
  styles: `
    :host {
      display: block;
      padding: 0 1rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleNoteComponent {}

// The modal's content: a tooltip, a snack and a dialog opened from here sit in the modal, above its content
@Component({
  selector: 'app-example-overlays-dialog',
  imports: [TableauUiButtonModule, TableauUiTooltipModule],
  template: `
    <p>Each overlay opened from this modal sits in it, above its content.</p>
    <div class="buttons">
      <button tooltip="A tooltip in the modal">Tooltip</button>
      <button (click)="snack()">Show a snack</button>
      <button (click)="note($event)">Open a dialog</button>
      <button color="primary" (click)="close()">Close</button>
    </div>
  `,
  styles: `
    :host {
      display: block;
      padding: 0 1.5rem 1rem;
    }

    .buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleOverlaysDialogComponent {
  private readonly dialogs = inject(DialogService);
  private readonly snacks = inject(SnackService);
  private readonly dialogRef = injectDialogRef();

  // It shows until the user closes it, and goes back to the page when the modal closes
  protected snack() {
    this.snacks.openSnack('This snack sits in the modal while it is open', 0, 'info');
  }

  // Placed below the button; a click outside it or Escape closes it, and so does the modal closing
  protected note(event: MouseEvent) {
    this.dialogs.openDialog(
      ExampleNoteComponent,
      undefined,
      {
        closeOnBackdropClick: true,
        closeOnEscape: true,
        containerCss: {
          backgroundColor: 'var(--twc-color-base)',
          border: '1px solid var(--twc-color-border-light)',
          boxShadow: 'var(--twc-dialog-box-shadow)',
        },
        top: (width, height, rect) => `${rect!.bottom + 4}px`,
        left: (width, height, rect) => `${rect!.left}px`,
      },
      new GlobalStackOptions(event.currentTarget as HTMLElement),
    );
  }

  protected close() {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-dialog-overlays-example',
  imports: [TableauUiButtonModule],
  templateUrl: './dialog-overlays.example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogOverlaysExampleComponent {
  private readonly dialogs = inject(DialogService);

  protected open() {
    this.dialogs.openModal(ExampleOverlaysDialogComponent, undefined, {
      width: '28rem',
      header: { title: 'Overlays in a modal', allowClose: true },
    });
  }
}
