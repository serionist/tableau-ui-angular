export interface IDialogArgs extends IModalArgs{
    top?: string | ((actualWidth: number, actualHeight: number) => string);
    left?: string  | ((actualWidth: number, actualHeight: number) => string);
    backdropCss?: { [key: string]: string};
    containerCss?: { [key: string]: string};
    
  }

  export interface IModalArgs extends IConfirmationDialogArgs{
    header?: IDialogHeaderArgs;
   
  }
  export interface IConfirmationDialogArgs {
    width?: string;
    height?: string;
    maxWidth?: string;
    maxHeight?: string;
    closeOnBackdropClick?: boolean;
  }

  export interface IDialogHeaderArgs {
    title: string;
    allowClose: boolean;
  }