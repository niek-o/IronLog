import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import {
  WorkoutSessionRequest,
  WorkoutSessionResponse,
  WorkoutSessionUpdateRequest,
  WorkoutSetRequest,
  WorkoutSetResponse,
} from '../models/models';
import { API_BASE } from './api-base';

@Injectable({ providedIn: 'root' })
export class WorkoutService {
  constructor(private http: HttpClient) {}

  list(take = 50): Observable<WorkoutSessionResponse[]> {
    return this.http.get<WorkoutSessionResponse[]>(`${API_BASE}/workouts?take=${take}`);
  }

  get(id: string): Observable<WorkoutSessionResponse> {
    return this.http.get<WorkoutSessionResponse>(`${API_BASE}/workouts/${id}`);
  }

  start(req: WorkoutSessionRequest): Observable<WorkoutSessionResponse> {
    return this.http.post<WorkoutSessionResponse>(`${API_BASE}/workouts`, req);
  }

  lastForTemplate(templateId: string): Observable<WorkoutSessionResponse | null> {
    return this.http
      .get<WorkoutSessionResponse>(`${API_BASE}/workouts/last-for-template/${templateId}`)
      .pipe(catchError(() => of(null)));
  }

  update(id: string, req: WorkoutSessionUpdateRequest): Observable<WorkoutSessionResponse> {
    return this.http.put<WorkoutSessionResponse>(`${API_BASE}/workouts/${id}`, req);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/workouts/${id}`);
  }

  addSet(sessionId: string, req: WorkoutSetRequest): Observable<WorkoutSetResponse> {
    return this.http.post<WorkoutSetResponse>(`${API_BASE}/workouts/${sessionId}/sets`, req);
  }

  updateSet(sessionId: string, setId: string, req: WorkoutSetRequest): Observable<WorkoutSetResponse> {
    return this.http.put<WorkoutSetResponse>(`${API_BASE}/workouts/${sessionId}/sets/${setId}`, req);
  }

  deleteSet(sessionId: string, setId: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/workouts/${sessionId}/sets/${setId}`);
  }
}
