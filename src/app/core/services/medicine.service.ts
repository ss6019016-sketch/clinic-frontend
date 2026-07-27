import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class MedicineService {
  constructor(private api: ApiService) {}

  getAll(search?: string, page: number = 1, pageSize: number = 10): Observable<any> {
    return this.api.get<any>('medicines', { search, page, pageSize });
  }

  getById(id: number): Observable<any> {
    return this.api.get<any>(`medicines/${id}`);
  }

  getLowStock(): Observable<any> {
    return this.api.get<any>('medicines/low-stock');
  }

  getStockLogs(id: number): Observable<any> {
    return this.api.get<any>(`medicines/${id}/stock-logs`);
  }

  create(data: any): Observable<any> {
    return this.api.post<any>('medicines', data);
  }

  update(id: number, data: any): Observable<any> {
    return this.api.put<any>(`medicines/${id}`, data);
  }

  adjustStock(id: number, quantity: number, notes?: string): Observable<any> {
    return this.api.post<any>(`medicines/${id}/adjust-stock`, { quantity, notes });
  }

  delete(id: number): Observable<any> {
    return this.api.delete<any>(`medicines/${id}`);
  }

  getTrash(): Observable<any> {
    return this.api.get<any>('medicines/trash');
  }

  restore(id: number): Observable<any> {
    return this.api.patch<any>(`medicines/${id}/restore`, {});
  }

  permanentDelete(id: number): Observable<any> {
    return this.api.delete<any>(`medicines/${id}/permanent`);
  }
}