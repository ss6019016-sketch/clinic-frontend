import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/core/services/notification.service';

@Component({
  selector: 'app-notification-bell',
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.css']
})
export class NotificationBellComponent implements OnInit {
  isOpen = false;
  notifications: any[] = [];
  unreadCount = 0;

  constructor(private notificationService: NotificationService, private router: Router) {}

  ngOnInit(): void {
    this.notificationService.unreadCount$.subscribe(count => this.unreadCount = count);
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService.getAll(20).subscribe({ next: (res) => this.notifications = res });
  }

  onClickNotification(n: any): void {
    if (!n.isRead) {
      this.notificationService.markAsRead(n.id).subscribe(() => {
        n.isRead = true;
        this.notificationService.refreshUnreadCount();
      });
    }
    this.isOpen = false;
    if (n.link) this.router.navigateByUrl(n.link);
  }

  markAllRead(): void {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.forEach(n => n.isRead = true);
      this.notificationService.refreshUnreadCount();
    });
  }

  getIcon(type: string): string {
    const map: any = { LowStock: 'bi-exclamation-triangle-fill', Appointment: 'bi-calendar-check-fill', System: 'bi-gear-fill' };
    return map[type] || 'bi-info-circle-fill';
  }
}