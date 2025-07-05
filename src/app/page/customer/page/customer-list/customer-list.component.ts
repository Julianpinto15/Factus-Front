import { LegalOrganization } from './../../interface/LegalOrganization';
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
import { Customer } from '../../interface/Customer';
import { TributeService } from '../../service/Tribute.service';
import { MunicipalityService } from '../../service/municipality.service';
import { MatDialog } from '@angular/material/dialog';
import { LegalOrganizatioService } from '../../service/legal-organization.service';
import { CustomerEditComponent } from '../../components/customer-edit/customer-edit.component';
import Swal from 'sweetalert2';
import { Tribute } from '../../interface/Tribute';
import { Municipality } from '../../interface/Municipality';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-customer-list',
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatMenuModule,
  ],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerListComponent {
  private readonly customerService = inject(CustomerService);
  private readonly legalOrganizationService = inject(LegalOrganizatioService);
  private readonly tributeService = inject(TributeService);
  private readonly municipalityService = inject(MunicipalityService);
  private readonly dialog = inject(MatDialog);

  readonly customers = signal<Customer[]>([]);
  readonly error = signal<string | null>(null);
  readonly loading = signal(true);
  readonly legalOrganizations = signal<LegalOrganization[]>([]);
  readonly tributes = signal<Tribute[]>([]);
  readonly municipalities = signal<Municipality[]>([]);
  readonly displayedColumns: string[] = [
    'name',
    'identification',
    'email',
    'phone',
    // 'legalOrganizationId',
    // 'tributeId',
    // 'municipalityId',
    'actions',
  ];

  // Pagination properties
  readonly pageSize = signal(10);
  readonly pageIndex = signal(0);
  readonly totalCustomers = signal(0);
  readonly skeletonRows = signal(Array(10).fill(0));

  // ViewChild for sort and paginator
  readonly sort = viewChild.required(MatSort);
  readonly paginator = viewChild.required(MatPaginator);

  constructor() {
    this.loadReferenceData();
    this.loadCustomers();

    // Update skeleton rows when pageSize changes
    effect(() => {
      this.skeletonRows.set(Array(this.pageSize()).fill(0));
    });
  }

  private loadReferenceData(): void {
    this.legalOrganizationService.getLegalOrganizations().subscribe({
      next: (data) => this.legalOrganizations.set(data),
      error: (err) => console.error('Error fetching legal organizations:', err),
    });

    this.tributeService.getTributes().subscribe({
      next: (data) => this.tributes.set(data),
      error: (err) => console.error('Error fetching tributes:', err),
    });

    this.municipalityService.getMunicipalities().subscribe({
      next: (data) => this.municipalities.set(data),
      error: (err) => console.error('Error fetching municipalities:', err),
    });
  }

  private loadCustomers(): void {
    this.loading.set(true);
    this.customerService
      .getCustomers(this.pageIndex(), this.pageSize())
      .pipe(
        tap({
          next: (response: { data: Customer[]; total: number }) => {
            console.log('Updating customers:', response);
            this.customers.set(response.data);
            this.totalCustomers.set(response.total);
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set('Error al cargar clientes: ' + err.message);
            this.loading.set(false);
            console.error('Error fetching customers:', err);
          },
        })
      )
      .subscribe();
  }

  openEditDialog(customer: Customer): void {
    const dialogRef = this.dialog.open(CustomerEditComponent, {
      width: '600px',
      data: {
        customer,
        legalOrganizations: this.legalOrganizations(),
        tributes: this.tributes(),
        municipalities: this.municipalities(),
      },
    });

    dialogRef.afterClosed().subscribe((result: Customer | undefined) => {
      if (result) {
        this.customerService
          .updateCustomer(customer.identification, result)
          .subscribe({
            next: () => {
              Swal.fire(
                '¡Actualizado!',
                'El cliente ha sido actualizado.',
                'success'
              );
              this.loadCustomers();
            },
            error: (err) => {
              this.error.set('Error al actualizar cliente: ' + err.message);
              Swal.fire(
                '¡Error!',
                'No se pudo actualizar el cliente.',
                'error'
              );
              console.error('Error updating customer:', err);
            },
          });
      }
    });
  }

  deleteCustomer(identification: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás deshacer esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.customerService.deleteCustomer(identification).subscribe({
          next: () => {
            Swal.fire(
              '¡Eliminado!',
              'El cliente ha sido eliminado.',
              'success'
            );
            this.loadCustomers();
          },
          error: (err) => {
            this.error.set('Error al eliminar cliente: ' + err.message);
            Swal.fire('¡Error!', 'No se pudo eliminar el cliente.', 'error');
            console.error('Error deleting customer:', err);
          },
        });
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadCustomers();
  }

  onSortChange(sort: Sort): void {
    // Optionally handle sorting if backend supports it
    this.loadCustomers();
  }

  //Helper methods to map IDs to names
  getLegalOrganizationName(id: string): string {
    const org = this.legalOrganizations().find((o) => o.id === Number(id));
    return org ? org.name : 'N/A';
  }

  getTributeName(id: string): string {
    const tribute = this.tributes().find((t) => t.id === Number(id));
    return tribute ? tribute.name : 'N/A';
  }

  getMunicipalityName(id: string): string {
    const m = this.municipalities().find((m) => m.id === Number(id));
    return m ? m.name : 'N/A';
  }
}
