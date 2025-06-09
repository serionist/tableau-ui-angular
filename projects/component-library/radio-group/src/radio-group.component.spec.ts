import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { RadioGroupComponent } from './radio-group.component';

describe('RadiogroupComponent', () => {
    let component: RadioGroupComponent;
    let fixture: ComponentFixture<RadioGroupComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RadioGroupComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(RadioGroupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
