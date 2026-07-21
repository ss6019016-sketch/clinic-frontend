import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  constructor(private api: ApiService) {}

  getAll(status?: string, search?: string): Observable<any[]> {
    return this.api.get<any[]>('appointments', { status, search });
  }

  getById(id: number): Observable<any> {
    return this.api.get<any>(`appointments/${id}`);
  }

  create(data: any): Observable<any> {
    return this.api.post<any>('appointments', data);
  }

  update(id: number, data: any): Observable<any> {
    return this.api.put<any>(`appointments/${id}`, data);
  }

  updateStatus(id: number, status: string): Observable<any> {
    return this.api.patch<any>(`appointments/${id}/status`, JSON.stringify(status));
  }

  delete(id: number): Observable<any> {
    return this.api.delete<any>(`appointments/${id}`);
  }

  sendReminder(id: number): Observable<any> {
    return this.api.post<any>(`appointments/${id}/send-reminder`, {});
  }
}