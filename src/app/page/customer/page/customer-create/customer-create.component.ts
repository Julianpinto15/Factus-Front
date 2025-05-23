import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Customer } from '../../interface/Customer';
import { CustomerService } from '../../service/Customer.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-customer-create',
  imports: [FormsModule],
  templateUrl: './customer-create.component.html',
  styleUrl: './customer-create.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerCreateComponent {
  private readonly customerService = inject(CustomerService);
  private readonly router = inject(Router);

  readonly customer = signal<Customer>({
    identification: '',
    identification_document_id: 0,
    dv: null,
    graphic_representation_name: '',
    company: '',
    trade_name: '',
    names: '',
    address: '',
    email: '',
    phone: '',
    legal_organization_id: '',
    tribute_id: '',
    municipality_id: '',
  });

  onSubmit() {
    this.customerService.createCustomer(this.customer()).subscribe({
      next: () => this.router.navigate(['/dashboard/customer/list']),
      error: (err) => console.error('Error creating customer:', err),
    });
  }
}
