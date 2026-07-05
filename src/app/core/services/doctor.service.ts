import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class DoctorService {
  constructor(private api: ApiService) {}

  getAll(search?: string): Observable<any[]> {
    return this.api.get<any[]>('doctors', { search });
  }

  getById(id: number): Observable<any> {
    return this.api.get<any>(`doctors/${id}`);
  }

  create(data: any): Observable<any> {
    return this.api.post<any>('doctors', data);
  }

  update(id: number, data: any): Observable<any> {
    return this.api.put<any>(`doctors/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.api.delete<any>(`doctors/${id}`);
  }
}