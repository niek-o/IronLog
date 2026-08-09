import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardSummary, ExerciseProgressResponse } from '../models/models';
import { API_BASE } from './api-base';

@Injectable({ providedIn: 'root' })
export class StatsService {
  constructor(private http: HttpClient) {}

  dashboard(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${API_BASE}/stats/dashboard`);
  }

  progressFor(exerciseId: string): Observable<ExerciseProgressResponse> {
    return this.http.get<ExerciseProgressResponse>(`${API_BASE}/stats/progress/${exerciseId}`);
  }
}
