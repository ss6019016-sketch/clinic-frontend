import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, switchMap, startWith } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private api: ApiService) {
    // har 30 second mein unread count refresh hoga (polling)
    interval(30000).pipe(startWith(0), switchMap(() => this.api.get<any>('notifications/unread-count')))
      .subscribe({
        next: (res) => this.unreadCountSubject.next(res?.count ?? 0),
        error: () => {}
      });
  }

  getAll(limit: number = 30): Observable<any> {
    return this.api.get<any>('notifications', { limit });
  }

  markAsRead(id: number): Observable<any> {
    return this.api.patch<any>(`notifications/${id}/read`, {});
  }

  markAllAsRead(): Observable<any> {
    return this.api.patch<any>('notifications/mark-all-read', {});
  }

  delete(id: number): Observable<any> {
    return this.api.delete<any>(`notifications/${id}`);
  }

  refreshUnreadCount(): void {
    this.api.get<any>('notifications/unread-count').subscribe({
      next: (res) => this.unreadCountSubject.next(res?.count ?? 0),
      error: () => {}
    });
  }
}