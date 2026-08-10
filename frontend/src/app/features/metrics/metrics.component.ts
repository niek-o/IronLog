import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MetricService } from '../../core/services/metric.service';
import { BodyMetricRequest, BodyMetricResponse } from '../../core/models/models';
import { ButtonComponent, CardComponent, ConfirmService } from '../../shared/ui';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [FormsModule, DatePipe, ButtonComponent, CardComponent],
  templateUrl: './metrics.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricsComponent implements OnInit {
  private service = inject(MetricService);
  private confirmService = inject(ConfirmService);

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
    this.confirmService
      .confirm({ title: 'Delete measurement', message: `Delete the measurement from ${m.date}?`, confirmLabel: 'Delete', danger: true })
      .subscribe((confirmed) => {
        if (confirmed) this.service.delete(m.id).subscribe(() => this.load());
      });
  }
}
