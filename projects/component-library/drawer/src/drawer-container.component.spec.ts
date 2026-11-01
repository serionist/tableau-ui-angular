import { afterNextRender, ChangeDetectionStrategy, Component, inject, Injector, signal, ViewEncapsulation } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { userEvent } from 'vitest/browser';
import { axeViolations } from '../../testing/axe';
import { TableauUiDrawerModule } from './tableau-ui-drawer-module';

@Component({
  imports: [TableauUiDrawerModule],
  template: `
    <button class="opener" (click)="$leftOpen.set(true)">Show the filters</button>
    <div class="drawer-test" style="width: 600px; height: 200px; --twc-color-border-light: gray">
      <tab-drawer-container>
        <tab-drawer width="200px" padding="10" [(isOpen)]="$leftOpen">
          <a href="#filters" (keydown.escape)="$leftOpen.set(false)">Filters</a>
        </tab-drawer>
        <p>Report</p>
        <a href="#report">The full report</a>
        <tab-drawer position="right" width="150px" border="none" [isOpen]="$rightOpen()">
          <p>Details</p>
        </tab-drawer>
      </tab-drawer-container>
    </div>
  `,
  // the drawers slide in and out: the test reads where they end, without waiting for the slide
  styles: `
    .drawer-test tab-drawer-container > * {
      transition: none !important;
    }
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ReportComponent {
  private readonly injector = inject(Injector);
  readonly $leftOpen = signal(false);
  readonly $rightOpen = signal(false);

  // closes the left drawer and moves the focus once it renders, as an app may
  closeAndFocus(element: HTMLElement) {
    this.$leftOpen.set(false);
    afterNextRender(
      () => {
        element.focus();
      },
      { injector: this.injector },
    );
  }
}

describe('DrawerContainerComponent', () => {
  async function render(before?: (component: ReportComponent) => void) {
    const fixture = TestBed.createComponent(ReportComponent);
    before?.(fixture.componentInstance);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const container = host.querySelector('tab-drawer-container')!;
    // each box's left and right edges, from the container's left
    const edges = (selector: string) => {
      const box = container.querySelector(selector)!.getBoundingClientRect();
      const origin = container.getBoundingClientRect().left;
      return [box.left - origin, box.right - origin];
    };
    const link = (text: string) => Array.from(host.querySelectorAll('a')).find(element => element.textContent.trim() === text)!;
    return { fixture, host, component: fixture.componentInstance, edges, link, opener: host.querySelector<HTMLButtonElement>('.opener')!, left: host.querySelector('.drawer.left')! };
  }

  // the frames the browser takes to settle focus after the drawer turns inert
  const frames = async () =>
    new Promise(resolve => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });

  it('gives the content the whole width while both drawers are closed, and keeps them out of sight', async () => {
    const { host, edges } = await render();

    expect(edges('.drawer-content')).toEqual([0, 600]);
    expect(edges('.drawer.left')[1]).toBeLessThanOrEqual(0);
    expect(edges('.drawer.right')[0]).toBeGreaterThanOrEqual(600);
    expect(host.querySelector('.drawer.left')!.textContent).toContain('Filters');
    expect(host.querySelector('.drawer-content')!.textContent).toContain('Report');
  });

  it('opens a drawer at its side, its width wide, and moves the content past it, its border and its padding', async () => {
    const { fixture, component, edges } = await render();

    component.$leftOpen.set(true);
    await fixture.whenStable();
    // 200px wide, its 1px border, and the padding twice (10px, given as a number)
    expect(edges('.drawer.left')).toEqual([0, 201]);
    expect(edges('.drawer-content')).toEqual([221, 600]);

    component.$rightOpen.set(true);
    await fixture.whenStable();
    // no border, and the default padding of 0.5rem
    expect(edges('.drawer.right')).toEqual([450, 600]);
    expect(edges('.drawer-content')).toEqual([221, 434]);

    component.$leftOpen.set(false);
    await fixture.whenStable();
    expect(edges('.drawer-content')).toEqual([0, 434]);
    expect(edges('.drawer.left')[1]).toBeLessThanOrEqual(0);
  });

  // #59: a closed drawer was only moved out of sight, so Tab went through its links
  it("skips a closed drawer's link with Tab, and reaches it once the drawer opens", async () => {
    const { fixture, host, component, link, opener, left } = await render();
    expect(left.hasAttribute('inert')).toBe(true);
    expect(host.querySelector('.drawer.right')!.hasAttribute('inert')).toBe(true);

    opener.focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(link('The full report'));

    component.$leftOpen.set(true);
    await fixture.whenStable();
    expect(left.hasAttribute('inert')).toBe(false);
    opener.focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(link('Filters'));
  });

  it('gives the focus back to the button that opened it when it closes with the focus inside', async () => {
    const { fixture, link, opener, left } = await render();

    opener.focus();
    await userEvent.keyboard('{Enter}');
    await fixture.whenStable();
    link('Filters').focus();
    await userEvent.keyboard('{Escape}');
    await fixture.whenStable();

    expect(left.hasAttribute('inert')).toBe(true);
    await vi.waitFor(() => expect(document.activeElement).toBe(opener));
  });

  it('leaves the focus where the app moves it as the drawer closes', async () => {
    const { fixture, component, link, opener } = await render();
    opener.focus();
    await userEvent.keyboard('{Enter}');
    await fixture.whenStable();
    link('Filters').focus();

    component.$leftOpen.set(false);
    link('The full report').focus();
    await fixture.whenStable();
    await frames();

    expect(document.activeElement).toBe(link('The full report'));
  });

  it('leaves the focus where the app moves it once the closed drawer renders', async () => {
    const { fixture, component, link, opener } = await render();
    opener.focus();
    await userEvent.keyboard('{Enter}');
    await fixture.whenStable();
    link('Filters').focus();

    component.closeAndFocus(link('The full report'));
    await fixture.whenStable();
    await frames();

    expect(document.activeElement).toBe(link('The full report'));
  });

  it('records no opener for a drawer open from its first render, though an element had the focus then', async () => {
    // focused before the first render, when the container first sees the drawer open
    const before = document.createElement('button');
    before.textContent = 'Before the report';
    document.body.append(before);
    before.focus();
    const focused: EventTarget[] = [];
    const record = (event: FocusEvent) => focused.push(event.target!);

    try {
      const { fixture, link, left } = await render(component => component.$leftOpen.set(true));
      expect(document.activeElement).toBe(before);
      expect(left.hasAttribute('inert')).toBe(false);
      link('Filters').focus();
      document.addEventListener('focusin', record);

      await userEvent.keyboard('{Escape}');
      await fixture.whenStable();
      await frames();

      expect(left.hasAttribute('inert')).toBe(true);
      expect(focused).toEqual([]);
      expect(document.activeElement).not.toBe(before);
    } finally {
      document.removeEventListener('focusin', record);
      before.remove();
    }
  });

  it('passes axe with the drawers closed, and with one open', async () => {
    const { fixture, host, component } = await render();
    expect(await axeViolations(host)).toEqual([]);

    component.$leftOpen.set(true);
    await fixture.whenStable();

    expect(await axeViolations(host)).toEqual([]);
  });

  it('throws for a second drawer on the same side', () => {
    @Component({
      imports: [TableauUiDrawerModule],
      template: `
        <tab-drawer-container>
          <tab-drawer width="100px">One</tab-drawer>
          <tab-drawer width="100px">Two</tab-drawer>
        </tab-drawer-container>
      `,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class TwoLeftDrawersComponent {}

    const fixture = TestBed.createComponent(TwoLeftDrawersComponent);

    expect(() => fixture.detectChanges()).toThrow('There can only be one left drawer.');
  });
});
