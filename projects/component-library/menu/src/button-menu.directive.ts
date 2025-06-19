import type { InputSignal, ModelSignal } from '@angular/core';
import { Directive, model } from '@angular/core';
import { MenuDirective } from './menu.directive';

@Directive({
  selector: 'ng-template[buttonMenu]',
  standalone: false,
  exportAs: 'buttonMenu',
})
export class ButtonMenuDirective extends MenuDirective {
  // #region Inputs
  override readonly $menuContainerCss: ModelSignal<Record<string, string>> = model<Record<string, string>>(
    {
      pointerEvents: 'none',
      marginTop: '-1px',
      background: 'transparent',
    },
    {
      alias: 'menuContainerCss',
    },
  );

  override readonly $closeOnBackdropClick: InputSignal<boolean> = model(true, {
    alias: 'closeOnBackdropClick',
  });
  override readonly $minWidth: ModelSignal<string | 'fit-content' | 'parentWidth'> = model('parentWidth', {
    alias: 'minWidth',
  });
  override readonly $width: ModelSignal<string | 'fit-content' | 'parentWidth'> = model('fit-content', {
    alias: 'width',
  });

  // #endregion Inputs
}
