import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ExerciseService } from '../../core/services/exercise.service';
import { ExerciseRequest, ExerciseResponse, MUSCLE_CATEGORIES, MuscleCategory } from '../../core/models/models';

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <header class="page-head">
        <div>
          <p class="eyebrow">Library</p>
          <h1>Exercises</h1>
        </div>
        <button class="btn btn-primary" (click)="openCreate()">+ Add custom exercise</button>
      </header>

      <div class="filters">
        <button class="chip" [class.active]="filterCategory() === null" (click)="setFilter(null)">All</button>
        @for (cat of categories; track cat) {
          <button class="chip" [class.active]="filterCategory() === cat" (click)="setFilter(cat)">{{ cat }}</button>
        }
      </div>

      @if (formOpen()) {
        <div class="card form-card">
          <h3>{{ editingId() ? 'Edit exercise' : 'New custom exercise' }}</h3>
          <form (ngSubmit)="save()">
            <div class="row">
              <div class="field">
                <label for="name">Name</label>
                <input id="name" name="name" [(ngModel)]="form.name" required />
              </div>
              <div class="field">
                <label for="category">Category</label>
                <select id="category" name="category" [(ngModel)]="form.category" required>
                  @for (cat of categories; track cat) {
                    <option [value]="cat">{{ cat }}</option>
                  }
                </select>
              </div>
            </div>
            <div class="row">
              <div class="field">
                <label for="equipment">Equipment</label>
                <input id="equipment" name="equipment" [(ngModel)]="form.equipment" placeholder="e.g. Dumbbell" />
              </div>
              <div class="field">
                <label for="notes">Notes</label>
                <input id="notes" name="notes" [(ngModel)]="form.notes" placeholder="Optional" />
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-ghost" (click)="closeForm()">Cancel</button>
              <button type="submit" class="btn btn-primary">{{ editingId() ? 'Save changes' : 'Add exercise' }}</button>
            </div>
          </form>
        </div>
      }

      @if (loading()) {
        <p class="empty-state">Loading exercise library…</p>
      } @else if (filtered().length === 0) {
        <p class="empty-state">No exercises in this category yet.</p>
      } @else {
        <div class="table">
          <div class="table-head">
            <span>Name</span><span>Category</span><span>Equipment</span><span></span>
          </div>
          @for (ex of filtered(); track ex.id) {
            <div class="table-row">
              <span class="ex-name">{{ ex.name }} @if (ex.isCustom) { <span class="badge badge-accent">custom</span> }</span>
              <span>{{ ex.category }}</span>
              <span>{{ ex.equipment || '—' }}</span>
              <span class="row-actions">
                @if (ex.isCustom) {
                  <button class="btn btn-ghost small" (click)="openEdit(ex)">Edit</button>
                  <button class="btn btn-danger small" (click)="remove(ex)">Delete</button>
                }
              </span>
            </div>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .page { max-width: 1000px; margin: 0 auto; padding: 2rem 1.75rem 4rem; }
    .page-head { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem; }
    .eyebrow { text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.75rem; color: var(--text-faint); margin-bottom: 0.25rem; }
    .filters { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem; }
    .chip { padding: 0.4rem 0.9rem; border-radius: 999px; border: 1px solid var(--border-light); background: var(--surface); color: var(--text-dim); font-size: 0.82rem; font-weight: 600; }
    .chip.active { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
    .form-card { margin-bottom: 1.5rem; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; }
    .table { border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
    .table-head, .table-row {
      display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
      padding: 0.85rem 1.25rem; align-items: center; gap: 0.5rem;
    }
    .table-head { background: var(--surface-raised); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-faint); }
    .table-row { background: var(--surface); border-top: 1px solid var(--border); }
    .ex-name { display: flex; align-items: center; gap: 0.5rem; }
    .row-actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
    .small { padding: 0.35rem 0.65rem; font-size: 0.8rem; }
    @media (max-width: 700px) {
      .row { grid-template-columns: 1fr; }
      .table-head { display: none; }
      .table-row { grid-template-columns: 1fr; }
    }
  `],
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
