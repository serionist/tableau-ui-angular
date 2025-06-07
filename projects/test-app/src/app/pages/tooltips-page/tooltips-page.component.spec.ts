import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TooltipsPageComponent } from './tooltips-page.component';

describe('TooltipsPageComponent', () => {
    let component: TooltipsPageComponent;
    let fixture: ComponentFixture<TooltipsPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TooltipsPageComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(TooltipsPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
