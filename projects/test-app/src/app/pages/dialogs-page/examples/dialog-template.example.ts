import type { TemplateRef } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiCheckboxModule } from 'tableau-ui-angular/checkbox';
import { DialogService } from 'tableau-ui-angular/dialog';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
import { SnackService } from 'tableau-ui-angular/snack';

@Component({
  selector: 'app-dialog-template-example',
  imports: [TableauUiButtonModule, TableauUiCheckboxModule, TableauUiIconModule],
  templateUrl: './dialog-template.example.html',
  styleUrl: './dialog-template.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogTemplateExampleComponent {
  private readonly dialogs = inject(DialogService);
  private readonly snacks = inject(SnackService);

  // The template is the dialog's content, under its title and above its buttons, here with texts of their own
  protected async confirm(template: TemplateRef<unknown>, color: 'error' | 'primary' | 'secondary') {
    const accepted = await this.dialogs.openConfirmationTemplateDialog('Publish the workbook?', template, undefined, color, 'Custom Accept', 'Custom Cancel', 'accept', {
      width: '500px',
    });
    this.snacks.openSnack(accepted ? 'Accepted' : 'Cancelled', 2000, 'info');
  }
}
