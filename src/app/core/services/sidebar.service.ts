import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private _isOpen = new BehaviorSubject<boolean>(false);
  state$ = this._isOpen.asObservable();

  toggle(): void {
    this._isOpen.next(!this._isOpen.value);
  }

  open():  void { this._isOpen.next(true);  }
  close(): void { this._isOpen.next(false); }

  get isOpen(): boolean {
    return this._isOpen.value;
  }
}