import { Component } from '@angular/core';
import { MonacoHelper } from '../../helpers/monaco.helper';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {

  terminalOptions = MonacoHelper.getOptions('shell');

}
