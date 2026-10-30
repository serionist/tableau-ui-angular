import { ChangeDetectionStrategy, Component, signal, ViewEncapsulation } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { axeViolations } from '../../testing/axe';
import { TableauUiDrawerModule } from './tableau-ui-drawer-module';

@Component({
  imports: [TableauUiDrawerModule],
  template: `
    <div class="drawer-test" style="width: 600px; height: 200px; --twc-color-border-light: gray">
      <tab-drawer-container>
        <tab-drawer width="200px" padding="10" [(isOpen)]="$leftOpen">
          <a href="#filters">Filters</a>
        </tab-drawer>
        <p>Report</p>
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
  readonly $leftOpen = signal(false);
  readonly $rightOpen = signal(false);
}

describe('DrawerContainerComponent', () => {
  async function render() {
    const fixture = TestBed.createComponent(ReportComponent);
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
    return { fixture, host, component: fixture.componentInstance, edges };
  }

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

  it('passes axe with a drawer open', async () => {
    const { fixture, host, component } = await render();
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
