import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgTemplateOutlet } from '@angular/common';
import { axeViolations } from '../../testing/axe';
import { TableauUiCommonModule } from './tableau-ui-common.module';

describe('TableauUiCommonModule', () => {
  async function render<T>(component: new () => T) {
    const fixture = TestBed.createComponent(component);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    return { fixture, host: fixture.nativeElement as HTMLElement, component: fixture.componentInstance };
  }

  describe('tab-option', () => {
    // The select, the list, the radio group, the button toggle and the autocomplete each render an option through its
    // templates, saying which parts they show
    @Component({
      imports: [TableauUiCommonModule, NgTemplateOutlet],
      template: `
        <tab-option #fruit value="apple" text="Apple" hint="A fruit" icon="nutrition" [disabled]="$disabled()" />
        <tab-option #rich value="pear" [text]="pearText" [hint]="pearHint" />
        <ng-template #pearText><b>Pear</b></ng-template>
        <ng-template #pearHint><i>Also a fruit</i></ng-template>

        <div class="full">
          <ng-container [ngTemplateOutlet]="fruit.$template()" [ngTemplateOutletContext]="{ renderIcon: true, renderText: true, renderHint: true }" />
        </div>
        <div class="text-only">
          <ng-container [ngTemplateOutlet]="fruit.$template()" [ngTemplateOutletContext]="{ renderIcon: false, renderText: true, renderHint: false, renderAsDisabled: true }" />
        </div>
        <div class="rich">
          <ng-container [ngTemplateOutlet]="rich.$template()" [ngTemplateOutletContext]="{ renderIcon: true, renderText: true, renderHint: true }" />
        </div>
        <div class="line">
          <ng-container [ngTemplateOutlet]="fruit.$lineTemplate()" [ngTemplateOutletContext]="{ renderIcon: true, renderText: true }" />
        </div>
      `,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class OptionsComponent {
      readonly $disabled = signal(false);
    }

    it('shows its icon, text and hint, from strings or templates, as far as its renderer asks', async () => {
      const { host } = await render(OptionsComponent);
      const part = (where: string, which: string) => host.querySelector(`.${where} .${which}`)?.textContent.trim();

      expect(part('full', 'icon')).toBe('nutrition');
      expect(part('full', 'content')).toBe('Apple');
      expect(part('full', 'hint')).toBe('A fruit');
      expect(part('text-only', 'icon')).toBeUndefined();
      expect(part('text-only', 'content')).toBe('Apple');
      expect(part('text-only', 'hint')).toBeUndefined();
      expect(host.querySelector('.rich .content b')!.textContent).toBe('Pear');
      expect(host.querySelector('.rich .hint i')!.textContent).toBe('Also a fruit');
      // an option without an icon shows none
      expect(host.querySelector('.rich .icon')).toBeNull();
      // on one line, as a select shows its value, without the hint
      expect(part('line', 'icon')).toBe('nutrition');
      expect(part('line', 'content')).toBe('Apple');
      expect(host.querySelector('.line .hint')).toBeNull();
    });

    it('looks disabled when it is disabled, or when its renderer shows it so', async () => {
      const { fixture, host, component } = await render(OptionsComponent);
      const disabled = (where: string) => host.querySelector(`.${where} .tab-option`)!.classList.contains('disabled');
      expect(disabled('full')).toBe(false);
      expect(disabled('text-only')).toBe(true);

      component.$disabled.set(true);
      await fixture.whenStable();

      expect(disabled('full')).toBe(true);
      expect(disabled('line')).toBe(true);
      expect(disabled('rich')).toBe(false);
    });

    it('passes axe', async () => {
      const { host } = await render(OptionsComponent);

      expect(await axeViolations(host)).toEqual([]);
    });
  });

  describe('tab-separator', () => {
    @Component({
      imports: [TableauUiCommonModule],
      template: `
        <div style="width: 200px">
          <tab-separator />
        </div>
        <div style="display: flex; height: 40px">
          <span>Left</span>
          <tab-separator direction="vertical" />
          <span>Right</span>
        </div>
      `,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class SeparatorsComponent {}

    it('draws a one-pixel line across its container, or down its row when vertical', async () => {
      const { host } = await render(SeparatorsComponent);
      const [horizontal, vertical] = Array.from(host.querySelectorAll('tab-separator'), separator => separator.getBoundingClientRect());

      expect([horizontal.width, horizontal.height]).toEqual([200, 1]);
      expect([vertical.width, vertical.height]).toEqual([1, 40]);
      expect(await axeViolations(host)).toEqual([]);
    });
  });

  describe('tab-loading-gif', () => {
    @Component({
      imports: [TableauUiCommonModule],
      template: `
        <div style="color: rgb(0, 0, 255); --spinner-color: rgb(0, 128, 0)">
          <tab-loading-gif class="default" />
          <tab-loading-gif class="sized" width="48px" height="32px" color="rgb(255, 0, 0)" />
          <tab-loading-gif class="themed" color="var(--spinner-color)" />
        </div>
      `,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class SpinnersComponent {}

    it('takes its size and color from its inputs, a theme variable included', async () => {
      const { host } = await render(SpinnersComponent);
      const svg = (name: string) => host.querySelector<SVGSVGElement>(`.${name} svg`)!;

      expect([svg('default').getBoundingClientRect().width, svg('default').getBoundingClientRect().height]).toEqual([24, 24]);
      expect([svg('sized').getBoundingClientRect().width, svg('sized').getBoundingClientRect().height]).toEqual([48, 32]);
      expect(getComputedStyle(svg('sized')).color).toBe('rgb(255, 0, 0)');
      expect(getComputedStyle(svg('themed')).color).toBe('rgb(0, 128, 0)');
      expect(await axeViolations(host)).toEqual([]);
    });
  });
});
