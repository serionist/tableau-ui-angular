import { NgModule } from "@angular/core";
import { ErrorComponent } from "./error";
import { HintComponent } from "./hint";
import { OptionComponent } from "./option";
import { SeparatorComponent } from "./separator";
import { CommonModule } from "@angular/common";
import { LoadingGifComponent } from "./loading-gif.component";

@NgModule({
    imports: [CommonModule],
    declarations: [ErrorComponent, HintComponent, OptionComponent, SeparatorComponent, LoadingGifComponent],
    exports: [ErrorComponent, HintComponent, OptionComponent, SeparatorComponent, LoadingGifComponent]
})
export class TableauUiCommonModule {}