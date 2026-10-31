import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiTreeModule } from 'tableau-ui-angular/tree';

@Component({
  selector: 'app-tree-flat-example',
  imports: [TableauUiTreeModule],
  templateUrl: './tree-flat.example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeFlatExampleComponent {}
