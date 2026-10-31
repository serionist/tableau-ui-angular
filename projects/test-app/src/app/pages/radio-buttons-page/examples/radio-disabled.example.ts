import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableauUiCommonModule } from 'tableau-ui-angular/common';
import { TableauUiRadioGroupModule } from 'tableau-ui-angular/radio-group';

@Component({
  selector: 'app-radio-disabled-example',
  imports: [TableauUiCommonModule, TableauUiRadioGroupModule],
  templateUrl: './radio-disabled.example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioDisabledExampleComponent {}
