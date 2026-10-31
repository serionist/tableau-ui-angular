import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiTreeModule } from 'tableau-ui-angular/tree';

@Component({
  selector: 'app-tree-content-example',
  imports: [TableauUiTreeModule],
  templateUrl: './tree-content.example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeContentExampleComponent {}
