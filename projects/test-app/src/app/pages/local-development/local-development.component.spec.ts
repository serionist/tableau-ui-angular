import type { ComponentFixture} from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { LocalDevelopmentComponent } from './local-development.component';

describe('LocalDevelopmentComponent', () => {
    let component: LocalDevelopmentComponent;
    let fixture: ComponentFixture<LocalDevelopmentComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LocalDevelopmentComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(LocalDevelopmentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
