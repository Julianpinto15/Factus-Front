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
import { MunicipalityService } from '../../service/municipality.service';
import { TributeService } from '../../service/Tribute.service';
import { LegalOrganizatioService } from '../../service/legal-organization.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customer-create',
  imports: [FormsModule, CommonModule],
  templateUrl: './customer-create.component.html',
  styleUrl: './customer-create.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerCreateComponent {
  private readonly customerService = inject(CustomerService);
  private readonly municipalityService = inject(MunicipalityService);
  private readonly legalOrganizationService = inject(LegalOrganizatioService);
  private readonly tributeService = inject(TributeService);
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

  readonly municipalities = this.municipalityService.getMunicipalitiesSignal();
  readonly legalOrganizations =
    this.legalOrganizationService.getLegalOrganizationsSignal();
  readonly tributes = this.tributeService.getTributesSignal();
  readonly error = signal<string | null>(null);

  constructor() {
    // Cargar datos iniciales para los dropdowns
    this.municipalityService.getMunicipalities().subscribe({
      error: (err) =>
        this.error.set('Error al cargar municipios: ' + err.message),
    });
    this.legalOrganizationService.getLegalOrganizations().subscribe({
      error: (err) =>
        this.error.set(
          'Error al cargar organizaciones legales: ' + err.message
        ),
    });
    this.tributeService.getTributes().subscribe({
      error: (err) =>
        this.error.set('Error al cargar tributos: ' + err.message),
    });
  }

  onSubmit() {
    this.error.set(null);
    this.customerService.createCustomer(this.customer()).subscribe({
      next: () => this.router.navigate(['/dashboard/customer/list']),
      error: (err) => this.error.set('Error al crear cliente: ' + err.message),
    });
  }
}
