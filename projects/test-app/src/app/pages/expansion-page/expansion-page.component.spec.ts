import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { ExpansionPageComponent } from './expansion-page.component';

describe('ButtonsPageComponent', () => {
  let component: ExpansionPageComponent;
  let fixture: ComponentFixture<ExpansionPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpansionPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpansionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
