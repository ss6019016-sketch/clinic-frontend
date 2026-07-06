import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private isOpen$ = new BehaviorSubject<boolean>(false);
  state$ = this.isOpen$.asObservable();

  toggle(): void {
    this.isOpen$.next(!this.isOpen$.value);
  }

  open():  void { this.isOpen$.next(true); }
  close(): void { this.isOpen$.next(false); }
}