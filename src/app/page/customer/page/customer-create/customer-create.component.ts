import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Customer } from '../../interface/Customer';
import { CustomerService } from '../../service/Customer.service';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MunicipalityService } from '../../service/municipality.service';
import { TributeService } from '../../service/Tribute.service';
import { LegalOrganizatioService } from '../../service/legal-organization.service';
import { CommonModule } from '@angular/common';
import { tap } from 'rxjs';

@Component({
  selector: 'app-customer-create',
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './customer-create.component.html',
  styleUrl: './customer-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerCreateComponent {
  private readonly customerService = inject(CustomerService);
  private readonly municipalityService = inject(MunicipalityService);
  private readonly legalOrganizationService = inject(LegalOrganizatioService);
  private readonly tributeService = inject(TributeService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly customerForm: FormGroup = this.fb.group({
    names: ['', Validators.required],
    identification: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    identification_document_id: ['', [Validators.required, Validators.min(1)]],
    dv: [null, Validators.min(0)],
    graphic_representation_name: [''],
    company: [''],
    trade_name: [''],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.pattern('^[0-9]+$')],
    address: ['', Validators.required],
    legal_organization_id: ['', Validators.required],
    tribute_id: ['', Validators.required],
    municipality_id: ['', Validators.required],
  });

  readonly municipalities = this.municipalityService.getMunicipalitiesSignal();
  readonly legalOrganizations =
    this.legalOrganizationService.getLegalOrganizationsSignal();
  readonly tributes = this.tributeService.getTributesSignal();
  readonly error = signal<string | null>(null);

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.municipalityService
      .getMunicipalities()
      .pipe(
        tap({
          error: (err) =>
            this.error.set('Error al cargar municipios: ' + err.message),
        })
      )
      .subscribe();

    this.legalOrganizationService
      .getLegalOrganizations()
      .pipe(
        tap({
          error: (err) =>
            this.error.set(
              'Error al cargar organizaciones legales: ' + err.message
            ),
        })
      )
      .subscribe();

    this.tributeService
      .getTributes()
      .pipe(
        tap({
          error: (err) =>
            this.error.set('Error al cargar tributos: ' + err.message),
        })
      )
      .subscribe();
  }

  onSubmit(): void {
    if (this.customerForm.valid) {
      this.error.set(null);
      const customerData: Customer = this.customerForm.value;
      this.customerService
        .createCustomer(customerData)
        .pipe(
          tap({
            next: () => this.router.navigate(['/dashboard/customer/list']),
            error: (err) =>
              this.error.set('Error al crear cliente: ' + err.message),
          })
        )
        .subscribe();
    }
  }
}
