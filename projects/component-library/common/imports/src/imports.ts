import { ErrorComponent, HintComponent, LabelComponent, LoadingGifComponent, OptionComponent, PrefixComponent, SeparatorComponent, SuffixComponent } from 'tableau-ui-angular/common';
import { IconComponent } from 'tableau-ui-angular/icon';
import { importIcons } from 'tableau-ui-angular/icon/imports';

export function importLoadingGif() {
    return [LoadingGifComponent];
}
export function importError() {
    return [ErrorComponent];
}
export function importHint() {
    return [HintComponent];
}
export function importOption() {
    return [OptionComponent, ...importIcons(), ...importHint()];
}
export function importPrefix() {
    return [PrefixComponent];
}
export function importSuffix() {
    return [SuffixComponent];
}
export function importSeparator() {
    return [SeparatorComponent];
}
export function importLabel() {
    return [LabelComponent];
}
export function importAllCommon() {
    return [...importLoadingGif(), ...importError(), ...importHint(), ...importOption(), ...importPrefix(), ...importSuffix(), ...importSeparator(), ...importLabel()];
}
