import { ChangeDetectionStrategy, Component } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { ClipboardService } from 'tableau-ui-angular/clipboard';
import { SnackService } from 'tableau-ui-angular/snack';
import type { DocsExample } from './docs-example';
import { DocsExampleComponent } from './docs-example.component';

@Component({
  selector: 'app-sample',
  template: '<p class="sample">The sample runs</p>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class SampleComponent {}

const SAMPLE: DocsExample = {
  component: SampleComponent,
  ts: "@Component({ selector: 'app-sample', templateUrl: './sample.html' })\nexport class SampleComponent {}\n",
  html: '<p class="sample">The sample runs</p>\n',
  scss: '.sample {\n  color: red;\n}\n',
};

describe('DocsExampleComponent', () => {
  let fixture: ComponentFixture<DocsExampleComponent>;

  async function render(example: DocsExample) {
    fixture = TestBed.createComponent(DocsExampleComponent);
    fixture.componentRef.setInput('example', example);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  const tabs = (host: HTMLElement) => Array.from(host.querySelectorAll<HTMLElement>('tab-group .tab'));
  const panes = (host: HTMLElement) => Array.from(host.querySelectorAll<HTMLElement>('tab-group .tab-content'));

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('runs the sample above its source', async () => {
    const host = await render(SAMPLE);

    expect(host.querySelector('.preview .sample')?.textContent).toBe('The sample runs');
    expect(host.querySelector('.preview')?.compareDocumentPosition(host.querySelector('tab-group')!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it("shows a tab for each of the sample's files, each with the file's text", async () => {
    const host = await render(SAMPLE);

    expect(tabs(host).map(tab => tab.textContent.trim())).toEqual(['TS', 'HTML', 'SCSS']);
    // the text as the file has it, without its last line break
    expect(panes(host).map(pane => pane.querySelector('pre')?.textContent)).toEqual([
      "@Component({ selector: 'app-sample', templateUrl: './sample.html' })\nexport class SampleComponent {}",
      '<p class="sample">The sample runs</p>',
      '.sample {\n  color: red;\n}',
    ]);
    expect(panes(host).map(pane => pane.querySelector('pre')?.getAttribute('aria-label'))).toEqual(['TS', 'HTML', 'SCSS']);
  });

  it('shows only the files a sample has', async () => {
    const host = await render({ component: SampleComponent, ts: 'export class SampleComponent {}\n' });

    expect(tabs(host).map(tab => tab.textContent.trim())).toEqual(['TS']);
  });

  it('shows the TS first, and another file when its tab is chosen', async () => {
    const host = await render(SAMPLE);
    expect(panes(host).map(pane => pane.style.display)).toEqual(['block', 'none', 'none']);

    tabs(host)[2].click();
    await fixture.whenStable();

    expect(panes(host).map(pane => pane.style.display)).toEqual(['none', 'none', 'block']);
  });

  it("copies a file's text with its tab's button, and says so", async () => {
    const write = vi.spyOn(TestBed.inject(ClipboardService), 'writeText').mockResolvedValue();
    const snack = vi.spyOn(TestBed.inject(SnackService), 'openSnack');
    const host = await render(SAMPLE);

    const copy = panes(host)[1].querySelector('button')!;
    expect(copy.getAttribute('aria-label')).toBe('Copy the HTML');
    copy.click();

    await vi.waitFor(() => {
      expect(snack).toHaveBeenCalledWith('Copied the HTML', 2000, 'success');
    });
    expect(write).toHaveBeenCalledExactlyOnceWith('<p class="sample">The sample runs</p>');
  });

  it('says nothing of its own when the copy fails, since the clipboard service has said why', async () => {
    const write = vi.spyOn(TestBed.inject(ClipboardService), 'writeText').mockRejectedValue(new Error('Permission to write to clipboard is denied for this site'));
    const snack = vi.spyOn(TestBed.inject(SnackService), 'openSnack');
    const host = await render(SAMPLE);

    panes(host)[0].querySelector('button')!.click();

    await vi.waitFor(() => {
      expect(write).toHaveBeenCalled();
    });
    // the rejection settles before the next task
    await new Promise(resolve => setTimeout(resolve));
    expect(snack).not.toHaveBeenCalled();
  });

  // Monaco loads for the tab in view, and colours the tabs not shown as well, so a tab the user picks is coloured
  // Monaco loads in seconds the first time: the test gets more than browser mode's 15
  it('colours every source tab once Monaco loads, the ones not shown too, with their text as it was', { timeout: 30_000 }, async () => {
    const host = await render(SAMPLE);

    await vi.waitFor(
      () => {
        expect(panes(host).map(pane => Array.from(pane.querySelectorAll<HTMLElement>('pre span')).some(span => span.style.color !== ''))).toEqual([true, true, true]);
      },
      { timeout: 20000 },
    );
    expect(panes(host).map(pane => pane.style.display)).toEqual(['block', 'none', 'none']);
    expect(panes(host).map(pane => pane.querySelector('pre')?.textContent)).toEqual([SAMPLE.ts, SAMPLE.html, SAMPLE.scss].map(text => text?.replace(/\n$/, '')));
  });
});
