import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class MonacoLoaderService {
    private loaded = false;
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    // async loadMonaco(): Promise<unknown> {
    //     if (this.loaded) {
    //         return import('monaco-editor');
    //     }
    //     this.loaded = true;

    //     // Load the monaco editor
    //     const monaco = await import('monaco-editor');

    //     this.loaded = true;

    //     return monaco;
    // }
}