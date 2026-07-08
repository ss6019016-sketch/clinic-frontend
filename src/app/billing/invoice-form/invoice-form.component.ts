import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BillingService } from 'src/app/core/services/billing.service';
import { PatientService } from 'src/app/core/services/patient.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-invoice-form',
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.css']
})
export class InvoiceFormComponent implements OnInit {

  invoiceForm!: FormGroup;
  isEditMode    = false;
  invoiceId: number | null = null;
  isLoading     = false;
  patientsLoading = true;

  patients: any[]  = [];
  paymentMethods   = ['Cash', 'Card', 'Online Transfer', 'Cheque'];
  statusOptions    = ['Unpaid', 'Paid', 'Partial'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private billingService: BillingService,
    private patientService: PatientService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.invoiceForm = this.fb.group({
      patientId:     ['', Validators.required],
      invoiceDate:   ['', Validators.required],
      paymentMethod: ['Cash'],
      status:        ['Unpaid'],
      discount:      [0],
      tax:           [0],
      notes:         [''],
      items: this.fb.array([this.newItem()])
    });

    this.patientService.getAll().subscribe({
      next: (d) => { this.patients = d; this.patientsLoading = false; },
      error: () => { this.patientsLoading = false; }
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.invoiceId  = +id;
      this.loadInvoice(+id);
    }
  }

  loadInvoice(id: number): void {
    this.billingService.getById(id).subscribe({
      next: (data) => {
        this.invoiceForm.patchValue({
          patientId:     data.patientId,
          invoiceDate:   data.createdAt?.split('T')[0],
          paymentMethod: data.paymentMethod,
          status:        data.status,
          discount:      data.discount,
          tax:           data.tax,
          notes:         data.notes
        });
        this.items.clear();
        (data.items || []).forEach((item: any) => {
          this.items.push(this.fb.group({
            itemName: [item.itemName, Validators.required],
            quantity: [item.quantity, [Validators.required, Validators.min(1)]],
            price:    [item.price,    [Validators.required, Validators.min(0)]]
          }));
        });
      },
      error: () => this.toast.error('Failed to load invoice')
    });
  }

  get items(): FormArray { return this.invoiceForm.get('items') as FormArray; }

  newItem(): FormGroup {
    return this.fb.group({
      itemName: ['', Validators.required],
      quantity: [1,  [Validators.required, Validators.min(1)]],
      price:    [0,  [Validators.required, Validators.min(0)]]
    });
  }

  addItem(): void    { this.items.push(this.newItem()); }
  removeItem(i: number): void {
    if (this.items.length > 1) this.items.removeAt(i);
  }

  getItemTotal(i: number): number {
    const item = this.items.at(i);
    return (item.get('quantity')?.value || 0) * (item.get('price')?.value || 0);
  }

  get subtotal(): number {
    let total = 0;
    for (let i = 0; i < this.items.length; i++) total += this.getItemTotal(i);
    return total;
  }

  get discountVal(): number { return +this.invoiceForm.get('discount')?.value || 0; }
  get taxVal():      number { return +this.invoiceForm.get('tax')?.value || 0; }
  get grandTotal():  number {
    return this.subtotal - this.discountVal + (this.subtotal * this.taxVal / 100);
  }

  onSubmit(): void {
    if (this.invoiceForm.invalid) {
      this.invoiceForm.markAllAsTouched();
      this.toast.warning('Please fill all required fields!');
      return;
    }

    this.isLoading = true;
    const data     = this.invoiceForm.value;

    const request = this.isEditMode
      ? this.billingService.update(this.invoiceId!, data)
      : this.billingService.create(data);

    request.subscribe({
      next: () => {
        this.isLoading = false;
        this.toast.success(this.isEditMode ? 'Invoice updated!' : 'Invoice created!');
        this.router.navigate(['/billing']);
      },
      error: (err) => {
        this.isLoading = false;
        this.toast.error(err?.error?.message || 'Something went wrong!');
      }
    });
  }

  get f() { return this.invoiceForm.controls; }
}