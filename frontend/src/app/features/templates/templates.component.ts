import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
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
  templateUrl: './templates.component.html',
  styleUrl: './templates.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
