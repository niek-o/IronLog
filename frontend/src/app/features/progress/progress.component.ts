import { Component, ElementRef, OnInit, OnDestroy, inject, signal, viewChild, effect, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { ExerciseService } from '../../core/services/exercise.service';
import { StatsService } from '../../core/services/stats.service';
import { ExerciseResponse, ExerciseProgressResponse } from '../../core/models/models';
import { CardComponent } from '../../shared/ui';

Chart.register(...registerables);

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [FormsModule, CardComponent],
  templateUrl: './progress.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
