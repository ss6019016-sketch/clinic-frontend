import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorService } from 'src/app/core/services/doctor.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { ConfirmDialogService } from 'src/app/core/services/confirm-dialog.service';
import { DoctorAvailability, DoctorAvailabilityService } from 'src/app/core/services/doctor-avalilability.service';

@Component({
  selector: 'app-doctor-details',
  templateUrl: './doctor-details.component.html',
  styleUrls: ['./doctor-details.component.css']
})
export class DoctorDetailsComponent implements OnInit {

  doctor: any = null;
  isLoading   = true;
  doctorId: number = 0;

  // ── Weekly Schedule ──
  schedule: DoctorAvailability[] = [];
  scheduleLoading = true;
  savingSlot = false;

  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  newSlot = {
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '17:00',
    slotDurationMinutes: 30
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorService,
    private toast: ToastService,
    private confirm: ConfirmDialogService,
    private availabilityService: DoctorAvailabilityService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.doctorId = +id;
      this.loadDoctor(+id);
      this.loadSchedule(+id);
    }
  }

  loadDoctor(id: number): void {
    this.isLoading = true;
    this.doctorService.getById(id).subscribe({
      next: (data) => {
        this.doctor    = data;
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Failed to load doctor');
        this.isLoading = false;
        this.router.navigate(['/doctors']);
      }
    });
  }

  async deleteDoctor(): Promise<void> {
    const result = await this.confirm.open(
      'Delete Doctor',
      'Are you sure you want to delete this doctor?',
      'danger'
    );
    if (!result) return;

    this.doctorService.delete(this.doctorId).subscribe({
      next: () => {
        this.toast.success('Doctor deleted successfully!');
        this.router.navigate(['/doctors']);
      },
      error: () => this.toast.error('Failed to delete doctor')
    });
  }

  // ── Weekly Schedule ──

  loadSchedule(doctorId: number): void {
    this.scheduleLoading = true;
    this.availabilityService.getByDoctor(doctorId).subscribe({
      next: (data) => {
        this.schedule = data;
        this.scheduleLoading = false;
      },
      error: () => {
        this.toast.error('Failed to load schedule');
        this.scheduleLoading = false;
      }
    });
  }

  addSlot(): void {
    if (this.newSlot.startTime >= this.newSlot.endTime) {
      this.toast.error('Start time must be before end time');
      return;
    }

    this.savingSlot = true;
    this.availabilityService.create({
      doctorId: this.doctorId,
      dayOfWeek: this.newSlot.dayOfWeek,
      startTime: this.newSlot.startTime + ':00',
      endTime: this.newSlot.endTime + ':00',
      slotDurationMinutes: this.newSlot.slotDurationMinutes,
      isActive: true
    }).subscribe({
      next: () => {
        this.toast.success('Schedule slot added');
        this.savingSlot = false;
        this.loadSchedule(this.doctorId);
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Failed to add slot');
        this.savingSlot = false;
      }
    });
  }

  async deleteSlot(slot: DoctorAvailability): Promise<void> {
    const result = await this.confirm.open(
      'Remove Schedule Slot',
      `Remove ${slot.dayOfWeek} (${this.formatTime(slot.startTime)} - ${this.formatTime(slot.endTime)})?`,
      'danger'
    );
    if (!result) return;

    this.availabilityService.delete(slot.id).subscribe({
      next: () => {
        this.toast.success('Slot removed');
        this.schedule = this.schedule.filter(s => s.id !== slot.id);
      },
      error: () => this.toast.error('Failed to remove slot')
    });
  }

  formatTime(t: string): string {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
  }

  // Grouped by day so the UI can show "Monday — 2 slots" instead of a flat list
  get scheduleByDay(): { day: string; slots: DoctorAvailability[] }[] {
    return this.daysOfWeek
      .map(day => ({ day, slots: this.schedule.filter(s => s.dayOfWeek === day) }))
      .filter(g => g.slots.length > 0);
  }
}