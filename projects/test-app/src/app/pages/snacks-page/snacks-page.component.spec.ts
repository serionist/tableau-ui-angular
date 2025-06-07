import type { ComponentFixture} from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { SnacksPageComponent } from './snacks-page.component';

describe('SnacksPageComponent', () => {
    let component: SnacksPageComponent;
    let fixture: ComponentFixture<SnacksPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SnacksPageComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(SnacksPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
