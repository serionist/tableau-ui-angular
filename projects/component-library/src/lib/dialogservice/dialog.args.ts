export interface IDialogArgs extends IModalArgs, IDialogPositionAndSizeArgs{
   
    backdropCss?: { [key: string]: string};
    containerCss?: { [key: string]: string};
    
  }

  export interface IModalArgs extends IConfirmationDialogArgs{
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
    width?: string;
    height?: string;
    maxWidth?: string;
    maxHeight?: string;
  }
  export interface IDialogPositionAndSizeArgs extends IDialogSizeArgs {
    top?: string | ((actualWidth: number, actualHeight: number) => string);
    left?: string  | ((actualWidth: number, actualHeight: number) => string);
  }