import type { DocsExample } from '../../docs/docs-example';
import { TreeBasicExampleComponent } from './examples/tree-basic.example';
import basicHtml from './examples/tree-basic.example.html?source' with { loader: 'text' };
import basicTs from './examples/tree-basic.example.ts?source' with { loader: 'text' };
import { TreeComponentExampleComponent } from './examples/tree-component.example';
import componentHtml from './examples/tree-component.example.html?source' with { loader: 'text' };
import componentTs from './examples/tree-component.example.ts?source' with { loader: 'text' };
import { TreeContentExampleComponent } from './examples/tree-content.example';
import contentHtml from './examples/tree-content.example.html?source' with { loader: 'text' };
import contentTs from './examples/tree-content.example.ts?source' with { loader: 'text' };
import { TreeFlatExampleComponent } from './examples/tree-flat.example';
import flatHtml from './examples/tree-flat.example.html?source' with { loader: 'text' };
import flatTs from './examples/tree-flat.example.ts?source' with { loader: 'text' };
import { TreeLinesExampleComponent } from './examples/tree-lines.example';
import linesHtml from './examples/tree-lines.example.html?source' with { loader: 'text' };
import linesScss from './examples/tree-lines.example.scss?source' with { loader: 'text' };
import linesTs from './examples/tree-lines.example.ts?source' with { loader: 'text' };
import { TreeStyledExampleComponent } from './examples/tree-styled.example';
import styledHtml from './examples/tree-styled.example.html?source' with { loader: 'text' };
import styledScss from './examples/tree-styled.example.scss?source' with { loader: 'text' };
import styledTs from './examples/tree-styled.example.ts?source' with { loader: 'text' };

// The tree page's samples, each with the text of its files
export const TREE_EXAMPLES = {
  basic: { component: TreeBasicExampleComponent, ts: basicTs, html: basicHtml },
  lines: { component: TreeLinesExampleComponent, ts: linesTs, html: linesHtml, scss: linesScss },
  styled: { component: TreeStyledExampleComponent, ts: styledTs, html: styledHtml, scss: styledScss },
  content: { component: TreeContentExampleComponent, ts: contentTs, html: contentHtml },
  flat: { component: TreeFlatExampleComponent, ts: flatTs, html: flatHtml },
  component: { component: TreeComponentExampleComponent, ts: componentTs, html: componentHtml },
} satisfies Record<string, DocsExample>;
