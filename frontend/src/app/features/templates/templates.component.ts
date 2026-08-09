import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TemplateService } from '../../core/services/template.service';
import { ExerciseService } from '../../core/services/exercise.service';
import { WorkoutService } from '../../core/services/workout.service';
import {
  ExerciseResponse,
  TemplateExerciseRequest,
  TemplateRequest,
  TemplateResponse,
} from '../../core/models/models';

@Component({
  selector: 'app-templates',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <header class="page-head">
        <div>
          <p class="eyebrow">Routines</p>
          <h1>Workout templates</h1>
        </div>
        <button class="btn btn-primary" (click)="openCreate()">+ New template</button>
      </header>

      @if (formOpen()) {
        <div class="card form-card">
          <h3>{{ editingId() ? 'Edit template' : 'New template' }}</h3>
          <div class="field">
            <label for="tname">Name</label>
            <input id="tname" [(ngModel)]="form.name" name="tname" required placeholder="e.g. Push day" />
          </div>
          <div class="field">
            <label for="tdesc">Description</label>
            <input id="tdesc" [(ngModel)]="form.description" name="tdesc" placeholder="Optional" />
          </div>

          <h3 class="sub-head">Exercises</h3>
          @for (row of rows; track row; let i = $index) {
            <div class="exercise-row">
              <select [(ngModel)]="row.exerciseId" [name]="'ex' + i">
                <option value="" disabled>Select exercise</option>
                @for (ex of exercises(); track ex.id) {
                  <option [value]="ex.id">{{ ex.name }}</option>
                }
              </select>
              <input type="number" min="1" [(ngModel)]="row.targetSets" [name]="'sets' + i" placeholder="Sets" />
              <input type="number" min="1" [(ngModel)]="row.targetReps" [name]="'reps' + i" placeholder="Reps" />
              <input type="number" min="0" step="0.5" [(ngModel)]="row.targetWeightKg" [name]="'weight' + i" placeholder="kg" />
              <button type="button" class="btn btn-danger small" (click)="removeRow(i)">Remove</button>
            </div>
          }
          <button type="button" class="btn btn-ghost" (click)="addRow()">+ Add exercise to template</button>

          <div class="form-actions">
            <button type="button" class="btn btn-ghost" (click)="closeForm()">Cancel</button>
            <button type="button" class="btn btn-primary" (click)="save()">{{ editingId() ? 'Save changes' : 'Create template' }}</button>
          </div>
        </div>
      }

      @if (loading()) {
        <p class="empty-state">Loading templates…</p>
      } @else if (templates().length === 0) {
        <p class="empty-state">No templates yet — build one to speed up logging.</p>
      } @else {
        <div class="grid">
          @for (t of templates(); track t.id) {
            <div class="card template-card">
              <div class="tc-head">
                <h3>{{ t.name }}</h3>
                <span class="badge">{{ t.exercises.length }} exercises</span>
              </div>
              @if (t.description) { <p>{{ t.description }}</p> }
              <ul class="ex-list">
                @for (e of t.exercises; track e.id) {
                  <li>{{ e.exerciseName }} <span class="mono dim">{{ e.targetSets }}×{{ e.targetReps }}</span></li>
                }
              </ul>
              <div class="tc-actions">
                <button class="btn btn-primary small" (click)="startFromTemplate(t)">Start workout</button>
                <button class="btn btn-ghost small" (click)="openEdit(t)">Edit</button>
                <button class="btn btn-danger small" (click)="remove(t)">Delete</button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1100px; margin: 0 auto; padding: 2rem 1.75rem 4rem; }
    .page-head { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
    .eyebrow { text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.75rem; color: var(--text-faint); margin-bottom: 0.25rem; }
    .form-card { margin-bottom: 1.75rem; }
    .sub-head { margin-top: 1.25rem; }
    .exercise-row {
      display: grid; grid-template-columns: 2fr 0.7fr 0.7fr 0.7fr auto;
      gap: 0.6rem; margin-bottom: 0.6rem; align-items: center;
    }
    .exercise-row select, .exercise-row input {
      background: var(--bg); border: 1px solid var(--border-light); border-radius: var(--radius-sm);
      padding: 0.55rem 0.6rem; color: var(--text);
    }
    .form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.25rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.1rem; }
    .template-card { display: flex; flex-direction: column; gap: 0.5rem; }
    .tc-head { display: flex; align-items: center; justify-content: space-between; }
    .ex-list { list-style: none; padding: 0; margin: 0.25rem 0 0.75rem; display: flex; flex-direction: column; gap: 0.35rem; }
    .ex-list li { display: flex; justify-content: space-between; font-size: 0.88rem; color: var(--text-dim); }
    .dim { color: var(--text-faint); }
    .tc-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: auto; }
    .small { padding: 0.4rem 0.7rem; font-size: 0.8rem; }
    @media (max-width: 700px) {
      .exercise-row { grid-template-columns: 1fr 1fr; }
    }
  `],
})
export class TemplatesComponent implements OnInit {
  private templateService = inject(TemplateService);
  private exerciseService = inject(ExerciseService);
  private workoutService = inject(WorkoutService);
  private router = inject(Router);

  templates = signal<TemplateResponse[]>([]);
  exercises = signal<ExerciseResponse[]>([]);
  loading = signal(true);
  formOpen = signal(false);
  editingId = signal<string | null>(null);

  form: { name: string; description: string } = { name: '', description: '' };
  rows: TemplateExerciseRequest[] = [];

  ngOnInit(): void {
    this.exerciseService.list().subscribe((data) => this.exercises.set(data));
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.templateService.list().subscribe({
      next: (data) => { this.templates.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate(): void {
    this.form = { name: '', description: '' };
    this.rows = [{ exerciseId: '', order: 1, targetSets: 3, targetReps: 10, targetWeightKg: null }];
    this.editingId.set(null);
    this.formOpen.set(true);
  }

  openEdit(t: TemplateResponse): void {
    this.form = { name: t.name, description: t.description ?? '' };
    this.rows = t.exercises.map((e) => ({
      exerciseId: e.exerciseId,
      order: e.order,
      targetSets: e.targetSets,
      targetReps: e.targetReps,
      targetWeightKg: e.targetWeightKg ?? null,
    }));
    this.editingId.set(t.id);
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
  }

  addRow(): void {
    this.rows.push({ exerciseId: '', order: this.rows.length + 1, targetSets: 3, targetReps: 10, targetWeightKg: null });
  }

  removeRow(i: number): void {
    this.rows.splice(i, 1);
  }

  save(): void {
    if (!this.form.name.trim()) return;
    const validRows = this.rows.filter((r) => r.exerciseId).map((r, idx) => ({ ...r, order: idx + 1 }));

    const req: TemplateRequest = {
      name: this.form.name.trim(),
      description: this.form.description || null,
      exercises: validRows,
    };

    const id = this.editingId();
    const req$ = id ? this.templateService.update(id, req) : this.templateService.create(req);
    req$.subscribe(() => {
      this.formOpen.set(false);
      this.load();
    });
  }

  remove(t: TemplateResponse): void {
    if (!confirm(`Delete template "${t.name}"?`)) return;
    this.templateService.delete(t.id).subscribe(() => this.load());
  }

  startFromTemplate(t: TemplateResponse): void {
    const sets = t.exercises.flatMap((e) =>
      Array.from({ length: e.targetSets }, (_, i) => ({
        exerciseId: e.exerciseId,
        setNumber: i + 1,
        reps: e.targetReps,
        weightKg: e.targetWeightKg ?? 0,
        rpe: null,
        completed: false,
      }))
    );

    this.workoutService
      .start({ name: t.name, templateId: t.id, notes: null, sets })
      .subscribe((session) => this.router.navigate(['/workouts', session.id]));
  }
}
