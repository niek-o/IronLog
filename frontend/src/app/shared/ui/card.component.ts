import { Component } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  host: {
    class:
      'block bg-surface border border-border rounded-2xl p-6 ' +
      'shadow-[0_1px_0_rgba(255,255,255,0.03)_inset,0_8px_24px_rgba(0,0,0,0.35)]',
  },
  template: '<ng-content />',
})
export class CardComponent {}
