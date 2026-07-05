import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class BillingService {
  constructor(private api: ApiService) {}

  getAll(status?: string, search?: string): Observable<any[]> {
    return this.api.get<any[]>('billing', { status, search });
  }

  getById(id: number): Observable<any> {
    return this.api.get<any>(`billing/${id}`);
  }

  create(data: any): Observable<any> {
    return this.api.post<any>('billing', data);
  }

  update(id: number, data: any): Observable<any> {
    return this.api.put<any>(`billing/${id}`, data);
  }

  updateStatus(id: number, data: any): Observable<any> {
    return this.api.patch<any>(`billing/${id}/status`, data);
  }

  delete(id: number): Observable<any> {
    return this.api.delete<any>(`billing/${id}`);
  }
}