import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class StaffService {
  constructor(private api: ApiService) {}

  getAll(search?: string): Observable<any[]> {
    return this.api.get<any[]>('staff', { search });
  }

  getById(id: number): Observable<any> {
    return this.api.get<any>(`staff/${id}`);
  }

  create(data: any): Observable<any> {
    return this.api.post<any>('staff', data);
  }

  update(id: number, data: any): Observable<any> {
    return this.api.put<any>(`staff/${id}`, data);
  }

  updateStatus(id: number, status: string): Observable<any> {
    return this.api.patch<any>(`staff/${id}/status`, { status });
  }

  delete(id: number): Observable<any> {
    return this.api.delete<any>(`staff/${id}`);
  }
}