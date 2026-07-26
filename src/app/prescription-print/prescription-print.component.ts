import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PrescriptionService } from 'src/app/core/services/prescription.service';
import { SettingsService } from 'src/app/core/services/settings.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-prescription-print',
  templateUrl: './prescription-print.component.html',
  styleUrls: ['./prescription-print.component.css']
})
export class PrescriptionPrintComponent implements OnInit {

  prescription: any = null;
  clinic: any = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private prescriptionService: PrescriptionService,
    private settingsService: SettingsService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/prescriptions']); return; }

    let rxReady = false;
    let clinicReady = false;
    const checkDone = () => { if (rxReady && clinicReady) this.isLoading = false; };

    this.prescriptionService.getById(+id).subscribe({
      next: (data) => { this.prescription = data; rxReady = true; checkDone(); },
      error: () => {
        this.toast.error('Failed to load prescription');
        this.router.navigate(['/prescriptions']);
      }
    });

    this.settingsService.get().subscribe({
      next: (data) => { this.clinic = data; clinicReady = true; checkDone(); },
      error: () => { this.clinic = {}; clinicReady = true; checkDone(); }
    });
  }

  print(): void {
    window.print();
  }

  today(): Date {
    return new Date();
  }
}