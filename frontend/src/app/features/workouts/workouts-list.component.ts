import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { WorkoutService } from '../../core/services/workout.service';
import { WorkoutSessionResponse } from '../../core/models/models';
import { ButtonComponent, BadgeComponent } from '../../shared/ui';

@Component({
  selector: 'app-workouts-list',
  standalone: true,
  imports: [FormsModule, DatePipe, ButtonComponent, BadgeComponent],
  templateUrl: './workouts-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
