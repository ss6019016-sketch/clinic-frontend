import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { InvoiceListComponent } from './invoice-list/invoice-list.component';
import { InvoiceFormComponent } from './invoice-form/invoice-form.component';
import { InvoicePrintComponent } from '../Invoice-print/invoice-print.component';



const routes: Routes = [
  { path: '', component: InvoiceListComponent },
  { path: 'add', component: InvoiceFormComponent },
  { path: 'edit/:id', component: InvoiceFormComponent },
  { path: 'print/:id', component: InvoicePrintComponent },
];

@NgModule({
  declarations: [InvoiceListComponent, InvoiceFormComponent, InvoicePrintComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule.forChild(routes)]
})
export class BillingModule {}