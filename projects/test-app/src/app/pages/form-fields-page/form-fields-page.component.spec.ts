import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormFieldsPageComponent } from './form-fields-page.component';

describe('FormFieldsPageComponent', () => {
    let component: FormFieldsPageComponent;
    let fixture: ComponentFixture<FormFieldsPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormFieldsPageComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(FormFieldsPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
