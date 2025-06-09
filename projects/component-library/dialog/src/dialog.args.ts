export interface IDialogArgs extends IModalArgs, IDialogPositionAndSizeArgs {
    backdropCss?: Record<string, string>;
    containerCss?: Record<string, string>;
    trapFocus?: boolean;
}

export interface IModalArgs extends IConfirmationDialogArgs {
    header?: IDialogHeaderArgs;
}
export interface IConfirmationDialogArgs extends IDialogSizeArgs {
    closeOnBackdropClick?: boolean;
    closeOnEscape?: boolean;
}

export interface IDialogHeaderArgs {
    title: string;
    allowClose: boolean;
}

export interface IDialogSizeArgs {
    width?: string | ((insertAfterElementRect?: DOMRect) => string);
    height?: string | ((insertAfterElementRect?: DOMRect) => string);
    maxWidth?: string;
    maxHeight?: string;
}
export interface IDialogPositionAndSizeArgs extends IDialogSizeArgs {
    top?: string | ((actualWidth: number, actualHeight: number, insertAfterElementRect?: DOMRect) => string);
    left?: string | ((actualWidth: number, actualHeight: number, insertAfterElementRect?: DOMRect) => string);
}
