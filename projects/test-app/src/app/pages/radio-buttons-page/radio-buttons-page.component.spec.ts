import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { RadioButtonsPageComponent } from './radio-buttons-page.component';

describe('RadioButtonsPageComponent', () => {
  let component: RadioButtonsPageComponent;
  let fixture: ComponentFixture<RadioButtonsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadioButtonsPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RadioButtonsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
