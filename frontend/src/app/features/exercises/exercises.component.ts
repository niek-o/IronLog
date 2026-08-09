import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ExerciseService } from '../../core/services/exercise.service';
import { ExerciseRequest, ExerciseResponse, MUSCLE_CATEGORIES, MuscleCategory } from '../../core/models/models';

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './exercises.component.html',
  styleUrl: './exercises.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExercisesComponent implements OnInit {
  private service = inject(ExerciseService);

  categories = MUSCLE_CATEGORIES;
  all = signal<ExerciseResponse[]>([]);
  loading = signal(true);
  filterCategory = signal<MuscleCategory | null>(null);
  formOpen = signal(false);
  editingId = signal<string | null>(null);

  form: ExerciseRequest = { name: '', category: 'Chest', equipment: '', notes: '' };

  filtered = computed(() => {
    const cat = this.filterCategory();
    return cat ? this.all().filter((e) => e.category === cat) : this.all();
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (data) => { this.all.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  setFilter(cat: MuscleCategory | null): void {
    this.filterCategory.set(cat);
  }

  openCreate(): void {
    this.form = { name: '', category: 'Chest', equipment: '', notes: '' };
    this.editingId.set(null);
    this.formOpen.set(true);
  }

  openEdit(ex: ExerciseResponse): void {
    this.form = { name: ex.name, category: ex.category, equipment: ex.equipment ?? '', notes: ex.notes ?? '' };
    this.editingId.set(ex.id);
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
  }

  save(): void {
    if (!this.form.name.trim()) return;
    const id = this.editingId();
    const req$ = id ? this.service.update(id, this.form) : this.service.create(this.form);
    req$.subscribe(() => {
      this.formOpen.set(false);
      this.load();
    });
  }

  remove(ex: ExerciseResponse): void {
    if (!confirm(`Delete "${ex.name}"? This cannot be undone.`)) return;
    this.service.delete(ex.id).subscribe(() => this.load());
  }
}
