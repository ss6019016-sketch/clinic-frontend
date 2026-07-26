import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class DoctorService {
  constructor(private api: ApiService) {}

  getAll(search?: string, page: number = 1, pageSize: number = 10): Observable<any> {
    return this.api.get<any>('doctors', { search, page, pageSize });
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

  getTrash(): Observable<any> {
    return this.api.get<any>('doctors/trash');
  }

  restore(id: number): Observable<any> {
    return this.api.patch<any>(`doctors/${id}/restore`, {});
  }

  permanentDelete(id: number): Observable<any> {
    return this.api.delete<any>(`doctors/${id}/permanent`);
  }
}