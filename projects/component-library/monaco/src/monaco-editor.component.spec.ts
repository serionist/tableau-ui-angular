import { ChangeDetectionStrategy, Component, ErrorHandler, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import type MonacoNamespace from 'monaco-editor';
import { axeViolations } from '../../testing/axe';
import { MonacoEditorComponent } from './monaco-editor.component';
import { TableauUiMonacoModule } from './tableau-ui-monaco.module';
import type { ICodeEditor, MonacoConstructionOptions } from './types';

type Monaco = typeof MonacoNamespace;
interface AmdRequire {
  (modules: string[], onLoad: () => void, onError?: (error: unknown) => void): void;
  config?: (config: { paths: Record<string, string> }) => void;
  reset?: () => void;
}
// The page's globals Monaco's AMD build defines; Node's types give require another type
interface MonacoGlobals {
  monaco?: Monaco;
  require?: AmdRequire;
}
const page = window as unknown as MonacoGlobals;

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
      (valueChange)="changes.push($event)"
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
  readonly changes: string[] = [];
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

// An editor two-way bound to the page's own text, which also listens to valueChange
@Component({
  imports: [TableauUiMonacoModule],
  template: `<tab-monaco-editor [uri]="uri" language="plaintext" [options]="quiet" [(value)]="$text" (valueChange)="changes.push($event)" (editorLoaded)="loaded.push($event)" style="height: 6rem" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TwoWayEditorComponent {
  readonly uri = `file:///spec/${++documents}.txt`;
  readonly quiet = QUIET;
  readonly $text = signal('two-way');
  readonly changes: string[] = [];
  readonly loaded: ICodeEditor[] = [];
  readonly $editor = viewChild.required(MonacoEditorComponent);
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

    // Electron or NW.js with Node's require on the page: the editor fetches loader.js and runs it beside Node's
    // require. A file: URL, as a packaged app's, answers a request that loaded with status 0
    it('runs a loader.js its request fetched with status 0, as from a file: URL', async () => {
      expect(page.monaco).toBeUndefined();
      const handleError = vi.fn();
      TestBed.configureTestingModule({ providers: [{ provide: ErrorHandler, useValue: { handleError } }] });
      const configure = vi.fn();
      const globals = window as unknown as Record<string, unknown>;
      // the AMD loader the fetched loader.js defines, which has no editor.main to give
      globals['testAmdLoader'] = Object.assign(
        (_modules: string[], _onLoad: () => void, onError: (error: unknown) => void) => {
          onError(new Error('no editor.main here'));
        },
        { config: configure },
      );
      // Node's require, which has no config
      page.require = (() => undefined) as AmdRequire;
      class FileRequest extends EventTarget {
        readonly status = 0;
        readonly responseText = 'require = window.testAmdLoader;';
        open() {
          // the request is answered on send
        }
        send() {
          setTimeout(() => this.dispatchEvent(new Event('load')));
        }
      }
      vi.stubGlobal('XMLHttpRequest', FileRequest);
      try {
        create();
        await vi.waitFor(() => {
          expect(handleError).toHaveBeenCalledTimes(1);
        });

        expect(configure).toHaveBeenCalledWith({ paths: { vs: `${location.origin}/monaco-edit/vs` } });
        expect(String(handleError.mock.calls[0][0])).toContain('/monaco-edit/vs/editor/editor.main.js');
      } finally {
        vi.unstubAllGlobals();
        delete globals['require'];
        delete globals['testAmdLoader'];
        // the fetched script's own globals, declared with var, which can't be deleted
        globals['monacoAmdRequire'] = undefined;
        globals['nodeRequire'] = undefined;
      }
    });

    // Monaco's AMD loader keeps a module that failed as failed, so after editor.main failed once every later editor
    // got that failure at once and stayed blank until a reload. F127: an editor destroyed while Monaco was still
    // loading was created once it loaded, and its model leaked
    it('fetches editor.main again after it failed, and creates no editor for one destroyed while it loads', { timeout: 30_000 }, async () => {
      expect(page.monaco).toBeUndefined();
      const handleError = vi.fn();
      TestBed.configureTestingModule({ providers: [{ provide: ErrorHandler, useValue: { handleError } }] });
      // Monaco's AMD loader as loader.js defines it: editor.main fails the first time, and a module that failed answers
      // with that failure until reset(); after that it loads when the test lets it go
      let failed = false;
      let attempts = 0;
      let finishLoad: (() => void) | undefined;
      const reset = vi.fn(() => {
        failed = false;
      });
      const loader: AmdRequire = Object.assign(
        (_modules: string[], onLoad: () => void, onError?: (error: unknown) => void) => {
          if (failed) {
            onError?.(new Error('editor.main failed before'));
          } else if (++attempts === 1) {
            failed = true;
            onError?.(new Error('editor.main.js answered 404'));
          } else {
            finishLoad = onLoad;
          }
        },
        { config: vi.fn(), reset },
      );
      // the loader.js the editor adds to the page, which the test server doesn't have, defines the loader above
      const append = document.body.appendChild.bind(document.body);
      const appended = vi.spyOn(document.body, 'appendChild').mockImplementation(<T extends Node>(node: T): T => {
        if (node instanceof HTMLScriptElement && node.src.endsWith('/monaco-edit/vs/loader.js')) {
          page.require = loader;
          queueMicrotask(() => node.dispatchEvent(new Event('load')));
          return node;
        }
        return append(node);
      });
      try {
        const first = create();
        await vi.waitFor(() => {
          expect(handleError).toHaveBeenCalledTimes(1);
        });
        expect(reset).toHaveBeenCalledTimes(1);
        expect(first.componentInstance.loaded).toEqual([]);

        // the next editor's load reaches editor.main again, and holds there
        const destroyed = create();
        const uri = destroyed.componentInstance.$uri();
        await vi.waitFor(() => {
          expect(finishLoad).toBeDefined();
        });
        destroyed.destroy();
        const waiting = create();
        appended.mockRestore();
        delete page.require;
        const monaco = await loadMonacoFromNodeModules();
        const editors = monaco.editor.getEditors().length;
        finishLoad!();
        await vi.waitFor(() => {
          expect(waiting.componentInstance.loaded.length).toBe(1);
        });

        expect(monaco.editor.getEditors().length).toBe(editors + 1);
        expect(monaco.editor.getModel(monaco.Uri.parse(uri))).toBeNull();
        expect(destroyed.componentInstance.loaded).toEqual([]);
        expect(handleError).toHaveBeenCalledTimes(1);
      } finally {
        appended.mockRestore();
      }
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
      const { control, loaded, changes } = fixture.componentInstance;
      const values: (string | null)[] = [];
      control.valueChanges.subscribe(value => values.push(value));
      return { fixture, control, values, changes, editor: loaded[0], host: fixture.nativeElement as HTMLElement };
    }

    async function renderTwoWay() {
      const fixture = TestBed.createComponent(TwoWayEditorComponent);
      fixture.autoDetectChanges();
      const { loaded, changes, $text, $editor } = fixture.componentInstance;
      await vi.waitFor(() => {
        expect(loaded.length).toBe(1);
      });
      return { fixture, changes, $text, editor: loaded[0], component: $editor() };
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

      // F2: setting the text the user had just typed cleared the undo history
      editor.trigger('keyboard', 'undo', null);
      await fixture.whenStable();
      expect(editor.getValue()).toBe('first');
      expect(control.value).toBe('first');
    });

    // #72: writeValue set a model, so each of a form's writes emitted valueChange, which an app heard as the user's edit
    it("emits no valueChange for a form's first value, setValue, patchValue or reset(), and the control stays pristine", async () => {
      const { fixture, control, changes, editor } = await render();
      expect(editor.getValue()).toBe('first');

      control.setValue('second');
      await fixture.whenStable();
      expect(editor.getValue()).toBe('second');

      control.patchValue('third');
      await fixture.whenStable();
      expect(editor.getValue()).toBe('third');

      control.reset();
      await fixture.whenStable();
      expect(editor.getValue()).toBe('');

      expect(changes).toEqual([]);
      expect(control.pristine).toBe(true);
    });

    it('emits valueChange once for each change the user types, with the new text, and the form gets each', async () => {
      const { fixture, control, values, changes, editor } = await render();

      editor.focus();
      for (const key of ['a', 'b', 'c']) {
        type(editor, key);
        await fixture.whenStable();
      }

      expect(changes).toEqual(['afirst', 'abfirst', 'abcfirst']);
      expect(values).toEqual(changes);
      expect(control.value).toBe('abcfirst');
      expect(control.dirty).toBe(true);
    });

    it("binds [(value)] both ways: the bound value reaches the editor without emitting, and the user's typing comes back", async () => {
      const { fixture, changes, $text, editor } = await renderTwoWay();
      expect(editor.getValue()).toBe('two-way');

      $text.set('changed');
      await fixture.whenStable();
      expect(editor.getValue()).toBe('changed');
      expect(changes).toEqual([]);

      type(editor, 'x');
      await fixture.whenStable();
      expect($text()).toBe('xchanged');
      expect(changes).toEqual(['xchanged']);

      // the text that came back through the binding is the editor's already, so its undo history stays
      editor.trigger('keyboard', 'undo', null);
      await fixture.whenStable();
      expect(editor.getValue()).toBe('changed');
      expect($text()).toBe('changed');
    });

    it("changes the editor's text for $value.set() without emitting, and the next bound value replaces it", async () => {
      const { fixture, changes, $text, editor, component } = await renderTwoWay();

      component.$value.set('from code');
      await fixture.whenStable();
      expect(editor.getValue()).toBe('from code');
      expect(component.$value()).toBe('from code');
      expect(changes).toEqual([]);
      expect($text()).toBe('two-way');

      // the user's typing starts from the text the code set
      type(editor, 'x');
      await fixture.whenStable();
      expect(changes).toEqual(['xfrom code']);
      expect($text()).toBe('xfrom code');

      $text.set('bound again');
      await fixture.whenStable();
      expect(editor.getValue()).toBe('bound again');
      expect(component.$value()).toBe('bound again');
      expect(changes).toEqual(['xfrom code']);
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
    it('is read-only while its control is disabled, its text box too', async () => {
      const { fixture, control, editor, host } = await render();
      const readOnly = () => editor.getOption(monaco.editor.EditorOption.readOnly);
      // the text box a screen reader reads, read-only as a disabled control's
      const textBox = () => host.querySelector('textarea')!;

      control.disable();
      await fixture.whenStable();
      expect(readOnly()).toBe(true);
      expect(textBox().readOnly).toBe(true);
      type(editor, 'x');
      expect(editor.getValue()).toBe('first');

      control.enable();
      await fixture.whenStable();
      expect(readOnly()).toBe(false);
      expect(textBox().readOnly).toBe(false);
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

    // The rebuilt editor set its model's text again, the same text, which cleared the undo history
    it('keeps the undo history across a change of options', async () => {
      const { fixture } = await render();
      const { loaded } = fixture.componentInstance;
      type(loaded[0], 'x');
      await fixture.whenStable();

      fixture.componentInstance.$options.set({ ...QUIET, lineNumbers: 'off' });
      await fixture.whenStable();
      expect(loaded.length).toBe(2);
      loaded[1].trigger('keyboard', 'undo', null);

      expect(loaded[1].getValue()).toBe('first');
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
