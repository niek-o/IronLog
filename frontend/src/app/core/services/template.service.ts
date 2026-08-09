import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TemplateRequest, TemplateResponse } from '../models/models';
import { API_BASE } from './api-base';

@Injectable({ providedIn: 'root' })
export class TemplateService {
  constructor(private http: HttpClient) {}

  list(): Observable<TemplateResponse[]> {
    return this.http.get<TemplateResponse[]>(`${API_BASE}/templates`);
  }

  get(id: string): Observable<TemplateResponse> {
    return this.http.get<TemplateResponse>(`${API_BASE}/templates/${id}`);
  }

  create(req: TemplateRequest): Observable<TemplateResponse> {
    return this.http.post<TemplateResponse>(`${API_BASE}/templates`, req);
  }

  update(id: string, req: TemplateRequest): Observable<TemplateResponse> {
    return this.http.put<TemplateResponse>(`${API_BASE}/templates/${id}`, req);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/templates/${id}`);
  }
}
