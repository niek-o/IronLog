import { Component, computed, input, booleanAttribute } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';

export type ButtonVariant = 'primary' | 'ghost' | 'danger';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors ' +
  'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed ' +
  'data-[focus-visible]:outline data-[focus-visible]:outline-2 data-[focus-visible]:outline-accent data-[focus-visible]:outline-offset-2';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-ink border border-accent data-[hover]:bg-accent-dim data-[hover]:border-accent-dim',
  ghost: 'bg-transparent text-text-dim border border-transparent data-[hover]:bg-surface-raised data-[hover]:text-text',
  danger: 'bg-transparent text-danger border border-danger data-[hover]:bg-danger/10',
};

@Component({
  selector: 'button[appButton], a[appButton]',
  standalone: true,
  hostDirectives: [NgpButton],
  host: {
    class: 'appearance-none',
    '[class]': 'classes()',
  },
  template: '<ng-content />',
})
export class ButtonComponent {
  variant = input<ButtonVariant>('primary');
  small = input(false, { transform: booleanAttribute });

  classes = computed(() => {
    const size = this.small() ? 'px-3 py-1.5 text-[0.8rem]' : 'px-5 py-2.5 text-[0.9rem]';
    return `${BASE} ${size} ${VARIANTS[this.variant()]}`;
  });
}
