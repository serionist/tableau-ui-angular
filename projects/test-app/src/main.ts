import { AppModule } from './app/app.module';
import { platformBrowser } from '@angular/platform-browser';

platformBrowser()
    .bootstrapModule(AppModule)
    .catch((err: unknown) => {
        console.error(err);
    });
