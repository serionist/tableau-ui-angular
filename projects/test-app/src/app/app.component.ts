import {
    Component,
    inject,
    OnInit,
    TemplateRef,
    ViewContainerRef,
} from '@angular/core';
import {
    ActivatedRoute,
    NavigationEnd,
    Router,
    RouterOutlet,
    RouterState,
} from '@angular/router';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { ExampleDialogComponent } from './pages/dialogs-page/example-dialog.component';
import { CommonModule } from '@angular/common';
import { filter, map, Observable, switchMap } from 'rxjs';
import {
    TableauUiCommonModule,
    TableauUiNavBarModule,
} from '../../../component-library/src/public-api';
import { version as LibVersion } from '../../../component-library/package.json';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    standalone: false
})
export class AppComponent {
    public router = inject(Router);
    public route = inject(ActivatedRoute);
    readonly page$: Observable<string> = this.router.events.pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => this.findRouteData(this.route.root, 'page'))
    );

    version = LibVersion;
    // Recursive function to search route tree for specified data key
    private findRouteData(route: ActivatedRoute, key: string): any {
        let child = route;
        while (child) {
            if (child.snapshot.data && key in child.snapshot.data) {
                return child.snapshot.data[key];
            }
            child = child.firstChild!;
        }
        return null;
    }
}
