import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SnackService } from 'tableau-ui-angular/snack';
import { ClipboardService } from './clipboard.service';
import { TableauUiClipboardModule } from './tableau-ui-clipboard.module';

// A page that imports the clipboard module, as the demo's does
@Component({
  imports: [TableauUiClipboardModule],
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ClipboardPageComponent {
  readonly clipboard = inject(ClipboardService);
}

describe('ClipboardService', () => {
  function setUp() {
    const clipboard = TestBed.inject(ClipboardService);
    const snacks = vi.spyOn(TestBed.inject(SnackService), 'openSnack');
    // the page's clipboard stays as it is: the browser's own permission query still runs
    const write = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    const read = vi.spyOn(navigator.clipboard, 'readText').mockResolvedValue('from the clipboard');
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    return { clipboard, snacks, write, read };
  }

  const queryAnswers = (state: PermissionState) => vi.spyOn(navigator.permissions, 'query').mockResolvedValue({ state } as PermissionStatus);

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // F118: Firefox's and Safari's permission query rejects the clipboard's names, which failed every copy and paste there
  it("writes and reads through the browser's own permission query", async () => {
    const { clipboard, snacks, write } = setUp();

    await clipboard.writeText('Copied');

    expect(write).toHaveBeenCalledWith('Copied');
    expect(await clipboard.readText()).toBe('from the clipboard');
    expect(snacks).not.toHaveBeenCalled();
  });

  it('writes and reads when the permission query rejects, as in Firefox and Safari', async () => {
    const { clipboard, write } = setUp();
    vi.spyOn(navigator.permissions, 'query').mockRejectedValue(new TypeError("'clipboard-write' (value of 'name' member of PermissionDescriptor) is not a valid value"));

    await clipboard.writeText('Copied');

    expect(write).toHaveBeenCalledWith('Copied');
    expect(await clipboard.readText()).toBe('from the clipboard');
  });

  it('says when the site may not write, in a snack and in the error', async () => {
    const { clipboard, snacks, write } = setUp();
    queryAnswers('denied');

    await expect(clipboard.writeText('Copied')).rejects.toThrow('Permission to write to clipboard is denied for this site');

    expect(write).not.toHaveBeenCalled();
    expect(snacks).toHaveBeenCalledWith('Permission to write to clipboard is denied for this site', 5000, 'error');
  });

  // F132: a denied read showed the message for a denied write
  it('says when the site may not read, in a snack and in the error', async () => {
    const { clipboard, snacks, read } = setUp();
    queryAnswers('denied');

    await expect(clipboard.readText()).rejects.toThrow('Permission to read from clipboard is denied for this site');

    expect(read).not.toHaveBeenCalled();
    expect(snacks).toHaveBeenCalledWith('Permission to read from clipboard is denied for this site', 5000, 'error');
  });

  it("leaves the error to the app when it handles it, and says when the clipboard's own call fails", async () => {
    const { clipboard, snacks, write } = setUp();
    queryAnswers('granted');
    write.mockRejectedValue(new DOMException('Document is not focused.', 'NotAllowedError'));

    await expect(clipboard.writeText('Copied', false)).rejects.toThrow('Error writing to clipboard');

    expect(snacks).not.toHaveBeenCalled();
  });

  // providedIn 'any' and the module's own provider gave a page that imports the module a service of its own
  it('is one for the app, whatever imports its module', () => {
    const fixture = TestBed.createComponent(ClipboardPageComponent);

    expect(fixture.componentInstance.clipboard).toBe(TestBed.inject(ClipboardService));
  });
});
