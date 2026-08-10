import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkoutService } from '../../core/services/workout.service';
import { ExerciseService } from '../../core/services/exercise.service';
import { TemplateService } from '../../core/services/template.service';
import { ExerciseResponse, WorkoutSessionResponse, WorkoutSetRequest, WorkoutSetResponse } from '../../core/models/models';
import { ButtonComponent, CardComponent, BadgeComponent, CheckboxComponent, ConfirmService } from '../../shared/ui';

@Component({
  selector: 'app-workout-session',
  standalone: true,
  imports: [FormsModule, DatePipe, ButtonComponent, CardComponent, BadgeComponent, CheckboxComponent],
  templateUrl: './workout-session.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkoutSessionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private workoutService = inject(WorkoutService);
  private exerciseService = inject(ExerciseService);
  private templateService = inject(TemplateService);
  private confirmService = inject(ConfirmService);

  session = signal<WorkoutSessionResponse | null>(null);
  exercises = signal<ExerciseResponse[]>([]);

  templateExerciseIds = signal<Set<string> | null>(null);
  showAllExercises = signal(false);
  private loadedTemplateId: string | null = null;

  newSet: { exerciseId: string; reps: number | null; weightKg: number | null; rpe: number | null } = {
    exerciseId: '', reps: null, weightKg: null, rpe: null,
  };

  availableExercises = computed((): ExerciseResponse[] => {
    const all = this.exercises();
    const ids = this.templateExerciseIds();
    if (!ids || this.showAllExercises()) return all;
    return all.filter((ex) => ids.has(ex.id));
  });

  onShowAllChange(value: boolean): void {
    this.showAllExercises.set(value);
    const ids = this.templateExerciseIds();
    if (!value && ids && !ids.has(this.newSet.exerciseId)) {
      this.newSet.exerciseId = '';
    }
  }

  groupedSets = computed(() => {
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
  });

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
          this.templateExerciseIds.set(new Set(template.exercises.map((e) => e.exerciseId)));
          this.loadedTemplateId = data.templateId!;
        });
      } else if (!data.templateId) {
        this.templateExerciseIds.set(null);
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

  onSetCompletedChange(set: WorkoutSetResponse, completed: boolean): void {
    set.completed = completed;
    this.saveSet(set);
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
    this.confirmService
      .confirm({ title: 'Delete workout', message: 'Delete this workout session? This cannot be undone.', confirmLabel: 'Delete', danger: true })
      .subscribe((confirmed) => {
        if (confirmed) this.workoutService.delete(s.id).subscribe(() => this.router.navigate(['/workouts']));
      });
  }
}
