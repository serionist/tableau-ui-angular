import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiTreeModule } from 'tableau-ui-angular/tree';

interface TreeItem {
  name: string;
  children: TreeItem[];
}

const leaf = (name: string): TreeItem => ({ name, children: [] });

@Component({
  selector: 'app-tree-basic-example',
  imports: [TableauUiTreeModule],
  templateUrl: './tree-basic.example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeBasicExampleComponent {
  protected readonly nodes: TreeItem[] = [
    {
      name: 'Node 1',
      children: [
        { name: 'Subnode 1.1', children: [leaf('Subnode 1.1.1'), leaf('Subnode 1.1.2'), leaf('Subnode 1.1.3')] },
        { name: 'Subnode 1.2', children: [leaf('Subnode 1.2.1'), leaf('Subnode 1.2.2')] },
        leaf('Subnode 1.3'),
      ],
    },
    {
      name: 'Node 2',
      children: [{ name: 'Subnode 2.1', children: [leaf('Subnode 2.1.1'), leaf('Subnode 2.1.2')] }, leaf('Subnode 2.2')],
    },
    leaf('Node 3'),
  ];
}
