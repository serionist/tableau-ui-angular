import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DialogService } from './dialog.service';
import { TableauUiDialogModule } from './tableau-ui-dialog.module';

@Component({
  selector: 'tab-test-dialog-content',
  template: 'Content',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DialogContentComponent {}

describe('DialogService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TableauUiDialogModule] });
  });

  // F1: the title was set with innerHTML, so a title built from user data could run script
  it('shows a header title as text', () => {
    const title = '<img src=x onerror="alert(1)">';
    const dialogRef = TestBed.inject(DialogService).openModal(DialogContentComponent, undefined, {
      header: { title, allowClose: true },
    });

    const titleElement = document.querySelector('.dialog-title');
    expect(titleElement).not.toBeNull();
    expect(titleElement?.textContent).toBe(title);
    expect(titleElement?.querySelector('img')).toBeNull();

    dialogRef.close();
  });

  // The modal opens off screen, is measured, then placed; waiting for it keeps the coverage the same on a slow machine
  it('places a modal on screen once it has measured it', async () => {
    const dialogRef = TestBed.inject(DialogService).openModal(DialogContentComponent, undefined, {
      header: { title: 'Placed', allowClose: true },
    });

    const container = document.querySelector<HTMLElement>('.dialog-container')!;
    await vi.waitFor(() => {
      expect(container.style.top).not.toBe('-9999px');
    });
    expect(container.style.left).not.toBe('-9999px');

    dialogRef.close();
  });
});
