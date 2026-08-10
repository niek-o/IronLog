import { Component, ElementRef, OnDestroy, OnInit, inject, signal, viewChild, effect, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { NgxNumberTickerComponent } from '@omnedia/ngx-number-ticker';
import { AuthService } from '../../core/services/auth.service';
import { StatsService } from '../../core/services/stats.service';
import { DashboardSummary } from '../../core/models/models';
import { ButtonComponent, CardComponent } from '../../shared/ui';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, ButtonComponent, CardComponent, NgxNumberTickerComponent],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private statsService = inject(StatsService);

  volumeChart = viewChild<ElementRef<HTMLCanvasElement>>('volumeChart');
  private chart?: Chart;

  summary = signal<DashboardSummary | null>(null);

  round = Math.round;

  constructor() {
    effect(() => {
      const canvasRef = this.volumeChart();
      const data = this.summary();
      if (!canvasRef || !data || !data.weeklyVolume.length || this.chart) return;

      const ctx = canvasRef.nativeElement.getContext('2d');
      if (!ctx) return;

      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.weeklyVolume.map((v) => v.week),
          datasets: [
            {
              label: 'Volume (kg)',
              data: data.weeklyVolume.map((v) => v.totalVolumeKg),
              backgroundColor: '#e8ff57',
              borderRadius: 4,
              maxBarThickness: 36,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#9ba1ac' }, grid: { display: false } },
            y: { ticks: { color: '#9ba1ac' }, grid: { color: '#2e333d' } },
          },
        },
      });
    });
  }

  ngOnInit(): void {
    this.statsService.dashboard().subscribe((data) => this.summary.set(data));
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
