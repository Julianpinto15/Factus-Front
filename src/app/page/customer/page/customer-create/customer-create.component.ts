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
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MunicipalityService } from '../../service/municipality.service';
import { TributeService } from '../../service/Tribute.service';
import { LegalOrganizatioService } from '../../service/legal-organization.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { map, startWith, tap } from 'rxjs';
import { LegalOrganization } from '../../interface/LegalOrganization';
import { Tribute } from '../../interface/Tribute';
import { Municipality } from '../../interface/Municipality';
import Swal from 'sweetalert2';

function dvValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value === null || value === '') return null;
  return value >= 0 && value <= 9 ? null : { max: true };
}

@Component({
  selector: 'app-customer-create',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatAutocompleteModule,
  ],
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
    person_type: ['', Validators.required],
    identification_document_id: ['', Validators.required],
    identification: [
      '',
      [
        Validators.required,
        Validators.pattern('^[0-9]+$'),
        Validators.minLength(5),
      ],
    ],
    names: [''],
    company: [''],
    dv: [null, dvValidator],
    graphic_representation_name: [''],
    trade_name: [''],
    email: [
      '',
      [
        Validators.email,
        Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
      ],
    ],
    phone: [
      '',
      [
        Validators.pattern('^[0-9]+$'),
        Validators.minLength(7),
        Validators.maxLength(15),
      ],
    ],
    address: [''],
    legal_organization_id: ['', Validators.required],
    tribute_id: ['', Validators.required],
    municipality_id: [''],
    is_colombian: [true],
  });

  readonly municipalities = this.municipalityService.getMunicipalitiesSignal();
  readonly legalOrganizations =
    this.legalOrganizationService.getLegalOrganizationsSignal();
  readonly tributes = this.tributeService.getTributesSignal();
  readonly documentTypes = signal([
    { id: '1', name: 'Cédula de Ciudadanía' },
    { id: '2', name: 'Cédula de Extranjería' },
    { id: '3', name: 'NIT' },
    { id: '4', name: 'Pasaporte' },
  ]);
  readonly filteredLegalOrganizations = signal<LegalOrganization[]>(
    this.legalOrganizations()
  );
  readonly filteredTributes = signal<Tribute[]>(this.tributes());
  readonly filteredMunicipalities = signal<Municipality[]>(
    this.municipalities()
  );
  readonly error = signal<string | null>(null);
  readonly isNaturalPerson = signal(true);
  readonly isNitDocument = signal(false);
  readonly isColombian = signal(true);

  constructor() {
    this.loadInitialData();
    this.updateFormValidations();
    this.setupFilters();
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

  private setupFilters(): void {
    this.customerForm
      .get('legal_organization_id')
      ?.valueChanges.pipe(
        startWith(''),
        map((value) => this.filterOptions(this.legalOrganizations(), value))
      )
      .subscribe((filtered) => this.filteredLegalOrganizations.set(filtered));

    this.customerForm
      .get('tribute_id')
      ?.valueChanges.pipe(
        startWith(''),
        map((value) => this.filterOptions(this.tributes(), value))
      )
      .subscribe((filtered) => this.filteredTributes.set(filtered));

    this.customerForm
      .get('municipality_id')
      ?.valueChanges.pipe(
        startWith(''),
        map((value) => this.filterOptions(this.municipalities(), value))
      )
      .subscribe((filtered) => this.filteredMunicipalities.set(filtered));
  }

  filterOptions<T extends { id: number; name: string }>(
    options: T[],
    value: string
  ): T[] {
    const filterValue = (value || '').toString().toLowerCase();
    return options.filter((option) =>
      option.name.toLowerCase().includes(filterValue)
    );
  }

  displayLegalOrg(id: number | string): string {
    const item = this.legalOrganizations().find(
      (item) => item.id.toString() === id.toString()
    );
    return item ? item.name : '';
  }

  displayTribute(id: number | string): string {
    const item = this.tributes().find(
      (item) => item.id.toString() === id.toString()
    );
    return item ? item.name : '';
  }

  displayMunicipality(id: number | string): string {
    const item = this.municipalities().find(
      (item) => item.id.toString() === id.toString()
    );
    return item ? item.name : '';
  }

  filterLegalOrganizations(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filteredLegalOrganizations.set(
      this.filterOptions(this.legalOrganizations(), value)
    );
  }

  filterTributes(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filteredTributes.set(this.filterOptions(this.tributes(), value));
  }

  filterMunicipalities(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filteredMunicipalities.set(
      this.filterOptions(this.municipalities(), value)
    );
  }

  onPersonTypeChange(event: any): void {
    const personType = event.value;
    this.isNaturalPerson.set(personType === 'natural');
    this.updateFormValidations();
  }

  onDocumentTypeChange(event: any): void {
    const docId = event.value;
    this.isNitDocument.set(docId === '3');
    this.updateFormValidations();
  }

  onCountryChange(event: any): void {
    this.isColombian.set(event.checked);
    this.updateFormValidations();
  }

  private updateFormValidations(): void {
    const namesControl = this.customerForm.get('names');
    const companyControl = this.customerForm.get('company');
    const dvControl = this.customerForm.get('dv');
    const municipalityControl = this.customerForm.get('municipality_id');

    if (this.isNaturalPerson()) {
      namesControl?.setValidators([
        Validators.required,
        Validators.minLength(2),
      ]);
      companyControl?.clearValidators();
      companyControl?.setValue('');
    } else {
      namesControl?.clearValidators();
      namesControl?.setValue('');
      companyControl?.setValidators([
        Validators.required,
        Validators.minLength(2),
      ]);
    }

    if (this.isNitDocument()) {
      dvControl?.setValidators([Validators.required, dvValidator]);
    } else {
      dvControl?.clearValidators();
      dvControl?.setValue(null);
    }

    if (this.isColombian()) {
      municipalityControl?.setValidators([Validators.required]);
    } else {
      municipalityControl?.clearValidators();
      municipalityControl?.setValue('');
    }

    namesControl?.updateValueAndValidity();
    companyControl?.updateValueAndValidity();
    dvControl?.updateValueAndValidity();
    municipalityControl?.updateValueAndValidity();
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    if (this.customerForm.valid) {
      this.error.set(null);
      const formValue = this.customerForm.value;
      const customerData: Customer = {
        identification: formValue.identification,
        identification_document_id: Number(
          formValue.identification_document_id
        ),
        dv: formValue.dv,
        graphic_representation_name: formValue.graphic_representation_name,
        company: formValue.company,
        trade_name: formValue.trade_name,
        names: formValue.names,
        address: formValue.address,
        email: formValue.email,
        phone: formValue.phone,
        legal_organization_id: formValue.legal_organization_id.toString(),
        tribute_id: formValue.tribute_id.toString(),
        municipality_id: formValue.municipality_id
          ? formValue.municipality_id.toString()
          : '',
      };
      this.customerService
        .createCustomer(customerData)
        .pipe(
          tap({
            next: () => {
              // Show SweetAlert2 success notification
              Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: 'Cliente creado exitosamente',
                showConfirmButton: false,
                timer: 3000,
                toast: true,
                customClass: {
                  popup: 'custom-swal-popup',
                  title: 'custom-swal-title',
                },
              });
              // Reset the form
              this.customerForm.reset({
                person_type: '',
                identification_document_id: '',
                is_colombian: true,
              });
              // Reset signals to initial state
              this.isNaturalPerson.set(true);
              this.isNitDocument.set(false);
              this.isColombian.set(true);
              this.updateFormValidations();
            },
            error: (err) =>
              this.error.set('Error al crear cliente: ' + err.message),
          })
        )
        .subscribe();
    }
  }

  onCancel(): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Los cambios no guardados se perderán.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, volver',
      customClass: {
        popup: 'custom-swal-popup',
        title: 'custom-swal-title',
        confirmButton: 'custom-swal-confirm',
        cancelButton: 'custom-swal-cancel',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // Navigate to the customer list page
        this.router.navigate(['/dashboard/customer/list']);
      }
    });
  }
}
