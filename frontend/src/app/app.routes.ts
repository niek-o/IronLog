import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'exercises',
    canActivate: [authGuard],
    loadComponent: () => import('./features/exercises/exercises.component').then((m) => m.ExercisesComponent),
  },
  {
    path: 'templates',
    canActivate: [authGuard],
    loadComponent: () => import('./features/templates/templates.component').then((m) => m.TemplatesComponent),
  },
  {
    path: 'workouts',
    canActivate: [authGuard],
    loadComponent: () => import('./features/workouts/workouts-list.component').then((m) => m.WorkoutsListComponent),
  },
  {
    path: 'workouts/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/workouts/workout-session.component').then((m) => m.WorkoutSessionComponent),
  },
  {
    path: 'progress',
    canActivate: [authGuard],
    loadComponent: () => import('./features/progress/progress.component').then((m) => m.ProgressComponent),
  },
  {
    path: 'metrics',
    canActivate: [authGuard],
    loadComponent: () => import('./features/metrics/metrics.component').then((m) => m.MetricsComponent),
  },
  { path: '**', redirectTo: 'dashboard' },
];
