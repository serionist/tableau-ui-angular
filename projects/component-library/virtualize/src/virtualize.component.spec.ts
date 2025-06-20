import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualizeComponent } from './virtualize.component';

describe('VirtualizeComponent', () => {
  let component: VirtualizeComponent;
  let fixture: ComponentFixture<VirtualizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VirtualizeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VirtualizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
