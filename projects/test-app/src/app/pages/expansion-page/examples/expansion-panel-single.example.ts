import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiCheckboxModule } from 'tableau-ui-angular/checkbox';
import { TableauUiExpansionPanelModule } from 'tableau-ui-angular/expansion-panel';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
import { SnackService } from 'tableau-ui-angular/snack';

@Component({
  selector: 'app-expansion-panel-single-example',
  imports: [TableauUiButtonModule, TableauUiCheckboxModule, TableauUiExpansionPanelModule, TableauUiIconModule],
  templateUrl: './expansion-panel-single.example.html',
  styleUrl: './expansion-panel-single.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpansionPanelSingleExampleComponent {
  private readonly snacks = inject(SnackService);

  protected readonly $firstOpen = signal(false);

  // A click in the title toggles the panel: the button keeps its own click from reaching it
  protected run(event: Event) {
    event.stopPropagation();
    this.snacks.openSnack('The button ran, and the panel stayed as it was', 3000, 'info');
  }
}
