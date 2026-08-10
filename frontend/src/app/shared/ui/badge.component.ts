import { Component, computed, input } from '@angular/core';

export type BadgeVariant = 'default' | 'accent';

@Component({
  selector: 'app-badge',
  standalone: true,
  host: {
    '[class]': 'classes()',
  },
  template: '<ng-content />',
})
export class BadgeComponent {
  variant = input<BadgeVariant>('default');

  classes = computed(() => {
    const base =
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.72rem] font-bold uppercase tracking-wide border';
    return this.variant() === 'accent'
      ? `${base} bg-accent/10 text-accent border-accent/35`
      : `${base} bg-surface-raised text-text-dim border-border-light`;
  });
}
