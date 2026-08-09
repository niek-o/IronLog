import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../../core/services/auth.service';
import { StatsService } from '../../core/services/stats.service';
import { DashboardSummary } from '../../core/models/models';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <div class="page">
      <header class="page-head">
        <div>
          <p class="eyebrow">Overview</p>
          <h1>Welcome back, {{ auth.currentUser()?.firstName }}</h1>
        </div>
        <a routerLink="/workouts" class="btn btn-primary">+ Start a workout</a>
      </header>

      @if (summary) {
        <div class="stat-grid">
          <div class="card stat">
            <span class="stat-value mono">{{ summary!.totalWorkouts }}</span>
            <span class="stat-label">Total workouts</span>
          </div>
          <div class="card stat">
            <span class="stat-value mono">{{ summary!.workoutsThisWeek }}</span>
            <span class="stat-label">This week</span>
          </div>
          <div class="card stat">
            <span class="stat-value mono">{{ summary!.totalVolumeKgThisWeek | number: '1.0-0' }}<small>kg</small></span>
            <span class="stat-label">Volume this week</span>
          </div>
          <div class="card stat">
            <span class="stat-value mono accent">{{ summary!.currentStreakDays }}<small>d</small></span>
            <span class="stat-label">Current streak</span>
          </div>
        </div>

        <div class="grid-2">
          <div class="card">
            <h3>Weekly volume — last 8 weeks</h3>
            @if (summary!.weeklyVolume.length) {
              <canvas #volumeChart height="220"></canvas>
            } @else {
              <p class="empty-state">Log a workout to see your volume trend here.</p>
            }
          </div>

          <div class="card">
            <h3>Latest body metrics</h3>
            @if (summary!.latestBodyMetric; as m) {
              <ul class="metric-list">
                @if (m.weightKg) { <li><span>Weight</span><span class="mono">{{ m.weightKg }} kg</span></li> }
                @if (m.bodyFatPercent) { <li><span>Body fat</span><span class="mono">{{ m.bodyFatPercent }}%</span></li> }
                @if (m.chestCm) { <li><span>Chest</span><span class="mono">{{ m.chestCm }} cm</span></li> }
                @if (m.waistCm) { <li><span>Waist</span><span class="mono">{{ m.waistCm }} cm</span></li> }
                @if (m.armsCm) { <li><span>Arms</span><span class="mono">{{ m.armsCm }} cm</span></li> }
              </ul>
              <p class="metric-date">as of {{ m.date }}</p>
            } @else {
              <p class="empty-state">No body metrics logged yet.</p>
            }
            <a routerLink="/metrics" class="btn btn-ghost small-link">Log a measurement →</a>
          </div>
        </div>
      } @else {
        <p class="empty-state">Loading your stats…</p>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1100px; margin: 0 auto; padding: 2rem 1.75rem 4rem; }
    .page-head { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 1.75rem; flex-wrap: wrap; gap: 1rem; }
    .eyebrow { text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.75rem; color: var(--text-faint); margin-bottom: 0.25rem; }
    .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .stat { display: flex; flex-direction: column; gap: 0.4rem; }
    .stat-value { font-size: 2rem; font-weight: 700; }
    .stat-value small { font-size: 1rem; color: var(--text-faint); margin-left: 0.15rem; }
    .stat-value.accent { color: var(--accent); }
    .stat-label { color: var(--text-dim); font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.03em; }
    .grid-2 { display: grid; grid-template-columns: 1.4fr 1fr; gap: 1.25rem; }
    .metric-list { list-style: none; padding: 0; margin: 0 0 0.75rem; }
    .metric-list li { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border); }
    .metric-list li:last-child { border-bottom: none; }
    .metric-date { font-size: 0.78rem; color: var(--text-faint); margin-bottom: 0.75rem; }
    .small-link { padding: 0.4rem 0.6rem; }
    @media (max-width: 900px) {
      .stat-grid { grid-template-columns: repeat(2, 1fr); }
      .grid-2 { grid-template-columns: 1fr; }
    }
  `],
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  auth = inject(AuthService);
  private statsService = inject(StatsService);

  @ViewChild('volumeChart') volumeChartRef?: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;

  summary: DashboardSummary | null = null;

  ngOnInit(): void {
    this.statsService.dashboard().subscribe((data) => {
      this.summary = data;
      queueMicrotask(() => this.renderChart());
    });
  }

  ngAfterViewInit(): void {
    this.renderChart();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private renderChart(): void {
    if (!this.summary || !this.volumeChartRef || this.chart) return;
    if (!this.summary.weeklyVolume.length) return;

    const ctx = this.volumeChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.summary.weeklyVolume.map((v) => v.week),
        datasets: [
          {
            label: 'Volume (kg)',
            data: this.summary.weeklyVolume.map((v) => v.totalVolumeKg),
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
  }
}
