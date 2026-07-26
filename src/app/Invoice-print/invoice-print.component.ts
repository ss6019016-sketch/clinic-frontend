import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BillingService } from 'src/app/core/services/billing.service';
import { SettingsService } from 'src/app/core/services/settings.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-invoice-print',
  templateUrl: './invoice-print.component.html',
  styleUrls: ['./invoice-print.component.css']
})
export class InvoicePrintComponent implements OnInit {

  invoice: any = null;
  clinic: any = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private billingService: BillingService,
    private settingsService: SettingsService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/billing']); return; }

    // Both need to be ready before we render — the letterhead without
    // the invoice (or vice versa) isn't something worth printing.
    let invoiceReady = false;
    let clinicReady = false;
    const checkDone = () => { if (invoiceReady && clinicReady) this.isLoading = false; };

    this.billingService.getById(+id).subscribe({
      next: (data) => { this.invoice = data; invoiceReady = true; checkDone(); },
      error: () => {
        this.toast.error('Failed to load invoice');
        this.router.navigate(['/billing']);
      }
    });

    this.settingsService.get().subscribe({
      next: (data) => { this.clinic = data; clinicReady = true; checkDone(); },
      error: () => { this.clinic = {}; clinicReady = true; checkDone(); } // don't block printing if settings fail
    });
  }

  print(): void {
    window.print();
  }

  today(): Date {
    return new Date();
  }
}