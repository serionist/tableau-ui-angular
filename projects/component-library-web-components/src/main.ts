import {createApplication} from '@angular/platform-browser';
import {appConfig} from './main.config';
import {createCustomElement} from '@angular/elements';
import { ApplicationRef } from '@angular/core';
import { LoadingGifComponent } from '../../component-library/src/lib/loading/loading-gif/loading-gif.component';
import { LoaderComponent } from '../../component-library/src/lib/loading/loader/loader.component';

(async () => {
  const app: ApplicationRef = await createApplication(appConfig);

  // Define Web Components

  const loadingGifComponent = createCustomElement(LoadingGifComponent, {injector: app.injector});
    customElements.define('tab-wc-loading-gif', loadingGifComponent);

const loaderElement = createCustomElement(LoaderComponent, {injector: app.injector});
customElements.define('tab-wc-loader', loaderElement);
})();