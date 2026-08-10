import { Component, model, input, booleanAttribute } from '@angular/core';
import { NgpCheckbox } from 'ng-primitives/checkbox';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [NgpCheckbox],
  template: `
    <span
      ngpCheckbox
      [(ngpCheckboxChecked)]="checked"
      [ngpCheckboxDisabled]="disabled()"
      tabindex="0"
      class="inline-flex items-center justify-center w-5 h-5 rounded border border-border-light bg-bg cursor-pointer shrink-0
             data-[checked]:bg-accent data-[checked]:border-accent
             data-[focus-visible]:outline data-[focus-visible]:outline-2 data-[focus-visible]:outline-accent data-[focus-visible]:outline-offset-2
             data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
    >
      @if (checked()) {
        <svg viewBox="0 0 16 16" class="w-3 h-3" fill="none" stroke="var(--color-accent-ink)" stroke-width="2.5">
          <path d="M3 8l3.5 3.5L13 4.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      }
    </span>
  `,
})
export class CheckboxComponent {
  checked = model(false);
  disabled = input(false, { transform: booleanAttribute });
}
