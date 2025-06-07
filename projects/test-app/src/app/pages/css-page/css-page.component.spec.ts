import type { ComponentFixture} from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { CssPageComponent } from './css-page.component';

describe('CssPageComponent', () => {
    let component: CssPageComponent;
    let fixture: ComponentFixture<CssPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CssPageComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CssPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
