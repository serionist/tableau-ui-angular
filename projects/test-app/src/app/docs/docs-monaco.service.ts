import { DOCUMENT, inject, Injectable, InjectionToken, signal } from '@angular/core';
import type MonacoNamespace from 'monaco-editor';
import type { CodeToken } from './docs-code-colours';
import { codeTokens } from './docs-code-colours';

type Monaco = typeof MonacoNamespace;

// Monaco's AMD loader, as its loader.js defines it
interface AmdRequire {
  (modules: string[], onLoad: () => void, onError: (error: unknown) => void): void;
  config?: (config: { paths: Record<string, string> }) => void;
}
type MonacoWindow = Window & { monaco?: Monaco; require?: AmdRequire };

/** Where the site serves Monaco's AMD build, under its base href: the `monaco-edit` asset in angular.json */
export const MONACO_VS_PATH = 'monaco-edit/vs';

/** The path of Monaco's AMD build, from the page's base href; a spec points it at files that are missing */
export const DOCS_MONACO_VS = new InjectionToken<string>('DOCS_MONACO_VS', { providedIn: 'root', factory: () => MONACO_VS_PATH });

// The same files, AMD loader and globals as the library's Monaco editor, so the editor and the code blocks share one
// Monaco, whichever starts it: Monaco on the page, its loader, or the editor's loader script on its way is used as it
// is. A second loader.js would throw, since it declares a constant of the page's.
async function loadMonaco(view: MonacoWindow, vs: string): Promise<Monaco> {
  return new Promise<Monaco>((resolve, reject) => {
    if (view.monaco) {
      resolve(view.monaco);
      return;
    }
    const loadEditor = () => {
      const amdRequire = view.require;
      if (typeof amdRequire?.config !== 'function') {
        reject(new Error(`${vs}/loader.js defined no AMD loader`));
        return;
      }
      amdRequire.config({ paths: { vs } });
      amdRequire(
        ['vs/editor/editor.main'],
        () => {
          if (view.monaco) {
            resolve(view.monaco);
          } else {
            reject(new Error(`${vs}/editor/editor.main.js defined no monaco`));
          }
        },
        reject,
      );
    };
    if (typeof view.require?.config === 'function') {
      loadEditor();
      return;
    }
    const src = `${vs}/loader.js`;
    // with no AMD loader yet, a loader script on the page has not run: the editor's, on its way, which this waits for,
    // or one that failed, after which the blocks stay plain
    const onItsWay = Array.from(view.document.scripts).find(element => element.src === src);
    const script = onItsWay ?? view.document.createElement('script');
    script.addEventListener('load', loadEditor);
    script.addEventListener('error', () => {
      reject(new Error(`${src} did not load`));
    });
    if (!onItsWay) {
      script.src = src;
      view.document.body.appendChild(script);
    }
  });
}

/**
 * Monaco for the docs site's code blocks, which colour their text with its tokens. It loads once for the page, in the
 * browser, when the first block comes within a screen of the viewport, so a page whose code is further down loads it
 * only when the reader gets there. If it fails to load, the blocks stay plain text.
 */
@Injectable({ providedIn: 'root' })
export class DocsMonacoService {
  private readonly document = inject(DOCUMENT);
  private readonly vsPath = inject(DOCS_MONACO_VS);
  private readonly $loaded = signal<Monaco | undefined>(undefined);
  private loading: Promise<void> | undefined;
  private observer: IntersectionObserver | undefined;
  private json: Promise<void> | undefined;

  /** Monaco once it has loaded; undefined until then, on the server, and when it failed */
  readonly $monaco = this.$loaded.asReadonly();

  /** Loads Monaco when this block is on screen or within a screen of it; call it in the browser. Returns the unwatch */
  watch(block: Element): () => void {
    const view = this.document.defaultView;
    if (this.loading || !view) {
      return () => undefined;
    }
    if (typeof view.IntersectionObserver !== 'function') {
      this.load(view);
      return () => undefined;
    }
    this.observer ??= new view.IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          this.load(view);
        }
      },
      // the document as root, so the margin is a screen of this page's own, in a frame too
      { root: view.document, rootMargin: '100% 0px' },
    );
    this.observer.observe(block);
    return () => this.observer?.unobserve(block);
  }

  /** The text's tokens in this Monaco language; undefined when Monaco has not loaded */
  async tokens(text: string, language: string): Promise<CodeToken[] | undefined> {
    const monaco = this.$loaded();
    if (!monaco) {
      return undefined;
    }
    if (language === 'json') {
      await (this.json ??= this.startJson(monaco));
    }
    // colorize resolves once the language's tokenizer has loaded, and those of the languages it holds, such as the
    // CSS in an HTML file's style element; tokenize then has them all
    await monaco.editor.colorize(text, language, {});
    return codeTokens(monaco.editor.tokenize(text, language), text);
  }

  private load(view: MonacoWindow) {
    this.observer?.disconnect();
    this.observer = undefined;
    if (this.loading) {
      return;
    }
    const base = this.document.head.getElementsByTagName('base').item(0)?.href ?? `${view.location.origin}/`;
    this.loading = loadMonaco(view, new URL(this.vsPath, base).href).then(
      monaco => {
        this.$loaded.set(monaco);
      },
      (error: unknown) => {
        console.warn('The code blocks stay plain text: Monaco did not load.', error);
      },
    );
  }

  // JSON's tokenizer comes with its language features, which Monaco starts for the language's first model: a model
  // made and dropped starts them, and the AMD loader answers once their module has run
  private async startJson(monaco: Monaco): Promise<void> {
    monaco.editor.createModel('', 'json').dispose();
    const amdRequire = (this.document.defaultView as MonacoWindow).require!;
    await new Promise<void>(resolve => {
      amdRequire(['vs/language/json/jsonMode'], resolve, () => {
        resolve();
      });
    });
  }
}
