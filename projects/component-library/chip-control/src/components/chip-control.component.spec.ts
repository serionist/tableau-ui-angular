import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChipControlComponent } from './chip-control.component';

describe('ChipControlComponent', () => {
  let component: ChipControlComponent;
  let fixture: ComponentFixture<ChipControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChipControlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChipControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
