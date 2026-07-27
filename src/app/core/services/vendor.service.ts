import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class VendorService {
  constructor(private api: ApiService) {}

  getAll(search?: string): Observable<any> {
    return this.api.get<any>('vendors', { search });
  }

  getById(id: number): Observable<any> {
    return this.api.get<any>(`vendors/${id}`);
  }

  create(data: any): Observable<any> {
    return this.api.post<any>('vendors', data);
  }

  update(id: number, data: any): Observable<any> {
    return this.api.put<any>(`vendors/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.api.delete<any>(`vendors/${id}`);
  }
}