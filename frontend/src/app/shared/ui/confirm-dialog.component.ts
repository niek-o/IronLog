import { Component } from '@angular/core';
import { NgpDialog, NgpDialogDescription, NgpDialogOverlay, NgpDialogTitle, injectDialogRef } from 'ng-primitives/dialog';
import { ButtonComponent } from './button.component';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [NgpDialog, NgpDialogOverlay, NgpDialogTitle, NgpDialogDescription, ButtonComponent],
  template: `
    <div ngpDialogOverlay class="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div
        ngpDialog
        class="w-full max-w-sm bg-surface border border-border rounded-2xl p-6
               shadow-[0_1px_0_rgba(255,255,255,0.03)_inset,0_8px_24px_rgba(0,0,0,0.35)]"
      >
        <h3 ngpDialogTitle class="text-[1.05rem] font-display uppercase tracking-tight mb-2">{{ data.title }}</h3>
        <p ngpDialogDescription class="text-text-dim mb-6">{{ data.message }}</p>
        <div class="flex justify-end gap-3">
          <button appButton variant="ghost" (click)="close(false)">Cancel</button>
          <button appButton [variant]="data.danger ? 'danger' : 'primary'" (click)="close(true)">
            {{ data.confirmLabel ?? 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  private dialogRef = injectDialogRef<ConfirmDialogData, boolean>();
  data = this.dialogRef.data;

  close(result: boolean): void {
    this.dialogRef.close(result);
  }
}
