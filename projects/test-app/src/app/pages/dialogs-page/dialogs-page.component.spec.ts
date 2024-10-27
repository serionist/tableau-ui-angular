import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogsPageComponent } from './dialogs-page.component';

describe('DialogsPageComponent', () => {
  let component: DialogsPageComponent;
  let fixture: ComponentFixture<DialogsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
