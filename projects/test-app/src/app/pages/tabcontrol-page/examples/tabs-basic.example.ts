import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TableauUiTabgroupModule } from 'tableau-ui-angular/tab-group';

@Component({
  selector: 'app-tabs-basic-example',
  imports: [TableauUiTabgroupModule],
  templateUrl: './tabs-basic.example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsBasicExampleComponent {
  // afterActivate runs once a tab's content shows, in the browser
  protected readonly $activated = signal('none yet');
}
