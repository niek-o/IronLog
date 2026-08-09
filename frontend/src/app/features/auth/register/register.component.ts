import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-wrap">
      <div class="card auth-card">
        <div class="brand-mark">
          <span class="plate"></span>
          <h1>IRON<span class="accent">LOG</span></h1>
        </div>
        <p class="tag">Create an account to start tracking sessions.</p>

        <form (ngSubmit)="submit()">
          <div class="row">
            <div class="field">
              <label for="firstName">First name</label>
              <input id="firstName" name="firstName" [(ngModel)]="firstName" required />
            </div>
            <div class="field">
              <label for="lastName">Last name</label>
              <input id="lastName" name="lastName" [(ngModel)]="lastName" required />
            </div>
          </div>
          <div class="field">
            <label for="email">Email</label>
            <input id="email" type="email" name="email" [(ngModel)]="email" required autocomplete="email" />
          </div>
          <div class="field">
            <label for="password">Password</label>
            <input id="password" type="password" name="password" [(ngModel)]="password" required autocomplete="new-password" />
            <span class="hint">At least 8 characters.</span>
          </div>

          @if (error()) {
            <p class="error-text">{{ error() }}</p>
          }

          <button class="btn btn-primary full" type="submit" [disabled]="loading()">
            {{ loading() ? 'Creating account…' : 'Create account' }}
          </button>
        </form>

        <p class="switch">Already training with us? <a routerLink="/login">Sign in</a></p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [`
    .auth-wrap {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .auth-card { width: 100%; max-width: 420px; }
    .brand-mark { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.25rem; }
    .plate { width: 22px; height: 22px; border-radius: 50%; border: 5px solid var(--accent); box-shadow: inset 0 0 0 2px var(--bg); }
    .accent { color: var(--accent); }
    .tag { margin-bottom: 1.5rem; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .hint { font-size: 0.75rem; color: var(--text-faint); }
    .full { width: 100%; margin-top: 0.5rem; }
    .switch { margin-top: 1.25rem; text-align: center; font-size: 0.88rem; }
  `],
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  firstName = '';
  lastName = '';
  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  submit(): void {
    if (!this.firstName || !this.lastName || !this.email || !this.password) {
      this.error.set('Fill in every field to continue.');
      return;
    }
    this.loading.set(true);
    this.error.set(null);

    this.auth.register(this.email, this.password, this.firstName, this.lastName).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Could not create your account.');
      },
    });
  }
}
