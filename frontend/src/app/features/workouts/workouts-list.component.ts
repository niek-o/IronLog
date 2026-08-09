import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { WorkoutService } from '../../core/services/workout.service';
import { WorkoutSessionResponse } from '../../core/models/models';

@Component({
  selector: 'app-workouts-list',
  standalone: true,
  imports: [FormsModule, DatePipe],
  template: `
    <div class="page">
      <header class="page-head">
        <div>
          <p class="eyebrow">History</p>
          <h1>Workouts</h1>
        </div>
        <div class="quick-start">
          <input [(ngModel)]="quickName" placeholder="Session name, e.g. Leg day" name="quickName" />
          <button class="btn btn-primary" (click)="startBlank()">+ Start blank workout</button>
        </div>
      </header>

      @if (loading()) {
        <p class="empty-state">Loading history…</p>
      } @else if (sessions().length === 0) {
        <p class="empty-state">No workouts logged yet. Start one above, or launch from a template.</p>
      } @else {
        <div class="list">
          @for (s of sessions(); track s.id) {
            <button class="card session-row" (click)="open(s)">
              <div class="left">
                <h3>{{ s.name }}</h3>
                <span class="meta">{{ s.startedAt | date: 'MMM d, y · h:mm a' }} @if (s.templateName) { · {{ s.templateName }} }</span>
              </div>
              <div class="right">
                <span class="badge" [class.badge-accent]="s.completedAt">{{ s.completedAt ? 'Completed' : 'In progress' }}</span>
                <span class="mono set-count">{{ s.sets.length }} sets</span>
              </div>
            </button>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .page { max-width: 900px; margin: 0 auto; padding: 2rem 1.75rem 4rem; }
    .page-head { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
    .eyebrow { text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.75rem; color: var(--text-faint); margin-bottom: 0.25rem; }
    .quick-start { display: flex; gap: 0.6rem; }
    .quick-start input {
      background: var(--surface); border: 1px solid var(--border-light); border-radius: var(--radius-sm);
      padding: 0.55rem 0.75rem; color: var(--text); min-width: 200px;
    }
    .list { display: flex; flex-direction: column; gap: 0.75rem; }
    .session-row {
      display: flex; align-items: center; justify-content: space-between;
      width: 100%; text-align: left; border: 1px solid var(--border);
      background: var(--surface); cursor: pointer; font: inherit; color: inherit;
    }
    .session-row:hover { border-color: var(--border-light); background: var(--surface-hover); }
    .meta { color: var(--text-faint); font-size: 0.82rem; }
    .right { display: flex; align-items: center; gap: 0.85rem; }
    .set-count { color: var(--text-dim); font-size: 0.85rem; }
    @media (max-width: 700px) {
      .quick-start { flex-direction: column; align-items: stretch; }
      .session-row { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
    }
  `],
})
export class WorkoutsListComponent implements OnInit {
  private service = inject(WorkoutService);
  private router = inject(Router);

  sessions = signal<WorkoutSessionResponse[]>([]);
  loading = signal(true);
  quickName = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (data) => { this.sessions.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  startBlank(): void {
    const name = this.quickName.trim() || 'Workout';
    this.service.start({ name, templateId: null, notes: null, sets: [] }).subscribe((session) => {
      this.router.navigate(['/workouts', session.id]);
    });
  }

  open(s: WorkoutSessionResponse): void {
    this.router.navigate(['/workouts', s.id]);
  }
}
