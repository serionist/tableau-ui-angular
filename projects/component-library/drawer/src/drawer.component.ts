import { ChangeDetectionStrategy, Component, input, model, TemplateRef, viewChild } from '@angular/core';

@Component({
  selector: 'tab-drawer',
  standalone: false,
  template: ` <ng-template><ng-content /></ng-template> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawerComponent {
  readonly $template = viewChild.required<TemplateRef<unknown>>(TemplateRef);

  /**
   * The drawer position.
   * When changed after the drawer is opened, it will only be applied next open.
   * @default 'left'
   */
  readonly $position = input<'left' | 'right'>('left', {
    alias: 'position',
  });

  /**
   * The border to show between the drawer and the content.
   * @default 'solid 1px var(--twc-color-border-light)'
   */
  readonly $border = input('solid 1px var(--twc-color-border-light)', {
    alias: 'border',
  });
  /**
   * The gap to apply to between the drawer and the content.
   * This is useful to avoid content being too close to the edges.
   * Any CSS value is accepted, like '10px', '1rem', '2em', etc.
   * @default '0.5rem'
   */
  readonly $padding = input('0.5rem', {
    alias: 'padding',
  });
  /**
   * The drawer mode.
   * When changed after the drawer is opened, it will only be applied next open
   */
  // readonly $mode = input.required<'over' | 'side'>({
  //   alias: 'mode'
  // });

  /**
   * The drawer width.
   * This can be a CSS value like '300px', '50%', or '30rem'.
   */
  readonly $width = input.required<string>({
    alias: 'width',
  });

  /**
   * The drawer status. Closed, the drawer is inert: Tab skips it and screen readers don't read it.
   *
   * The app moves focus into the drawer it opens, such as to its heading. A drawer opened after its first render
   * gives focus back, when it closes with focus inside, to the element focused when it opened. A drawer open from its
   * first render has no such element, so the app moves focus when it closes it.
   * @default 'false'
   */
  readonly $isOpen = model(false, {
    alias: 'isOpen',
  });
}
