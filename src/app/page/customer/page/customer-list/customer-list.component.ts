import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnInit,
} from '@angular/core';
import { CustomerService } from '../../service/Customer.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-customer-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerListComponent implements OnInit {
  private readonly customerService = inject(CustomerService);
  readonly customers = this.customerService.getCustomersSignal();

  ngOnInit(): void {
    effect(() => {
      this.customerService.getCustomers().subscribe({
        error: (err) => console.error('Error fetching customers:', err),
      });
    });
  }
}
