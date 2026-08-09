import { Component, inject } from '@angular/core';
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

      <div class="links">
        <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
        <a routerLink="/workouts" routerLinkActive="active">Workouts</a>
        <a routerLink="/templates" routerLinkActive="active">Templates</a>
        <a routerLink="/exercises" routerLinkActive="active">Exercises</a>
        <a routerLink="/progress" routerLinkActive="active">Progress</a>
        <a routerLink="/metrics" routerLinkActive="active">Body Metrics</a>
      </div>

      <div class="user">
        @if (auth.currentUser(); as user) {
          <span class="name">{{ user.firstName }} {{ user.lastName }}</span>
        }
        <button class="btn btn-ghost" (click)="logout()">Sign out</button>
      </div>
    </nav>
  `,
  styles: [`
    .shell {
      display: flex;
      align-items: center;
      gap: 2rem;
      padding: 0.9rem 1.75rem;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 10;
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
      overflow-x: auto;
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
    @media (max-width: 900px) {
      .shell { flex-wrap: wrap; gap: 0.75rem; }
      .links { order: 3; width: 100%; gap: 1rem; }
    }
  `],
})
export class NavbarComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
