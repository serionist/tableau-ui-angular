import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoaderComponent } from 'component-library';
import { CheckboxComponent, TabComponent, TabGroupComponent } from '../../../component-library/src/public-api';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoaderComponent, TabGroupComponent, TabComponent,
    CheckboxComponent, ReactiveFormsModule
  ],
  

  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'test-app';


  checkboxControl1 = new FormControl(false);
  checkboxControl2 = new FormControl({ value: true, disabled: true });
  checkboxControl3 = new FormControl(true);
}
