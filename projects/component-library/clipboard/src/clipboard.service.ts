import { inject, Injectable } from '@angular/core';
import { SnackService } from 'tableau-ui-angular/snack';

type ClipboardPermission = 'clipboard-read' | 'clipboard-write';

// One for the app; it holds no state, and its snacks are the app's one SnackService's
@Injectable({
  providedIn: 'root',
})
export class ClipboardService {
  snackService = inject(SnackService);
  async writeText(text: string, handlePermissionError: boolean = true): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!navigator.clipboard) {
      throw this.getError(handlePermissionError, 'Clipboard is not available in this browser');
    }
    if ((await this.permissionState('clipboard-write')) === 'denied') {
      throw this.getError(handlePermissionError, 'Permission to write to clipboard is denied for this site');
    }
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      throw this.getError(handlePermissionError, 'Error writing to clipboard', e);
    }
  }

  async readText(handlePermissionError: boolean = true): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!navigator.clipboard) {
      throw this.getError(handlePermissionError, 'Clipboard is not available in this browser');
    }
    if ((await this.permissionState('clipboard-read')) === 'denied') {
      throw this.getError(handlePermissionError, 'Permission to read from clipboard is denied for this site');
    }
    try {
      return await navigator.clipboard.readText();
    } catch (e) {
      throw this.getError(handlePermissionError, 'Error reading from clipboard', e);
    }
  }

  // Firefox and Safari know neither permission's name, so their query rejects: the state is unknown then, and the
  // clipboard call itself says whether the site may use it
  private async permissionState(name: ClipboardPermission): Promise<PermissionState | 'unknown'> {
    try {
      const status = await navigator.permissions.query({ name } as PermissionDescriptor & { name: ClipboardPermission });
      return status.state;
    } catch {
      return 'unknown';
    }
  }

  private getError(handleError: boolean, message: string, details?: unknown) {
    console.error(message, details);
    if (handleError) {
      this.snackService.openSnack(message, 5000, 'error');
    }
    return new Error(message);
  }
}
