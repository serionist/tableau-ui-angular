import { inject, Injectable } from '@angular/core';
import { SnackService } from 'tableau-ui-angular/snack';
@Injectable({
    providedIn: 'any',
})
export class ClipboardService {
    snackService = inject(SnackService);
    async writeText(text: string, handlePermissionError: boolean = true): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (!navigator.clipboard) {
            throw this.getError(handlePermissionError, 'Clipboard is not available in this browser');
        }
        const perm = await navigator.permissions.query({
            name: 'clipboard-write',
        } as PermissionDescriptor & { name: 'clipboard-write' });
        if (perm.state === 'denied') {
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
        const perm = await navigator.permissions.query({
            name: 'clipboard-read',
        } as PermissionDescriptor & { name: 'clipboard-read' });
        if (perm.state === 'denied') {
            throw this.getError(handlePermissionError, 'Permission to write to clipboard is denied for this site');
        }
        try {
            return await navigator.clipboard.readText();
        } catch (e) {
            throw this.getError(handlePermissionError, 'Error reading from clipboard', e);
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
