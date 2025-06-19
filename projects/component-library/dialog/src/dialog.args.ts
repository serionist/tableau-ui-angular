export interface IDialogArgs extends IModalArgs, IDialogPositionAndSizeArgs {
    skipCreatingBackdrop?: boolean;
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
    width?: string | ((referenceElementRect: DOMRect) => string | undefined);
    height?: string | ((referenceElementRect: DOMRect) => string | undefined);
    minWidth?: string | ((referenceElementRect: DOMRect) => string | undefined);
    minHeight?: string | ((referenceElementRect: DOMRect) => string | undefined);
    maxWidth?:  string | ((referenceElementRect: DOMRect) => string | undefined);
    maxHeight?:  string | ((referenceElementRect: DOMRect) => string | undefined);
}
export interface IDialogPositionAndSizeArgs extends IDialogSizeArgs {
    top?: string | ((actualWidth: number, actualHeight: number, referenceElementRect?: DOMRect) => string | undefined);
    left?: string | ((actualWidth: number, actualHeight: number, referenceElementRect?: DOMRect) => string | undefined);
}
