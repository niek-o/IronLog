import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkoutService } from '../../core/services/workout.service';
import { ExerciseService } from '../../core/services/exercise.service';
import { TemplateService } from '../../core/services/template.service';
import { ExerciseResponse, WorkoutSessionResponse, WorkoutSetRequest, WorkoutSetResponse } from '../../core/models/models';

@Component({
  selector: 'app-workout-session',
  standalone: true,
  imports: [FormsModule, DatePipe],
  template: `
    @if (session()) {
      <div class="page">
        <header class="page-head">
          <div>
            <p class="eyebrow">{{ session()!.startedAt | date: 'MMM d, y · h:mm a' }}</p>
            <h1>{{ session()!.name }}</h1>
          </div>
          <div class="head-actions">
            @if (!session()!.completedAt) {
              <button class="btn btn-primary" (click)="finish()">Mark complete</button>
            } @else {
              <span class="badge badge-accent">Completed</span>
            }
            <button class="btn btn-danger" (click)="removeSession()">Delete</button>
          </div>
        </header>

        <div class="card add-set-card">
          <h3>Add a set</h3>
          <div class="add-row">
            <select [(ngModel)]="newSet.exerciseId" name="exerciseId">
              <option value="" disabled>Exercise</option>
              @for (ex of availableExercises(); track ex.id) {
                <option [value]="ex.id">{{ ex.name }}</option>
              }
            </select>
            <input type="number" min="1" [(ngModel)]="newSet.reps" name="reps" placeholder="Reps" />
            <input type="number" min="0" step="0.5" [(ngModel)]="newSet.weightKg" name="weightKg" placeholder="kg" />
            <input type="number" min="1" max="10" [(ngModel)]="newSet.rpe" name="rpe" placeholder="RPE" />
            <button class="btn btn-primary" (click)="addSet()">+ Add set</button>
          </div>
          @if (templateExerciseIds) {
            <label class="checkbox-row">
              <input type="checkbox" [(ngModel)]="showAllExercises" name="showAllExercises" (ngModelChange)="onShowAllChange()" />
              Show all exercises, not just this template's
            </label>
          }
        </div>

        @if (groupedSets().length === 0) {
          <p class="empty-state">No sets logged yet — add your first set above.</p>
        } @else {
          @for (group of groupedSets(); track group.exerciseId) {
            <div class="card exercise-group">
              <h3>{{ group.exerciseName }}</h3>
              <div class="set-table">
                <div class="set-head"><span>#</span><span>Reps</span><span>Weight</span><span>RPE</span><span>Done</span><span></span></div>
                @for (set of group.sets; track set.id) {
                  <div class="set-row">
                    <span class="mono">{{ set.setNumber }}</span>
                    <input type="number" min="0" class="cell-input" [(ngModel)]="set.reps" [name]="'reps' + set.id" (blur)="saveSet(set)" />
                    <input type="number" min="0" step="0.5" class="cell-input" [(ngModel)]="set.weightKg" [name]="'weight' + set.id" (blur)="saveSet(set)" />
                    <input type="number" min="1" max="10" class="cell-input" [(ngModel)]="set.rpe" [name]="'rpe' + set.id" (blur)="saveSet(set)" placeholder="—" />
                    <input type="checkbox" [(ngModel)]="set.completed" [name]="'done' + set.id" (change)="saveSet(set)" />
                    <button class="btn btn-ghost small" (click)="removeSet(set.id)">Remove</button>
                  </div>
                }
              </div>
            </div>
          }
        }
      </div>
    } @else {
      <p class="empty-state">Loading workout…</p>
    }
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [`
    .page { max-width: 900px; margin: 0 auto; padding: 2rem 1.75rem 4rem; }
    .page-head { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
    .eyebrow { text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.75rem; color: var(--text-faint); margin-bottom: 0.25rem; }
    .head-actions { display: flex; gap: 0.6rem; align-items: center; }
    .add-set-card { margin-bottom: 1.5rem; }
    .add-row { display: grid; grid-template-columns: 2fr 0.8fr 0.8fr 0.8fr auto; gap: 0.6rem; }
    .checkbox-row { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.75rem; font-size: 0.85rem; color: var(--text-dim); }
    .add-row select, .add-row input {
      background: var(--bg); border: 1px solid var(--border-light); border-radius: var(--radius-sm);
      padding: 0.6rem 0.7rem; color: var(--text); width: 100%; min-width: 0;
    }
    .exercise-group { margin-bottom: 1rem; }
    .set-table { display: flex; flex-direction: column; }
    .set-head, .set-row { display: grid; grid-template-columns: 0.5fr 1fr 1fr 1fr 0.6fr auto; gap: 0.5rem; align-items: center; padding: 0.5rem 0; }
    .set-head { color: var(--text-faint); font-size: 0.75rem; text-transform: uppercase; border-bottom: 1px solid var(--border); }
    .set-row { border-bottom: 1px solid var(--border); }
    .set-row:last-child { border-bottom: none; }
    .small { padding: 0.3rem 0.6rem; font-size: 0.78rem; }
    .cell-input {
      width: 100%; min-width: 0; background: var(--bg); border: 1px solid var(--border-light); border-radius: var(--radius-sm);
      padding: 0.4rem 0.5rem; color: var(--text); font-family: inherit;
    }
    .set-row input[type="checkbox"] { width: 1.1rem; height: 1.1rem; justify-self: center; }
    @media (max-width: 700px) {
      .add-row { grid-template-columns: 1fr 1fr; }
      .set-head, .set-row { grid-template-columns: 0.4fr 1fr 1fr 1fr 0.5fr auto; font-size: 0.85rem; }
    }
  `],
})
export class WorkoutSessionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private workoutService = inject(WorkoutService);
  private exerciseService = inject(ExerciseService);
  private templateService = inject(TemplateService);

  session = signal<WorkoutSessionResponse | null>(null);
  exercises = signal<ExerciseResponse[]>([]);

  templateExerciseIds: Set<string> | null = null;
  showAllExercises = false;
  private loadedTemplateId: string | null = null;

  newSet: { exerciseId: string; reps: number | null; weightKg: number | null; rpe: number | null } = {
    exerciseId: '', reps: null, weightKg: null, rpe: null,
  };

  availableExercises = (): ExerciseResponse[] => {
    const all = this.exercises();
    if (!this.templateExerciseIds || this.showAllExercises) return all;
    return all.filter((ex) => this.templateExerciseIds!.has(ex.id));
  };

  onShowAllChange(): void {
    if (!this.showAllExercises && this.templateExerciseIds && !this.templateExerciseIds.has(this.newSet.exerciseId)) {
      this.newSet.exerciseId = '';
    }
  }

  groupedSets = () => {
    const s = this.session();
    if (!s) return [];
    const map = new Map<string, { exerciseId: string; exerciseName: string; sets: typeof s.sets }>();
    for (const set of s.sets) {
      if (!map.has(set.exerciseId)) {
        map.set(set.exerciseId, { exerciseId: set.exerciseId, exerciseName: set.exerciseName, sets: [] });
      }
      map.get(set.exerciseId)!.sets.push(set);
    }
    return Array.from(map.values());
  };

  ngOnInit(): void {
    this.exerciseService.list().subscribe((data) => this.exercises.set(data));
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.load(id);
  }

  load(id: string): void {
    this.workoutService.get(id).subscribe((data) => {
      this.session.set(data);
      if (data.templateId && data.templateId !== this.loadedTemplateId) {
        this.templateService.get(data.templateId).subscribe((template) => {
          this.templateExerciseIds = new Set(template.exercises.map((e) => e.exerciseId));
          this.loadedTemplateId = data.templateId!;
        });
      } else if (!data.templateId) {
        this.templateExerciseIds = null;
        this.loadedTemplateId = null;
      }
    });
  }

  addSet(): void {
    const s = this.session();
    if (!s || !this.newSet.exerciseId || !this.newSet.reps || this.newSet.weightKg === null) return;

    const setNumber = s.sets.filter((x) => x.exerciseId === this.newSet.exerciseId).length + 1;
    const req: WorkoutSetRequest = {
      exerciseId: this.newSet.exerciseId,
      setNumber,
      reps: this.newSet.reps,
      weightKg: this.newSet.weightKg,
      rpe: this.newSet.rpe,
      completed: true,
    };

    this.workoutService.addSet(s.id, req).subscribe(() => {
      this.newSet = { exerciseId: this.newSet.exerciseId, reps: this.newSet.reps, weightKg: null, rpe: null };
      this.load(s.id);
    });
  }

  saveSet(set: WorkoutSetResponse): void {
    const s = this.session();
    if (!s) return;
    const req: WorkoutSetRequest = {
      exerciseId: set.exerciseId,
      setNumber: set.setNumber,
      reps: set.reps,
      weightKg: set.weightKg,
      rpe: set.rpe ?? null,
      completed: set.completed,
    };
    this.workoutService.updateSet(s.id, set.id, req).subscribe();
  }

  removeSet(setId: string): void {
    const s = this.session();
    if (!s) return;
    this.workoutService.deleteSet(s.id, setId).subscribe(() => this.load(s.id));
  }

  finish(): void {
    const s = this.session();
    if (!s) return;
    this.workoutService.update(s.id, { name: s.name, notes: s.notes, complete: true }).subscribe(() => this.load(s.id));
  }

  removeSession(): void {
    const s = this.session();
    if (!s) return;
    if (!confirm('Delete this workout session? This cannot be undone.')) return;
    this.workoutService.delete(s.id).subscribe(() => this.router.navigate(['/workouts']));
  }
}
