import { Injectable, inject } from '@angular/core';
import { NgpDialogManager } from 'ng-primitives/dialog';
import { map } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private dialogManager = inject(NgpDialogManager);

  confirm(data: ConfirmDialogData) {
    const ref = this.dialogManager.open<ConfirmDialogData, boolean>(ConfirmDialogComponent, { data });
    return ref.afterClosed.pipe(map((result) => !!result));
  }
}
