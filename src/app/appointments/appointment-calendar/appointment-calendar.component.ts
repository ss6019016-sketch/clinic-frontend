
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppointmentService } from 'src/app/core/services/appointment.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { PermissionService } from 'src/app/core/services/permission.service';
 
interface CalendarDay {
  date: Date;
  inMonth: boolean;
  isToday: boolean;
  dateKey: string;
  appointments: any[];
}
 
@Component({
  selector: 'app-appointment-calendar',
  templateUrl: './appointment-calendar.component.html',
  styleUrls: ['./appointment-calendar.component.css']
})
export class AppointmentCalendarComponent implements OnInit {
 
  viewDate = new Date();
  weeks: CalendarDay[][] = [];
  isLoading = true;
  weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
 
  private allAppointments: any[] = [];
 
  constructor(
    private apptService: AppointmentService,
    private toast: ToastService,
    private router: Router,
    public permissionService: PermissionService
  ) {}
 
  ngOnInit(): void {
    this.loadMonth();
  }
 
  loadMonth(): void {
    this.isLoading = true;
    // Fetch a large page so we effectively get "all" appointments to filter client-side by month.
    this.apptService.getAll(undefined, undefined, 1, 1000).subscribe({
      next: (res) => {
        this.allAppointments = res?.items ?? res ?? [];
        this.buildCalendar();
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Failed to load appointments');
        this.isLoading = false;
      }
    });
  }
 
  buildCalendar(): void {
    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startOffset = firstOfMonth.getDay(); // 0 = Sunday
    const gridStart = new Date(year, month, 1 - startOffset);
    const todayKey = this.toKey(new Date());
 
    const days: CalendarDay[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      const key = this.toKey(d);
      days.push({
        date: d,
        inMonth: d.getMonth() === month,
        isToday: key === todayKey,
        dateKey: key,
        appointments: this.allAppointments
          .filter(a => (a.appointmentDate || '').split('T')[0] === key)
          .sort((a, b) => (a.appointmentTime || '').localeCompare(b.appointmentTime || ''))
      });
    }
 
    this.weeks = [];
    for (let w = 0; w < 6; w++) {
      this.weeks.push(days.slice(w * 7, w * 7 + 7));
    }
  }
 
  toKey(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
 
  get monthLabel(): string {
    return this.viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
 
  prevMonth(): void {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
    this.buildCalendar();
  }
 
  nextMonth(): void {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
    this.buildCalendar();
  }
 
  goToday(): void {
    this.viewDate = new Date();
    this.buildCalendar();
  }
 
  statusClass(status: string): string {
    const map: any = {
      Confirmed: 'chip-confirmed',
      Pending: 'chip-pending',
      Completed: 'chip-completed',
      Cancelled: 'chip-cancelled'
    };
    return map[status] || 'chip-pending';
  }
 
  addAppointment(day: CalendarDay): void {
    if (!this.permissionService.canCreate('Appointments')) return;
    this.router.navigate(['/appointments/add'], { queryParams: { date: day.dateKey } });
  }
 
  openAppointment(appt: any, ev: Event): void {
    ev.stopPropagation();
    this.router.navigate(['/appointments/edit', appt.id]);
  }
}