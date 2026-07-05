import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  constructor(private api: ApiService) {}

  getRevenue(from?: string, to?: string): Observable<any[]> {
    return this.api.get<any[]>('reports/revenue', { from, to });
  }

  getTopDoctors(): Observable<any[]> {
    return this.api.get<any[]>('reports/top-doctors');
  }

  getAppointmentStats(from?: string, to?: string): Observable<any[]> {
    return this.api.get<any[]>('reports/appointments', { from, to });
  }

  getSummary(): Observable<any> {
    return this.api.get<any>('reports/summary');
  }
}