import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { PatientService } from 'src/app/core/services/patient.service';
import { DoctorService } from 'src/app/core/services/doctor.service';
import { StaffService } from 'src/app/core/services/staff.service';
import { BillingService } from 'src/app/core/services/billing.service';
import { PrescriptionService } from 'src/app/core/services/prescription.service';
import { AppointmentService } from 'src/app/core/services/appointment.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { ConfirmDialogService } from 'src/app/core/services/confirm-dialog.service';

type EntityType = 'Patient' | 'Doctor' | 'Staff' | 'Invoice' | 'Prescription' | 'Appointment';

export interface TrashItem {
  entity: EntityType;
  id: number;
  title: string;
  subtitle: string;
  deletedAt: string | null;
  icon: string;
}

@Component({
  selector: 'app-trash',
  templateUrl: './trash.component.html',
  styleUrls: ['./trash.component.css']
})
export class TrashComponent implements OnInit {

  allItems: TrashItem[] = [];
  items: TrashItem[] = [];
  isLoading = true;
  restoringId: string | null = null;

  entityFilter = '';
  entityOptions: EntityType[] = ['Patient', 'Doctor', 'Staff', 'Invoice', 'Prescription', 'Appointment'];

  skeletonRows = [1, 2, 3, 4, 5];

  constructor(
    private patientService: PatientService,
    private doctorService: DoctorService,
    private staffService: StaffService,
    private billingService: BillingService,
    private prescriptionService: PrescriptionService,
    private appointmentService: AppointmentService,
    private toast: ToastService,
    private confirmDialog: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;

    forkJoin({
      patients: this.patientService.getTrash(),
      doctors: this.doctorService.getTrash(),
      staff: this.staffService.getTrash(),
      invoices: this.billingService.getTrash(),
      prescriptions: this.prescriptionService.getTrash(),
      appointments: this.appointmentService.getTrash()
    }).subscribe({
      next: (res) => {
        const patients: TrashItem[] = (res.patients || []).map((p: any) => ({
          entity: 'Patient' as EntityType,
          id: p.id,
          title: p.fullName,
          subtitle: p.phone,
          deletedAt: null,
          icon: 'bi-person-fill'
        }));

        const doctors: TrashItem[] = (res.doctors || []).map((d: any) => ({
          entity: 'Doctor' as EntityType,
          id: d.id,
          title: 'Dr. ' + d.fullName,
          subtitle: d.specialization,
          deletedAt: null,
          icon: 'bi-person-badge-fill'
        }));

        const staff: TrashItem[] = (res.staff || []).map((s: any) => ({
          entity: 'Staff' as EntityType,
          id: s.id,
          title: s.fullName,
          subtitle: s.role,
          deletedAt: s.deletedAt,
          icon: 'bi-person-vcard-fill'
        }));

        const invoices: TrashItem[] = (res.invoices?.items || res.invoices || []).map((i: any) => ({
          entity: 'Invoice' as EntityType,
          id: i.id,
          title: i.invoiceNumber,
          subtitle: `${i.patientName} — Rs. ${i.grandTotal}`,
          deletedAt: i.deletedAt,
          icon: 'bi-receipt'
        }));

        const prescriptions: TrashItem[] = (res.prescriptions?.items || res.prescriptions || []).map((p: any) => ({
          entity: 'Prescription' as EntityType,
          id: p.id,
          title: p.diagnosis || 'Prescription',
          subtitle: `${p.patientName} — Dr. ${p.doctorName}`,
          deletedAt: p.deletedAt,
          icon: 'bi-capsule'
        }));

        const appointments: TrashItem[] = (res.appointments?.items || res.appointments || []).map((a: any) => ({
          entity: 'Appointment' as EntityType,
          id: a.id,
          title: `${a.patientName} with Dr. ${a.doctorName}`,
          subtitle: `${a.appointmentDate?.split('T')[0]} at ${a.appointmentTime}`,
          deletedAt: a.deletedAt,
          icon: 'bi-calendar-check-fill'
        }));

        this.allItems = [
          ...patients, ...doctors, ...staff,
          ...invoices, ...prescriptions, ...appointments
        ].sort((a, b) => {
          if (!a.deletedAt) return 1;
          if (!b.deletedAt) return -1;
          return new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime();
        });

        this.applyFilter();
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Trash load nahi ho saka');
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    this.items = this.entityFilter
      ? this.allItems.filter(i => i.entity === this.entityFilter)
      : this.allItems;
  }

  clearFilter(): void {
    this.entityFilter = '';
    this.applyFilter();
  }

  private serviceFor(entity: EntityType) {
    switch (entity) {
      case 'Patient': return this.patientService;
      case 'Doctor': return this.doctorService;
      case 'Staff': return this.staffService;
      case 'Invoice': return this.billingService;
      case 'Prescription': return this.prescriptionService;
      case 'Appointment': return this.appointmentService;
    }
  }

  private key(item: TrashItem): string {
    return `${item.entity}-${item.id}`;
  }

  restore(item: TrashItem): void {
    this.restoringId = this.key(item);
    this.serviceFor(item.entity).restore(item.id).subscribe({
      next: () => {
        this.toast.success(`${item.entity} restore ho gaya`);
        this.allItems = this.allItems.filter(i => this.key(i) !== this.key(item));
        this.applyFilter();
        this.restoringId = null;
      },
      error: () => {
        this.toast.error('Restore fail ho gaya');
        this.restoringId = null;
      }
    });
  }

  async permanentDelete(item: TrashItem): Promise<void> {
    const confirmed = await this.confirmDialog.open(
      'Permanently Delete?',
      `"${item.title}" hamesha ke liye delete ho jayega. Ye action wapas nahi ho sakta.`,
      'danger'
    );
    if (!confirmed) return;

    this.serviceFor(item.entity).permanentDelete(item.id).subscribe({
      next: () => {
        this.toast.success(`${item.entity} permanently delete ho gaya`);
        this.allItems = this.allItems.filter(i => this.key(i) !== this.key(item));
        this.applyFilter();
      },
      error: () => this.toast.error('Permanent delete fail ho gaya')
    });
  }

  get totalCount(): number {
    return this.allItems.length;
  }

  countFor(entity: EntityType): number {
    return this.allItems.filter(i => i.entity === entity).length;
  }
}