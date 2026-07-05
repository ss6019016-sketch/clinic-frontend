import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class PrescriptionService {
  constructor(private api: ApiService) {}

  getAll(search?: string): Observable<any[]> {
    return this.api.get<any[]>('prescriptions', { search });
  }

  getById(id: number): Observable<any> {
    return this.api.get<any>(`prescriptions/${id}`);
  }

  getByPatient(patientId: number): Observable<any[]> {
    return this.api.get<any[]>(`prescriptions/patient/${patientId}`);
  }

  create(data: any): Observable<any> {
    return this.api.post<any>('prescriptions', data);
  }

  update(id: number, data: any): Observable<any> {
    return this.api.put<any>(`prescriptions/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.api.delete<any>(`prescriptions/${id}`);
  }
}