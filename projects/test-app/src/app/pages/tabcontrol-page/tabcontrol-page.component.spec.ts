import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { TabcontrolPageComponent } from './tabcontrol-page.component';

describe('TabcontrolPageComponent', () => {
    let component: TabcontrolPageComponent;
    let fixture: ComponentFixture<TabcontrolPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TabcontrolPageComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(TabcontrolPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
