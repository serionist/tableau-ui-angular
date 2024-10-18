import { Component, input, Input } from "@angular/core";
import { LoadingGifComponent } from "../loading-gif/loading-gif.component";

@Component({
    selector: 'tab-loader',
    standalone: true,
    imports: [LoadingGifComponent],
    templateUrl: 'loader.component.html',
    styleUrls: ['loader.component.scss']
  })
  export class LoaderComponent {
    message = input<string>();
  }