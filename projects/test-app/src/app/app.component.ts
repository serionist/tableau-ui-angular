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
import { ExampleDialogComponent } from './example-dialog.component';
import { ExampleSnackComponent } from './example-snack.component';
import { CommonModule } from '@angular/common';
import { filter, map, Observable, switchMap } from 'rxjs';
import { TableauUiCommonModule, TableauUiNavBarModule } from '../../../component-library/src/public-api';
import { version as LibVersion } from '../../../component-library/package.json';

@Component({
    selector: 'app-root',

    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
    // public dialogService = inject(DialogService);
    // public snackService = inject(SnackService);
    public router = inject(Router);
    public route = inject(ActivatedRoute);
    readonly page$: Observable<string> = this.router.events.pipe(
        filter((event) => event instanceof NavigationEnd), // Trigger on navigation end
        map(() => this.findRouteData(this.route.root, 'page')) // Use key as needed
    );

    version = LibVersion;
     ngOnInit(): void {
    //     this.errorControl.markAsTouched();
    //     this.errorControl.updateValueAndValidity();
    }
    // // Recursive function to search route tree for specified data key
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


    // simpleControl = new FormControl(false);
    // disabledControl = new FormControl({ value: true, disabled: true });
    // errorControl = new FormControl('lofasz', Validators.pattern(/^\d+$/));

    // buttonsLoading = {
    //     primary: false,
    //     secondary: false,
    //     warning: false,
    // };
    // async buttonClick(color: 'primary' | 'secondary' | 'warning') {
    //     this.buttonsLoading[color] = true;
    //     await new Promise((resolve) => setTimeout(resolve, 2000));
    //     this.buttonsLoading[color] = false;
    //     console.log('Button clicked', color);
    // }
    // openDialog(): void {
    //     const dialogRef = this.dialogService.openModal(
    //         ExampleDialogComponent,
    //         { message: 'This is a dynamic message!' },
    //         {
    //             width: 'calc(100vw - 100px)',
    //             height: 'fit-content',
    //             closeOnBackdropClick: true,
    //             maxWidth: '300px',
    //             header: {
    //                 allowClose: true,
    //                 title: 'This is a dynamic title!',
    //             },
    //         }
    //     );

    //     dialogRef.afterClosed$.subscribe((result) => {
    //         console.log('Dialog closed with result:', result);
    //     });
    // }

    // async openConfirmationDialog(
    //     color: 'primary' | 'error' | 'secondary' = 'secondary',
    //     autofocus?: 'accept' | 'cancel' | undefined,
    //     acceptBtnText?: string | undefined,
    //     cancelBtnText?: string | undefined
    // ) {
    //     const dialogRef =
    //         await this.dialogService.openConfirmationMessageDialog(
    //             'This a random confirmation dialog',
    //             'Are you sure you want to delete this item? This stuff must be two lines long so I generate some random text.',
    //             color,
    //             acceptBtnText,
    //             cancelBtnText,
    //             autofocus
    //         );
    //     console.log('Confirmation dialog returned: ', dialogRef);
    // }
    // async openConfirmationTemplateDialog(
    //     template: TemplateRef<any>,
    //     color: 'primary' | 'error' | 'secondary' = 'secondary',
    //     autofocus: 'accept' | 'cancel' | undefined,
    //     acceptBtnText?: string | undefined,
    //     cancelBtnText?: string | undefined
    // ) {
    //     const dialogRef =
    //         await this.dialogService.openConfirmationTemplateDialog(
    //             'This a random confirmation dialog',
    //             template,
    //             color,
    //             acceptBtnText,
    //             cancelBtnText,
    //             autofocus,
    //             {
    //                 width: '500px',
    //             }
    //         );
    //     console.log('Confirmation dialog returned: ', dialogRef);
    // }

    // async openCustomSnack(
    //     duration: number | undefined = 5000,
    //     type: 'info' | 'error' = 'info',
    //     location: 'top' | 'bottom' = 'top'
    // ) {
    //     const snackRef = await this.snackService.openSnackComponent(
    //         ExampleSnackComponent,
    //         { message: 'This is a custom snack compoenent' },
    //         duration,
    //         type,
    //         location
    //     );
    //     snackRef.afterClosed$.subscribe((result) => {
    //         console.log('Snack closed with result:', result);
    //     });
    // }
}
