import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiTabgroupModule } from 'tableau-ui-angular/tab-group';

@Component({
  selector: 'app-tabs-narrow-example',
  imports: [TableauUiTabgroupModule],
  templateUrl: './tabs-narrow.example.html',
  styleUrl: './tabs-narrow.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsNarrowExampleComponent {
  protected readonly tabs = ['First', 'Second', 'Third', 'Fourth', 'Fifth'];
}
