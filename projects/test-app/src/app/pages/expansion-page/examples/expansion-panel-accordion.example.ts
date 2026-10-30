import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TableauUiButtonModule } from 'tableau-ui-angular/button';
import { TableauUiExpansionPanelModule } from 'tableau-ui-angular/expansion-panel';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
import { SnackService } from 'tableau-ui-angular/snack';

@Component({
  selector: 'app-expansion-panel-accordion-example',
  imports: [TableauUiButtonModule, TableauUiExpansionPanelModule, TableauUiIconModule],
  templateUrl: './expansion-panel-accordion.example.html',
  styleUrl: './expansion-panel-accordion.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpansionPanelAccordionExampleComponent {
  private readonly snacks = inject(SnackService);

  // A click in the title toggles the panel: the button keeps its own click from reaching it
  protected track(event: Event) {
    event.stopPropagation();
    this.snacks.openSnack('Tracking order 1024', 3000, 'info');
  }
}
