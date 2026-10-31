import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TableauUiTreeModule } from 'tableau-ui-angular/tree';

// A component that holds tree nodes: inside a tab-tree, its nodes find the tree
@Component({
  selector: 'app-tree-folder',
  imports: [TableauUiTreeModule],
  template: `
    <tab-tree-node>
      <span>{{ $name() }}</span>
      @for (file of $files(); track file) {
        <tab-tree-node>
          <span>{{ file }}</span>
        </tab-tree-node>
      }
    </tab-tree-node>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeFolderComponent {
  readonly $name = input.required<string>({ alias: 'name' });
  readonly $files = input.required<string[]>({ alias: 'files' });
}

@Component({
  selector: 'app-tree-component-example',
  imports: [TableauUiTreeModule, TreeFolderComponent],
  templateUrl: './tree-component.example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeComponentExampleComponent {}
