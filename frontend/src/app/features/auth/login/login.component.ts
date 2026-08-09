import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-wrap">
      <div class="card auth-card">
        <div class="brand-mark">
          <span class="plate"></span>
          <h1>IRON<span class="accent">LOG</span></h1>
        </div>
        <p class="tag">Log in and get back under the bar.</p>

        <form (ngSubmit)="submit()">
          <div class="field">
            <label for="email">Email</label>
            <input id="email" type="email" name="email" [(ngModel)]="email" required autocomplete="email" />
          </div>
          <div class="field">
            <label for="password">Password</label>
            <input id="password" type="password" name="password" [(ngModel)]="password" required autocomplete="current-password" />
          </div>

          @if (error()) {
            <p class="error-text">{{ error() }}</p>
          }

          <button class="btn btn-primary full" type="submit" [disabled]="loading()">
            {{ loading() ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>

        <p class="switch">New here? <a routerLink="/register">Create an account</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrap {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .auth-card { width: 100%; max-width: 380px; }
    .brand-mark { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.25rem; }
    .plate { width: 22px; height: 22px; border-radius: 50%; border: 5px solid var(--accent); box-shadow: inset 0 0 0 2px var(--bg); }
    .accent { color: var(--accent); }
    .tag { margin-bottom: 1.5rem; }
    .full { width: 100%; margin-top: 0.5rem; }
    .switch { margin-top: 1.25rem; text-align: center; font-size: 0.88rem; }
  `],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  submit(): void {
    if (!this.email || !this.password) {
      this.error.set('Enter your email and password.');
      return;
    }
    this.loading.set(true);
    this.error.set(null);

    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Could not sign in. Check your credentials.');
      },
    });
  }
}
