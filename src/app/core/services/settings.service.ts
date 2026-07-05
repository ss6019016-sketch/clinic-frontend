import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  constructor(private api: ApiService) {}

  get(): Observable<any> {
    return this.api.get<any>('settings');
  }

  update(data: any): Observable<any> {
    return this.api.put<any>('settings', data);
  }

  changePassword(data: any): Observable<any> {
    return this.api.put<any>('settings/change-password', data);
  }
}