import { Component, ElementRef, OnInit, OnDestroy, inject, signal, viewChild, effect, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { ExerciseService } from '../../core/services/exercise.service';
import { StatsService } from '../../core/services/stats.service';
import { ExerciseResponse, ExerciseProgressResponse } from '../../core/models/models';

Chart.register(...registerables);

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <header class="page-head">
        <div>
          <p class="eyebrow">Trends</p>
          <h1>Progress</h1>
        </div>
      </header>

      <div class="card picker-card">
        <div class="field">
          <label for="exercise">Exercise</label>
          <select id="exercise" name="exercise" [(ngModel)]="selectedExerciseId" (ngModelChange)="onSelect($event)">
            <option value="" disabled>Choose an exercise</option>
            @for (ex of exercises(); track ex.id) {
              <option [value]="ex.id">{{ ex.name }}</option>
            }
          </select>
        </div>
      </div>

      @if (loading()) {
        <p class="empty-state">Loading progress…</p>
      } @else if (progress() && progress()!.points.length === 0) {
        <p class="empty-state">No completed sets logged for this exercise yet.</p>
      } @else if (progress()) {
        <div class="card">
          <h3>{{ progress()!.exerciseName }} — estimated 1RM &amp; max weight over time</h3>
          <canvas #progressChart height="260"></canvas>
        </div>
      } @else {
        <p class="empty-state">Pick an exercise above to see your trend.</p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .page { max-width: 1000px; margin: 0 auto; padding: 2rem 1.75rem 4rem; }
    .page-head { margin-bottom: 1.5rem; }
    .eyebrow { text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.75rem; color: var(--text-faint); margin-bottom: 0.25rem; }
    .picker-card { margin-bottom: 1.5rem; max-width: 380px; }
    .picker-card .field { margin-bottom: 0; }
  `],
})
export class ProgressComponent implements OnInit, OnDestroy {
  private exerciseService = inject(ExerciseService);
  private statsService = inject(StatsService);

  progressChart = viewChild<ElementRef<HTMLCanvasElement>>('progressChart');
  private chart?: Chart;

  exercises = signal<ExerciseResponse[]>([]);
  progress = signal<ExerciseProgressResponse | null>(null);
  loading = signal(false);
  selectedExerciseId = '';

  constructor() {
    effect(() => {
      const canvasRef = this.progressChart();
      const data = this.progress();

      this.chart?.destroy();
      this.chart = undefined;

      if (!canvasRef || !data || !data.points.length) return;

      const ctx = canvasRef.nativeElement.getContext('2d');
      if (!ctx) return;

      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.points.map((p) => new Date(p.date).toLocaleDateString()),
          datasets: [
            {
              label: 'Estimated 1RM (kg)',
              data: data.points.map((p) => p.estimatedOneRepMax),
              borderColor: '#e8ff57',
              backgroundColor: 'rgba(232,255,87,0.12)',
              tension: 0.3,
              fill: true,
            },
            {
              label: 'Max weight (kg)',
              data: data.points.map((p) => p.maxWeightKg),
              borderColor: '#5db4ff',
              backgroundColor: 'transparent',
              tension: 0.3,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: { legend: { labels: { color: '#9ba1ac' } } },
          scales: {
            x: { ticks: { color: '#9ba1ac' }, grid: { display: false } },
            y: { ticks: { color: '#9ba1ac' }, grid: { color: '#2e333d' } },
          },
        },
      });
    });
  }

  ngOnInit(): void {
    this.exerciseService.list().subscribe((data) => this.exercises.set(data));
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  onSelect(exerciseId: string): void {
    if (!exerciseId) return;
    this.loading.set(true);

    this.statsService.progressFor(exerciseId).subscribe({
      next: (data) => {
        this.progress.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
