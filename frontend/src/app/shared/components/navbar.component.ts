import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ButtonComponent } from '../ui';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ButtonComponent],
  templateUrl: './navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  menuOpen = signal(false);

  links = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/workouts', label: 'Workouts' },
    { path: '/templates', label: 'Templates' },
    { path: '/exercises', label: 'Exercises' },
    { path: '/progress', label: 'Progress' },
    { path: '/metrics', label: 'Body Metrics' },
  ];

  linksClasses = computed(() => {
    const base = 'flex gap-6 flex-1 min-w-0 max-[900px]:order-4 max-[900px]:w-full max-[900px]:flex-none max-[900px]:flex-col max-[900px]:gap-0';
    return this.menuOpen() ? `${base} max-[900px]:flex` : `${base} max-[900px]:hidden`;
  });

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
