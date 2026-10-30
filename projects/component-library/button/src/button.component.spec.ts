import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { userEvent } from 'vitest/browser';
import { TableauUiIconModule } from 'tableau-ui-angular/icon';
import { axeViolations } from '../../testing/axe';
import { TableauUiButtonModule } from './tableau-ui-buttons.module';

@Component({
  imports: [TableauUiButtonModule, TableauUiIconModule],
  template: `
    <form (submit)="$event.preventDefault(); submits.push('form')">
      <button class="app-class" color="primary" kind="raised" [disabled]="$disabled()" [loading]="$loading()" (click)="clicks.push('save')">Save</button>
      <button type="submit">Send</button>
    </form>
    <a button [disabled]="$disabled()" [loading]="$loading()" (click)="clicks.push('open')">Open</a>
    <a button href="#next" [disabled]="$disabled()" (click)="followed($event)">Next</a>
    <button layout="icon" [loading]="$loading()" (click)="clicks.push('close')"><tab-icon value="close" label="Close" /></button>
    <button [noFocusOnClick]="false" (click)="clicks.push('keep')">Keep focus</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ButtonsComponent {
  readonly $disabled = signal(false);
  readonly $loading = signal(false);
  readonly clicks: string[] = [];
  readonly submits: string[] = [];

  // the app keeps Ctrl + click and Ctrl + Enter to itself, so the test opens no tab
  followed(event: MouseEvent) {
    this.clicks.push(event.ctrlKey ? 'next with Ctrl' : 'next');
    if (event.ctrlKey) {
      event.preventDefault();
    }
  }
}

describe('ButtonComponent', () => {
  async function render() {
    const fixture = TestBed.createComponent(ButtonsComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const byText = (text: string) => Array.from(host.querySelectorAll<HTMLElement>('button, a')).find(el => el.textContent.trim() === text)!;
    return {
      fixture,
      host,
      component: fixture.componentInstance,
      save: byText('Save'),
      send: byText('Send'),
      open: byText('Open'),
      next: byText('Next'),
      close: host.querySelector<HTMLElement>('[layout="icon"]')!,
      keep: byText('Keep focus'),
    };
  }

  // A timer's turn, for the blur a mouse click schedules
  const nextTask = () => new Promise(resolve => setTimeout(resolve));

  it('is a plain button unless its type is submit, so a click in a form does not submit it', async () => {
    const { fixture, component, save, send } = await render();

    save.click();
    await fixture.whenStable();
    expect(component.clicks).toEqual(['save']);
    expect(component.submits).toEqual([]);
    expect(save.getAttribute('type')).toBe('button');

    send.click();
    await fixture.whenStable();
    expect(component.submits).toEqual(['form']);
  });

  it("takes its look from color and kind, secondary and stroked by default, and keeps the app's own class", async () => {
    const { save, send } = await render();

    expect(Array.from(save.classList)).toEqual(expect.arrayContaining(['app-class', 'primary', 'raised']));
    expect(Array.from(send.classList)).toEqual(expect.arrayContaining(['secondary', 'stroked']));
  });

  it('runs once from Enter and once from Space, and keeps focus', async () => {
    const { fixture, component, save } = await render();

    save.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await fixture.whenStable();
    await nextTask();

    expect(component.clicks).toEqual(['save', 'save']);
    expect(document.activeElement).toBe(save);
  });

  // An <a button> without an href is no link, so the browser does nothing on its Enter; the check looked for <link>
  it('runs a button made of a link from Enter and from Space', async () => {
    const { fixture, component, open } = await render();

    expect(open.getAttribute('role')).toBe('button');
    expect(open.tabIndex).toBe(0);
    open.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await fixture.whenStable();
    await nextTask();

    expect(component.clicks).toEqual(['open', 'open']);
    expect(document.activeElement).toBe(open);
  });

  // A disabled <a button> stops the app's (click), and must stop the browser following its href too; an enabled one
  // leaves Enter to the link, so Ctrl + Enter keeps its Ctrl, which a click from code would drop
  it('follows its href while enabled, never while disabled, and leaves Enter to a link', async () => {
    const { fixture, component, next } = await render();
    const start = location.href;
    // the fragments the page went to, in order: Firefox follows a link a task after its click
    const visited: string[] = [];
    const record = (event: HashChangeEvent) => visited.push(new URL(event.newURL).hash);
    window.addEventListener('hashchange', record);
    try {
      component.$disabled.set(true);
      await fixture.whenStable();
      next.click();
      expect(component.clicks).toEqual([]);

      component.$disabled.set(false);
      await fixture.whenStable();
      next.focus();
      await userEvent.keyboard('{Control>}{Enter}{/Control}');
      expect(component.clicks).toEqual(['next with Ctrl']);

      // a fragment of the test's own, after which neither click above can still land
      location.hash = 'checked';
      await vi.waitFor(() => {
        expect(visited).toEqual(['#checked']);
      });

      next.click();
      await vi.waitFor(() => {
        expect(visited).toEqual(['#checked', '#next']);
      });
      expect(component.clicks).toEqual(['next with Ctrl', 'next']);
    } finally {
      window.removeEventListener('hashchange', record);
      history.replaceState(history.state, '', start);
    }
  });

  it('gives focus up after a mouse click, unless noFocusOnClick is false', async () => {
    const { fixture, component, save, keep } = await render();

    await userEvent.click(save);
    await vi.waitFor(() => {
      expect(document.activeElement).not.toBe(save);
    });

    await userEvent.click(keep);
    await nextTask();
    await fixture.whenStable();
    expect(document.activeElement).toBe(keep);
    expect(component.clicks).toEqual(['save', 'keep']);
  });

  // A disabled <a> is no disabled control to the browser: it took a screen reader's click and read as enabled
  it('takes no click while disabled, leaves the tab order and says it is disabled', async () => {
    const { fixture, component, save, open } = await render();
    component.$disabled.set(true);
    await fixture.whenStable();

    save.click();
    open.click();
    open.focus();
    await userEvent.keyboard(' ');
    await fixture.whenStable();

    expect(component.clicks).toEqual([]);
    expect((save as HTMLButtonElement).disabled).toBe(true);
    expect(save.tabIndex).toBe(-1);
    expect(open.tabIndex).toBe(-1);
    expect(open.getAttribute('aria-disabled')).toBe('true');
  });

  it("takes no click while loading, and shows the wait indicator, in place of an icon button's content", async () => {
    const { fixture, component, save, open, close } = await render();
    component.$loading.set(true);
    await fixture.whenStable();

    save.click();
    open.click();
    open.focus();
    await userEvent.keyboard('{Enter}');
    close.click();
    await fixture.whenStable();

    expect(component.clicks).toEqual([]);
    expect((save as HTMLButtonElement).disabled).toBe(true);
    expect(open.getAttribute('aria-disabled')).toBe('true');
    const indicator = save.querySelector('img')!;
    expect(indicator.alt).toBe('Wait indicator');
    expect(getComputedStyle(indicator).visibility).toBe('visible');
    expect(save.textContent).toContain('Save');
    // an icon button shows the indicator alone
    expect(close.querySelector('tab-icon')).toBeNull();
    expect(close.querySelector('img')).not.toBeNull();

    component.$loading.set(false);
    await fixture.whenStable();
    expect(getComputedStyle(save.querySelector('img')!).visibility).toBe('hidden');
    expect(close.querySelector('tab-icon')).not.toBeNull();
    expect(open.hasAttribute('aria-disabled')).toBe(false);
  });

  it('passes axe, enabled and loading', async () => {
    const { fixture, host, component } = await render();
    expect(await axeViolations(host)).toEqual([]);

    component.$loading.set(true);
    await fixture.whenStable();
    expect(await axeViolations(host)).toEqual([]);
  });
});
