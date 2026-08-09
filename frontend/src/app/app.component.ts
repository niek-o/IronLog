import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { NavbarComponent } from './shared/components/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    @if (auth.isAuthenticated()) {
      <app-navbar></app-navbar>
    }
    <main [class.with-nav]="auth.isAuthenticated()">
      <router-outlet></router-outlet>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    main {
      min-height: 100vh;
    }
    main.with-nav {
      min-height: calc(100vh - 60px);
    }
  `],
})
export class AppComponent {
  auth = inject(AuthService);
}
