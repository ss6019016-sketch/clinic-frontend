import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {

  private subject = new Subject<boolean>();

  isVisible  = false;
  title      = 'Confirm Action';
  message    = 'Are you sure you want to proceed?';
  type: 'danger' | 'warning' = 'danger';

  open(title: string, message: string, type: 'danger' | 'warning' = 'danger'): Promise<boolean> {
    this.title     = title;
    this.message   = message;
    this.type      = type;
    this.isVisible = true;

    return new Promise(resolve => {
      const sub = this.subject.subscribe(result => {
        resolve(result);
        this.isVisible = false;
        sub.unsubscribe();
      });
    });
  }

  confirm(): void { this.subject.next(true); }
  cancel():  void { this.subject.next(false); }
}