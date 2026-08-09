import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MetricService } from '../../core/services/metric.service';
import { BodyMetricRequest, BodyMetricResponse } from '../../core/models/models';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [FormsModule, DatePipe],
  template: `
    <div class="page">
      <header class="page-head">
        <div>
          <p class="eyebrow">Body</p>
          <h1>Body metrics</h1>
        </div>
        <button class="btn btn-primary" (click)="openCreate()">+ Log measurement</button>
      </header>

      @if (formOpen()) {
        <div class="card form-card">
          <h3>{{ editingId() ? 'Edit measurement' : 'New measurement' }}</h3>
          <div class="row">
            <div class="field">
              <label for="date">Date</label>
              <input id="date" type="date" name="date" [(ngModel)]="form.date" required />
            </div>
            <div class="field">
              <label for="weight">Weight (kg)</label>
              <input id="weight" type="number" step="0.1" name="weight" [(ngModel)]="form.weightKg" />
            </div>
            <div class="field">
              <label for="bf">Body fat (%)</label>
              <input id="bf" type="number" step="0.1" name="bf" [(ngModel)]="form.bodyFatPercent" />
            </div>
          </div>
          <div class="row">
            <div class="field">
              <label for="chest">Chest (cm)</label>
              <input id="chest" type="number" step="0.1" name="chest" [(ngModel)]="form.chestCm" />
            </div>
            <div class="field">
              <label for="waist">Waist (cm)</label>
              <input id="waist" type="number" step="0.1" name="waist" [(ngModel)]="form.waistCm" />
            </div>
            <div class="field">
              <label for="hips">Hips (cm)</label>
              <input id="hips" type="number" step="0.1" name="hips" [(ngModel)]="form.hipsCm" />
            </div>
          </div>
          <div class="row">
            <div class="field">
              <label for="arms">Arms (cm)</label>
              <input id="arms" type="number" step="0.1" name="arms" [(ngModel)]="form.armsCm" />
            </div>
            <div class="field">
              <label for="thighs">Thighs (cm)</label>
              <input id="thighs" type="number" step="0.1" name="thighs" [(ngModel)]="form.thighsCm" />
            </div>
            <div class="field">
              <label for="notes">Notes</label>
              <input id="notes" name="notes" [(ngModel)]="form.notes" placeholder="Optional" />
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-ghost" (click)="closeForm()">Cancel</button>
            <button type="button" class="btn btn-primary" (click)="save()">{{ editingId() ? 'Save changes' : 'Log measurement' }}</button>
          </div>
        </div>
      }

      @if (loading()) {
        <p class="empty-state">Loading history…</p>
      } @else if (metrics().length === 0) {
        <p class="empty-state">No measurements logged yet.</p>
      } @else {
        <div class="table">
          <div class="table-head">
            <span>Date</span><span>Weight</span><span>Body fat</span><span>Chest</span><span>Waist</span><span></span>
          </div>
          @for (m of metrics(); track m.id) {
            <div class="table-row">
              <span>{{ m.date | date: 'MMM d, y' }}</span>
              <span class="mono">{{ m.weightKg ?? '—' }}</span>
              <span class="mono">{{ m.bodyFatPercent ?? '—' }}</span>
              <span class="mono">{{ m.chestCm ?? '—' }}</span>
              <span class="mono">{{ m.waistCm ?? '—' }}</span>
              <span class="row-actions">
                <button class="btn btn-ghost small" (click)="openEdit(m)">Edit</button>
                <button class="btn btn-danger small" (click)="remove(m)">Delete</button>
              </span>
            </div>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [`
    .page { max-width: 1050px; margin: 0 auto; padding: 2rem 1.75rem 4rem; }
    .page-head { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
    .eyebrow { text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.75rem; color: var(--text-faint); margin-bottom: 0.25rem; }
    .form-card { margin-bottom: 1.75rem; }
    .row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; }
    .table { border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
    .table-head, .table-row {
      display: grid; grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
      padding: 0.85rem 1.25rem; align-items: center; gap: 0.5rem;
    }
    .table-head { background: var(--surface-raised); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-faint); }
    .table-row { background: var(--surface); border-top: 1px solid var(--border); }
    .row-actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
    .small { padding: 0.35rem 0.65rem; font-size: 0.8rem; }
    @media (max-width: 800px) {
      .row { grid-template-columns: 1fr; }
      .table-head { display: none; }
      .table-row { grid-template-columns: 1fr; }
    }
  `],
})
export class MetricsComponent implements OnInit {
  private service = inject(MetricService);

  metrics = signal<BodyMetricResponse[]>([]);
  loading = signal(true);
  formOpen = signal(false);
  editingId = signal<string | null>(null);

  form: BodyMetricRequest = this.blankForm();

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (data) => { this.metrics.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  blankForm(): BodyMetricRequest {
    return {
      date: today(),
      weightKg: null, bodyFatPercent: null, chestCm: null, waistCm: null,
      hipsCm: null, armsCm: null, thighsCm: null, notes: '',
    };
  }

  openCreate(): void {
    this.form = this.blankForm();
    this.editingId.set(null);
    this.formOpen.set(true);
  }

  openEdit(m: BodyMetricResponse): void {
    this.form = { ...m };
    this.editingId.set(m.id);
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
  }

  save(): void {
    if (!this.form.date) return;
    const id = this.editingId();
    const req$ = id ? this.service.update(id, this.form) : this.service.create(this.form);
    req$.subscribe(() => {
      this.formOpen.set(false);
      this.load();
    });
  }

  remove(m: BodyMetricResponse): void {
    if (!confirm(`Delete the measurement from ${m.date}?`)) return;
    this.service.delete(m.id).subscribe(() => this.load());
  }
}
