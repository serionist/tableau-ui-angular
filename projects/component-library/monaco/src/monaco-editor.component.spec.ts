import { ChangeDetectionStrategy, Component, ErrorHandler, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import type MonacoNamespace from 'monaco-editor';
import { axeViolations } from '../../testing/axe';
import { TableauUiMonacoModule } from './tableau-ui-monaco.module';
import type { ICodeEditor, MonacoConstructionOptions } from './types';

type Monaco = typeof MonacoNamespace;
interface AmdRequire {
  (modules: string[], onLoad: () => void, onError?: (error: unknown) => void): void;
  config?: (config: { paths: Record<string, string> }) => void;
}
type MonacoWindow = Window & { monaco?: Monaco; require?: AmdRequire };
const page = window as MonacoWindow;

// Monaco's AMD build, which an app serves at monaco-edit/vs; the specs load it from node_modules themselves
const MONACO_VS = '/node_modules/monaco-editor/min/vs';

async function loadMonacoFromNodeModules(): Promise<Monaco> {
  if (!page.monaco) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `${MONACO_VS}/loader.js`;
      script.addEventListener('load', () => {
        resolve();
      });
      script.addEventListener('error', () => {
        reject(new Error(`${script.src} did not load`));
      });
      document.body.appendChild(script);
    });
    const amdRequire = page.require!;
    amdRequire.config!({ paths: { vs: MONACO_VS } });
    await new Promise<void>((resolve, reject) => {
      amdRequire(['vs/editor/editor.main'], resolve, reject);
    });
  }
  return page.monaco!;
}

let documents = 0;

// Monaco's word highlighter leaves a promise that rejects, unhandled, with "Canceled" when its editor is disposed while
// a highlight waits, as each test's teardown does right after it types or moves the editor to another model
const QUIET: MonacoConstructionOptions = { occurrencesHighlight: 'off' };

@Component({
  imports: [ReactiveFormsModule, TableauUiMonacoModule],
  template: `
    <tab-monaco-editor
      [formControl]="control"
      [uri]="$uri()"
      language="plaintext"
      [options]="$options()"
      [disposeModelOnDestroy]="$disposeModels()"
      (editorLoaded)="loaded.push($event)"
      style="height: 6rem"
    />
    <button type="button">Next</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class EditorHostComponent {
  readonly control = new FormControl<string | null>('first');
  // Monaco keeps its models for the page, by URI, so each editor gets a document of its own
  readonly $uri = signal(`file:///spec/${++documents}.txt`);
  readonly $options = signal<MonacoConstructionOptions>(QUIET);
  readonly $disposeModels = signal(true);
  readonly loaded: ICodeEditor[] = [];
}

// An editor bound to the page's own text, not to a form
@Component({
  imports: [TableauUiMonacoModule],
  template: `<tab-monaco-editor [uri]="uri" language="plaintext" [options]="quiet" [value]="$text()" (valueChange)="changes.push($event)" (editorLoaded)="loaded.push($event)" style="height: 6rem" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class BoundEditorComponent {
  readonly uri = `file:///spec/${++documents}.txt`;
  readonly quiet = QUIET;
  readonly $text = signal('bound');
  readonly changes: string[] = [];
  readonly loaded: ICodeEditor[] = [];
}

function create() {
  const fixture = TestBed.createComponent(EditorHostComponent);
  fixture.autoDetectChanges();
  return fixture;
}

describe('MonacoEditorComponent', () => {
  // These run first, while the page has no Monaco: it loads once for the page, and each editor waits for that load
  describe('loading Monaco', () => {
    // I13: a loader that failed left every editor blank, and nothing said why
    it("reports a failed load to the app's ErrorHandler once, and the next editor tries again", async () => {
      expect(page.monaco).toBeUndefined();
      const handleError = vi.fn();
      TestBed.configureTestingModule({ providers: [{ provide: ErrorHandler, useValue: { handleError } }] });

      // the test server has nothing at monaco-edit/vs, where the editor looks by default
      const [first, second] = [create(), create()];
      await vi.waitFor(() => {
        expect(handleError).toHaveBeenCalledTimes(1);
      });
      expect(String(handleError.mock.calls[0][0])).toContain('/monaco-edit/vs/loader.js');
      expect([first.componentInstance.loaded, second.componentInstance.loaded]).toEqual([[], []]);

      create();
      await vi.waitFor(() => {
        expect(handleError).toHaveBeenCalledTimes(2);
      });
    });

    // F127: an editor destroyed while Monaco was still loading was created once it loaded, and its model leaked
    it('creates no editor for one destroyed while Monaco loads', async () => {
      expect(page.monaco).toBeUndefined();
      // Monaco's AMD loader already on the page, holding editor.main until the test lets it go
      let finishLoad: (() => void) | undefined;
      const configure = vi.fn();
      page.require = Object.assign(
        (_modules: string[], onLoad: () => void) => {
          finishLoad = onLoad;
        },
        { config: configure },
      );
      const fixture = create();
      const uri = fixture.componentInstance.$uri();
      await vi.waitFor(() => {
        expect(finishLoad).toBeDefined();
      });
      expect(configure).toHaveBeenCalledWith({ paths: { vs: `${location.origin}/monaco-edit/vs` } });

      fixture.destroy();
      delete page.require;
      const monaco = await loadMonacoFromNodeModules();
      const editors = monaco.editor.getEditors().length;
      finishLoad!();
      await new Promise(resolve => setTimeout(resolve));

      expect(monaco.editor.getEditors().length).toBe(editors);
      expect(monaco.editor.getModel(monaco.Uri.parse(uri))).toBeNull();
      expect(fixture.componentInstance.loaded).toEqual([]);
    });
  });

  describe('with Monaco loaded', () => {
    let monaco: Monaco;
    beforeAll(async () => {
      monaco = await loadMonacoFromNodeModules();
    });

    async function render(fixture = create()) {
      await vi.waitFor(() => {
        expect(fixture.componentInstance.loaded.length).toBe(1);
      });
      const { control, loaded } = fixture.componentInstance;
      const values: (string | null)[] = [];
      control.valueChanges.subscribe(value => values.push(value));
      return { fixture, control, values, editor: loaded[0], host: fixture.nativeElement as HTMLElement };
    }

    const type = (editor: ICodeEditor, text: string) => {
      editor.trigger('keyboard', 'type', { text });
    };

    it("shows the form's value, and passes axe", async () => {
      const { host, editor } = await render();

      expect(editor.getValue()).toBe('first');
      expect(await axeViolations(host)).toEqual([]);
    });

    // F120: a form's write came back from Monaco as the user's change: the form turned dirty and emitted it twice
    it("takes a form's writes without reporting them back as the user's", async () => {
      const { fixture, control, values, editor } = await render();

      control.patchValue('second');
      await fixture.whenStable();
      expect(editor.getValue()).toBe('second');

      control.reset();
      await fixture.whenStable();
      expect(editor.getValue()).toBe('');

      expect(values).toEqual(['second', null]);
      expect(control.dirty).toBe(false);
    });

    it("reports the user's typing to the form, in the order typed, and is touched when the user leaves", async () => {
      const { fixture, control, values, editor, host } = await render();

      editor.focus();
      for (const key of ['a', 'b', 'c']) {
        type(editor, key);
        await fixture.whenStable();
      }
      host.querySelector('button')!.focus();

      expect(editor.getValue()).toBe('abcfirst');
      expect(values).toEqual(['afirst', 'abfirst', 'abcfirst']);
      expect(control.dirty).toBe(true);
      expect(control.touched).toBe(true);
    });

    it("emits valueChange for the user's typing, not for a change of the bound value", async () => {
      const fixture = TestBed.createComponent(BoundEditorComponent);
      fixture.autoDetectChanges();
      const { loaded, changes, $text } = fixture.componentInstance;
      await vi.waitFor(() => {
        expect(loaded.length).toBe(1);
      });

      $text.set('rebound');
      await fixture.whenStable();
      expect(loaded[0].getValue()).toBe('rebound');

      type(loaded[0], 'x');
      await fixture.whenStable();
      expect(changes).toEqual(['xrebound']);
    });

    // F123: the editor had no setDisabledState, so a disabled control's editor still took typing
    it('is read-only while its control is disabled', async () => {
      const { fixture, control, editor } = await render();
      const readOnly = () => editor.getOption(monaco.editor.EditorOption.readOnly);

      control.disable();
      await fixture.whenStable();
      expect(readOnly()).toBe(true);
      type(editor, 'x');
      expect(editor.getValue()).toBe('first');

      control.enable();
      await fixture.whenStable();
      expect(readOnly()).toBe(false);
      type(editor, 'x');
      expect(editor.getValue()).toBe('xfirst');

      // an editor its options make read-only stays so
      fixture.componentInstance.$options.set({ ...QUIET, readOnly: true });
      control.disable();
      control.enable();
      await fixture.whenStable();
      expect(fixture.componentInstance.loaded.at(-1)!.getOption(monaco.editor.EditorOption.readOnly)).toBe(true);
    });

    // F124: rebuilding the editor inside the options effect made that effect track the value, so after one change of
    // options every keystroke rebuilt the editor
    it('rebuilds the editor once for a change of options, and not on the keystrokes after it', async () => {
      const { fixture, control } = await render();
      const { loaded } = fixture.componentInstance;

      fixture.componentInstance.$options.set({ ...QUIET, lineNumbers: 'off' });
      await fixture.whenStable();
      expect(loaded.length).toBe(2);

      type(loaded[1], 'x');
      await fixture.whenStable();
      type(loaded[1], 'y');
      await fixture.whenStable();

      expect(loaded.length).toBe(2);
      expect(loaded[1].getValue()).toBe('xyfirst');
      expect(control.value).toBe('xyfirst');
    });

    // F126: the old document stayed in Monaco's models for the page after the editor moved to another URI
    it('disposes the old model when the URI changes, unless the app keeps its models', async () => {
      const { fixture, editor } = await render();
      const { $uri, $disposeModels } = fixture.componentInstance;
      const model = (uri: string) => monaco.editor.getModel(monaco.Uri.parse(uri));
      const first = $uri();

      $uri.set(`file:///spec/${++documents}.txt`);
      await fixture.whenStable();
      expect(model(first)).toBeNull();
      expect(editor.getModel()!.uri.toString()).toBe($uri());
      expect(editor.getValue()).toBe('first');

      $disposeModels.set(false);
      const second = $uri();
      $uri.set(`file:///spec/${++documents}.txt`);
      await fixture.whenStable();
      expect(model(second)).not.toBeNull();
      model(second)!.dispose();
    });

    // The server has no window: the editor read it after its view, so a page with an editor could not prerender
    it('renders on the server without loading or creating an editor', async () => {
      const editors = monaco.editor.getEditors().length;
      const globals = globalThis as { ngServerMode?: boolean };
      // Angular's own flag for server rendering, which afterNextRender reads
      globals.ngServerMode = true;
      try {
        const fixture = create();
        await fixture.whenStable();
        await new Promise(resolve => setTimeout(resolve));

        expect(fixture.componentInstance.loaded).toEqual([]);
        expect(monaco.editor.getEditors().length).toBe(editors);
      } finally {
        delete globals.ngServerMode;
      }
    });
  });
});
