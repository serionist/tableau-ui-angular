import {createApplication} from '@angular/platform-browser';
import {appConfig} from './main.config';
import {createCustomElement} from '@angular/elements';
import { ComponentLibraryComponent } from 'component-library';
import { ApplicationRef } from '@angular/core';

(async () => {
  const app: ApplicationRef = await createApplication(appConfig);

  // Define Web Components
  const myLibraryComponent = createCustomElement(ComponentLibraryComponent, {injector: app.injector});
  customElements.define('lib-component-library', myLibraryComponent);
})();