import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExerciseRequest, ExerciseResponse, MuscleCategory } from '../models/models';
import { API_BASE } from './api-base';

@Injectable({ providedIn: 'root' })
export class ExerciseService {
  constructor(private http: HttpClient) {}

  list(category?: MuscleCategory): Observable<ExerciseResponse[]> {
    const url = category ? `${API_BASE}/exercises?category=${category}` : `${API_BASE}/exercises`;
    return this.http.get<ExerciseResponse[]>(url);
  }

  create(req: ExerciseRequest): Observable<ExerciseResponse> {
    return this.http.post<ExerciseResponse>(`${API_BASE}/exercises`, req);
  }

  update(id: string, req: ExerciseRequest): Observable<ExerciseResponse> {
    return this.http.put<ExerciseResponse>(`${API_BASE}/exercises/${id}`, req);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/exercises/${id}`);
  }
}
