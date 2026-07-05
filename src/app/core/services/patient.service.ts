import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class PatientService {
  constructor(private api: ApiService) {}

  getAll(search?: string): Observable<any[]> {
    return this.api.get<any[]>('patients', { search });
  }

  getById(id: number): Observable<any> {
    return this.api.get<any>(`patients/${id}`);
  }

  create(data: any): Observable<any> {
    return this.api.post<any>('patients', data);
  }

  update(id: number, data: any): Observable<any> {
    return this.api.put<any>(`patients/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.api.delete<any>(`patients/${id}`);
  }
}