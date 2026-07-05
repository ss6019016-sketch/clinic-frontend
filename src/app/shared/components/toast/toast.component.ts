import { Component } from '@angular/core';
import { ToastService, Toast } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent {
  toasts$ = this.toastService.toasts;
  constructor(public toastService: ToastService) {}
  trackById(_: number, t: Toast) { return t.id; }
}