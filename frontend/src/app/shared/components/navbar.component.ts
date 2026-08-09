import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="shell">
      <div class="brand">
        <span class="plate"></span>
        <span>IRON<span class="accent">LOG</span></span>
      </div>

      <div class="links" [class.open]="menuOpen()">
        <a routerLink="/dashboard" routerLinkActive="active" (click)="closeMenu()">Dashboard</a>
        <a routerLink="/workouts" routerLinkActive="active" (click)="closeMenu()">Workouts</a>
        <a routerLink="/templates" routerLinkActive="active" (click)="closeMenu()">Templates</a>
        <a routerLink="/exercises" routerLinkActive="active" (click)="closeMenu()">Exercises</a>
        <a routerLink="/progress" routerLinkActive="active" (click)="closeMenu()">Progress</a>
        <a routerLink="/metrics" routerLinkActive="active" (click)="closeMenu()">Body Metrics</a>
      </div>

      <div class="user">
        @if (auth.currentUser(); as user) {
          <span class="name">{{ user.firstName }} {{ user.lastName }}</span>
        }
        <button class="btn btn-ghost" (click)="logout()">Sign out</button>
      </div>

      <button
        class="menu-toggle"
        [class.open]="menuOpen()"
        (click)="toggleMenu()"
        [attr.aria-expanded]="menuOpen()"
        aria-label="Toggle menu"
      >
        <span></span><span></span><span></span>
      </button>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .shell {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 2rem;
      padding: 0.9rem 1.75rem;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 20;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: var(--font-display);
      font-size: 1.05rem;
      letter-spacing: 0.02em;
      white-space: nowrap;
    }
    .plate {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 4px solid var(--accent);
      box-shadow: inset 0 0 0 2px var(--bg);
    }
    .accent { color: var(--accent); }
    .links {
      display: flex;
      gap: 1.4rem;
      flex: 1;
      min-width: 0;
    }
    .links a {
      color: var(--text-dim);
      font-size: 0.88rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      white-space: nowrap;
      padding: 0.3rem 0;
      border-bottom: 2px solid transparent;
    }
    .links a:hover { color: var(--text); text-decoration: none; }
    .links a.active { color: var(--accent); border-bottom-color: var(--accent); }
    .user {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }
    .name {
      color: var(--text-dim);
      font-size: 0.85rem;
      white-space: nowrap;
    }
    .menu-toggle {
      display: none;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 4px;
      width: 38px;
      height: 38px;
      padding: 0;
      background: transparent;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-sm);
      flex-shrink: 0;
    }
    .menu-toggle span {
      display: block;
      width: 18px;
      height: 2px;
      background: var(--text);
      border-radius: 1px;
      transition: transform 0.2s ease, opacity 0.2s ease;
    }
    .menu-toggle.open span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
    .menu-toggle.open span:nth-child(2) { opacity: 0; }
    .menu-toggle.open span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

    @media (max-width: 900px) {
      .shell { padding: 0.85rem 1.1rem; gap: 0.6rem; }
      .menu-toggle { display: flex; order: 3; }
      .user { order: 2; margin-left: auto; }
      .name { display: none; }
      .links {
        display: none;
        order: 4;
        width: 100%;
        flex: none;
        flex-direction: column;
        gap: 0;
      }
      .links.open { display: flex; }
      .links a {
        width: 100%;
        padding: 0.9rem 0.3rem;
        border-bottom: 1px solid var(--border);
      }
      .links a.active { background: var(--surface-raised); }
    }
  `],
})
export class NavbarComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  menuOpen = signal(false);

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
