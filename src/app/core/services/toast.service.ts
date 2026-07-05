import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toasts$ = new BehaviorSubject<Toast[]>([]);
  toasts = this.toasts$.asObservable();
  private counter = 0;

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success'): void {
    const id = ++this.counter;
    const current = this.toasts$.value;
    this.toasts$.next([...current, { id, message, type }]);
    setTimeout(() => this.remove(id), 3500);
  }

  success(msg: string) { this.show(msg, 'success'); }
  error(msg: string)   { this.show(msg, 'error');   }
  warning(msg: string) { this.show(msg, 'warning'); }
  info(msg: string)    { this.show(msg, 'info');    }

  remove(id: number): void {
    this.toasts$.next(this.toasts$.value.filter(t => t.id !== id));
  }
}