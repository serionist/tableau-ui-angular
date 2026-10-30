import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { DialogService, injectDialogData, injectDialogRef } from 'tableau-ui-angular/dialog';
import { SnackService } from 'tableau-ui-angular/snack';

// The dialog's content: any component, which gets its data and its dialog through inject
@Component({
  selector: 'app-example-dialog',
  imports: [TableauUiButtonModule],
  template: `
    <h2>Example dialog</h2>
    <p>{{ message }}</p>
    <div class="buttons">
      <button (click)="openAnother()">Open another dialog</button>
      <button color="primary" (click)="close()">Close</button>
    </div>
  `,
  styles: `
    :host {
      display: block;
      padding: 1em 2em;
    }

    .buttons {
      display: flex;
      gap: 0.5rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleDialogComponent {
  private readonly dialogs = inject(DialogService);
  private readonly dialogRef = injectDialogRef<string>();
  protected readonly message = injectDialogData<string>();

  protected close() {
    this.dialogRef.close('Closed with the Close button');
  }

  // A dialog can open another above it; Escape closes the top one
  protected openAnother() {
    this.dialogs.openModal(ExampleDialogComponent, 'Another dialog', { height: 'auto' });
  }
}

@Component({
  selector: 'app-dialog-custom-example',
  imports: [TableauUiButtonModule],
  templateUrl: './dialog-custom.example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogCustomExampleComponent {
  private readonly dialogs = inject(DialogService);
  private readonly snacks = inject(SnackService);

  // No buttons of its own: the content closes the dialog, with a result, and the header's close button closes it without one
  protected open() {
    const dialogRef = this.dialogs.openModal<ExampleDialogComponent, string, string>(ExampleDialogComponent, 'This message is the dialog data', {
      width: 'calc(100vw - 100px)',
      maxWidth: '300px',
      height: 'fit-content',
      closeOnBackdropClick: true,
      header: {
        title: 'A custom dialog',
        allowClose: true,
      },
    });
    dialogRef.closed$.subscribe(result => {
      this.snacks.openSnack(result ?? 'Closed without a result', 2000, 'info');
    });
  }
}
