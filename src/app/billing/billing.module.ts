import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { InvoiceListComponent } from './invoice-list/invoice-list.component';
import { InvoiceFormComponent } from './invoice-form/invoice-form.component';



const routes: Routes = [
  { path: '', component: InvoiceListComponent },
  { path: 'add', component: InvoiceFormComponent },
  { path: 'edit/:id', component: InvoiceFormComponent },
];

@NgModule({
  declarations: [InvoiceListComponent, InvoiceFormComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule.forChild(routes)]
})
export class BillingModule {}