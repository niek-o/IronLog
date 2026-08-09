import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BodyMetricRequest, BodyMetricResponse } from '../models/models';
import { API_BASE } from './api-base';

@Injectable({ providedIn: 'root' })
export class MetricService {
  constructor(private http: HttpClient) {}

  list(): Observable<BodyMetricResponse[]> {
    return this.http.get<BodyMetricResponse[]>(`${API_BASE}/metrics`);
  }

  create(req: BodyMetricRequest): Observable<BodyMetricResponse> {
    return this.http.post<BodyMetricResponse>(`${API_BASE}/metrics`, req);
  }

  update(id: string, req: BodyMetricRequest): Observable<BodyMetricResponse> {
    return this.http.put<BodyMetricResponse>(`${API_BASE}/metrics/${id}`, req);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/metrics/${id}`);
  }
}
