import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiTabgroupModule } from 'tableau-ui-angular/tab-group';

@Component({
  selector: 'app-tabs-header-example',
  imports: [TableauUiTabgroupModule],
  templateUrl: './tabs-header.example.html',
  styleUrl: './tabs-header.example.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsHeaderExampleComponent {}
