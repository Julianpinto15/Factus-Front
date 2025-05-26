import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { CustomerService } from '../../service/Customer.service';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { tap } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';

@Component({
  selector: 'app-customer-list',
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
  ],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerListComponent {
  private readonly customerService = inject(CustomerService);
  // readonly customers = this.customerService.getCustomersSignal();
  readonly customers = signal<any[]>([]);
  readonly error = signal<string | null>(null);
  readonly loading = signal(true);
  readonly displayedColumns: string[] = [
    'name',
    'identification',
    'email',
    'phone',
    'actions',
  ];

  // Pagination properties
  readonly pageSize = signal(10);
  readonly pageIndex = signal(0);
  readonly totalCustomers = signal(0);

  // ViewChild for sort and paginator
  readonly sort = viewChild.required(MatSort);
  readonly paginator = viewChild.required(MatPaginator);

  constructor() {
    this.loadCustomers();
  }

  private loadCustomers(): void {
    this.loading.set(true); // Set loading to true
    this.customerService
      .getCustomers(this.pageIndex(), this.pageSize())
      .pipe(
        tap({
          next: (response: { data: any[]; total: number }) => {
            console.log('Updating customers:', response.data); // Debug log
            this.customers.set(response.data);
            this.totalCustomers.set(response.total);
            this.loading.set(false); // Set loading to false
          },
          error: (err) => {
            this.error.set('Error al cargar clientes: ' + err.message);
            this.loading.set(false); // Set loading to false on error
            console.error('Error fetching customers:', err);
          },
        })
      )
      .subscribe();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadCustomers();
  }

  onSortChange(sort: Sort): void {
    // Optionally handle sorting here if the backend supports it
    this.loadCustomers();
  }
}
