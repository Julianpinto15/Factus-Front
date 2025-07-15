import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  signal,
} from '@angular/core';
import { InvoiceService } from '../../service/Invoice.service';
import { CustomerService } from '../../../customer/service/Customer.service';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProductService } from '../../../product/service/Product.service';
import { Customer } from '../../../customer/interface/Customer';
import { Product } from '../../../product/interface/Product';
import { Invoice } from '../../interface/Invoice';
import { CommonModule, formatDate } from '@angular/common';
import { Tribute } from '../../../customer/interface/Tribute';
import { TributeService } from '../../../customer/service/Tribute.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource } from '@angular/material/table'; // Add MatTableDataSource
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { ModalProductComponent } from '../../components/modal-product/modal-product.component';
import { MatDialog } from '@angular/material/dialog';
import { LegalOrganizatioService } from '../../../customer/service/legal-organization.service';
import { MunicipalityService } from '../../../customer/service/municipality.service';
import { LegalOrganization } from '../../../customer/interface/LegalOrganization';
import { Municipality } from '../../../customer/interface/Municipality';

@Component({
  selector: 'app-invoice-create',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
  ],
  templateUrl: './invoiceCreate.component.html',
  styleUrl: './invoiceCreate.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceCreateComponent {
  private fb = inject(FormBuilder);
  private invoiceService = inject(InvoiceService);
  private customerService = inject(CustomerService);
  private productService = inject(ProductService);
  private tributeService = inject(TributeService);
  private legalOrganizationService = inject(LegalOrganizatioService);
  private municipalityService = inject(MunicipalityService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private dialog = inject(MatDialog);

  readonly showJSON = signal(false); // Signal to toggle JSON preview visibility
  readonly factusJSON = signal<any>({}); // Signal to hold JSON data

  customers = signal<Customer[]>([]);
  products = signal<Product[]>([]);
  tributes = signal<Tribute[]>([]);
  legalOrganizations = signal<LegalOrganization[]>([]);
  municipalities = signal<Municipality[]>([]);
  private updateInterval: any;
  displayedColumns: string[] = [
    'product',
    'quantity',
    'discount',
    'tax',
    'tribute',
    'actions',
  ];
  dataSource = new MatTableDataSource<FormGroup>([]); // Use MatTableDataSource

  showFactusJSON(): void {
    const raw = this.invoiceForm.getRawValue();
    const invoice: Invoice = {
      document: '01',
      numbering_range_id: Number(raw.numbering_range_id),
      reference_code: String(raw.reference_code),
      observation: raw.observation || '',
      payment_form: String(raw.payment_form),
      payment_due_date: String(raw.payment_due_date),
      payment_method_code: String(raw.payment_method_code),
      billing_period: {
        start_date: String(raw.billing_period.start_date),
        start_time: String(raw.billing_period.start_time),
        end_date: String(raw.billing_period.end_date),
        end_time: String(raw.billing_period.end_time),
      },
      customer: {
        identification: String(raw.customer.identification),
        identification_document_id: Number(
          raw.customer.identification_document_id
        ),
        dv: String(raw.customer.dv),
        graphic_representation_name:
          raw.customer.graphic_representation_name || '',
        company: raw.customer.company || '',
        trade_name: raw.customer.trade_name || '',
        names: raw.customer.names || '',
        address: raw.customer.address || '',
        email: raw.customer.email || '',
        phone: raw.customer.phone || '',
        legal_organization_id: String(raw.customer.legal_organization_id),
        tribute_id: String(raw.customer.tribute_id),
        municipality_id:
          raw.customer.municipality_id === null
            ? null
            : String(raw.customer.municipality_id),
      },
      items: raw.items.map((item: any) => ({
        code_reference: String(item.code_reference),
        name: String(item.name),
        quantity: Number(item.quantity),
        discount_rate: Number(item.discount_rate),
        price: Number(item.price),
        tax_rate: String(item.tax_rate),
        unit_measure_id: Number(item.unit_measure_id),
        standard_code_id: Number(item.standard_code_id),
        is_excluded: item.tribute_id === '01' ? Number(item.is_excluded) : 0,
        tribute_id: String(item.tribute_id),
        withholding_taxes: item.withholding_taxes.map((tax: any) => ({
          code: String(tax.code),
          withholding_tax_rate: String(tax.withholding_tax_rate),
        })),
      })),
      createdAt: new Date().toISOString(),
      status: 'PENDIENTE',
    };
    this.factusJSON.set(invoice);
    this.showJSON.set(!this.showJSON());
    this.cdr.markForCheck();
  }

  invoiceForm = this.fb.group({
    document: ['01', Validators.required],
    numbering_range_id: [8, [Validators.required, Validators.min(1)]],
    reference_code: [this.generateReferenceCode(), Validators.required],
    observation: [''],
    payment_form: ['1', Validators.required],
    payment_due_date: ['2024-12-30', Validators.required],
    payment_method_code: ['10', [Validators.required]],
    billing_period: this.fb.group({
      start_date: [this.getCurrentDate(), Validators.required],
      start_time: [this.getCurrentTime(), Validators.required],
      end_date: [this.getCurrentDate(), Validators.required],
      end_time: [this.getCurrentTime(), Validators.required],
    }),
    customer: this.fb.group({
      identification: ['', Validators.required],
      identification_document_id: [0, Validators.required],
      dv: [''],
      graphic_representation_name: [''],
      company: [''],
      trade_name: [''],
      names: ['', Validators.required],
      address: [''],
      email: [''],
      phone: [''],
      legal_organization_id: ['', Validators.required],
      tribute_id: ['', Validators.required],
      municipality_id: [null as string | null],
    }),
    items: this.fb.array([]),
  });

  constructor() {
    this.loadCustomers();
    this.loadProducts();
    this.loadTributes();
    this.loadLegalOrganizations(); // Agregar esta línea
    this.loadMunicipalities();
    this.startEndDateTimeUpdate();
  }

  ngOnDestroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  private generateReferenceCode(): string {
    const randomNum = Math.floor(100000000000 + Math.random() * 9000000000);
    return `I${randomNum}`;
  }

  private getCurrentDate(): string {
    return formatDate(new Date(), 'yyyy-MM-dd', 'en-US'); // e.g., "2025-06-24"
  }

  private getEndDate(): string {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 1); // Set to next day, e.g., "2025-06-25"
    return formatDate(endDate, 'yyyy-MM-dd', 'en-US');
  }

  private getCurrentTime(): string {
    return formatDate(new Date(), 'HH:mm:ss', 'en-US'); // e.g., "18:56:00"
  }

  private getEndTime(): string {
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 1); // Set to one hour later, e.g., "19:56:00"
    return formatDate(endTime, 'HH:mm:ss', 'en-US');
  }

  private startEndDateTimeUpdate(): void {
    this.updateInterval = setInterval(() => {
      this.invoiceForm
        .get('billing_period.end_date')
        ?.setValue(this.getEndDate());
      this.invoiceForm
        .get('billing_period.end_time')
        ?.setValue(this.getEndTime());
      this.cdr.markForCheck();
    }, 1000);
  }

  // Validador para asegurar que end_date no sea anterior a start_date
  private dateRangeValidator(group: FormGroup): { [key: string]: any } | null {
    const startDate = group.get('start_date')?.value;
    const endDate = group.get('end_date')?.value;
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      return { invalidDateRange: true };
    }
    return null;
  }

  private loadCustomers() {
    this.customerService.getCustomers().subscribe({
      next: (res) => this.customers.set(res.data),
      error: () => console.error('Error loading customers'),
    });
  }

  private loadProducts() {
    this.productService.getProducts().subscribe({
      next: (res) => this.products.set(res.data),
      error: () => console.error('Error loading products'),
    });
  }

  private loadTributes() {
    this.tributeService.getTributes().subscribe({
      next: (tributes) => {
        console.log('Tributos disponibles:', tributes);
        this.tributes.set(tributes);
        // Remove default setting to avoid overwriting customer selection
        // this.invoiceForm.get('customer.tribute_id')?.setValue(...);
      },
      error: () => console.error('Error loading tributes'),
    });
  }

  private loadLegalOrganizations() {
    this.legalOrganizationService.getLegalOrganizations().subscribe({
      next: (organizations: LegalOrganization[]) =>
        this.legalOrganizations.set(organizations),
      error: () => console.error('Error loading legal organizations'),
    });
  }

  private loadMunicipalities() {
    this.municipalityService.getMunicipalities().subscribe({
      next: (municipalities: Municipality[]) =>
        this.municipalities.set(municipalities),
      error: () => console.error('Error loading municipalities'),
    });
  }

  // Agregar estos métodos auxiliares para obtener los nombres
  getLegalOrganizationName(organizationId: string | null): string {
    if (!organizationId) return '';
    const organization = this.legalOrganizations().find(
      (org) => org.id.toString() === organizationId.toString()
    );
    return organization ? organization.name : organizationId;
  }

  getMunicipalityName(municipalityId: string | null): string {
    if (!municipalityId) return '';
    const municipality = this.municipalities().find(
      (mun) => mun.id.toString() === municipalityId.toString()
    );
    return municipality ? municipality.name : municipalityId;
  }

  get items(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  addItem(productData: any): void {
    const itemForm = this.fb.group({
      code_reference: [productData.code_reference, Validators.required],
      name: [productData.name, Validators.required],
      quantity: [
        productData.quantity,
        [Validators.required, Validators.min(1)],
      ],
      discount_rate: [
        productData.discount_rate,
        [Validators.required, Validators.min(0)],
      ],
      price: [productData.price, [Validators.required, Validators.min(0)]],
      tax_rate: [productData.tax_rate, Validators.required],
      unit_measure_id: [productData.unit_measure_id, Validators.required],
      standard_code_id: [productData.standard_code_id, Validators.required],
      is_excluded: [productData.is_excluded ?? 0, Validators.required],
      tribute_id: [productData.tribute_id, Validators.required],
      withholding_taxes: this.fb.array([]),
    });
    this.items.push(itemForm);
    this.dataSource.data = [...this.items.controls] as FormGroup[]; // Update MatTableDataSource
    console.log(
      'Items in DataSource:',
      this.dataSource.data.map((control) => control.value)
    );
    this.cdr.markForCheck(); // Trigger change detection
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
    this.dataSource.data = [...this.items.controls] as FormGroup[]; // Update MatTableDataSource
    this.cdr.markForCheck();
  }

  trackByItem(index: number, item: FormGroup): string {
    return item.get('code_reference')?.value || index.toString();
  }

  openProductModal(): void {
    const dialogRef = this.dialog.open(ModalProductComponent, {
      width: '600px',
      maxWidth: '90vw',
      panelClass: 'custom-modal',
      disableClose: false,
      autoFocus: true,
      data: {
        products: this.products(),
        tributes: this.tributes(),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.addProductFromModal(result);
      }
    });
  }

  addProductFromModal(productData: any): void {
    console.log('Adding product:', productData);
    this.addItem(productData);
  }

  getTributeName(tributeId: string | null): string {
    if (!tributeId) return '';
    const tribute = this.tributes().find((t) => t.code === tributeId);
    return tribute ? `${tribute.name} (${tribute.code})` : tributeId;
  }

  getCustomerDisplayName(customer: Customer): string {
    // Para persona jurídica (NIT), mostrar company o trade_name
    if (customer.identification_document_id === 3) {
      return (
        customer.company ||
        customer.trade_name ||
        customer.graphic_representation_name ||
        customer.names ||
        'Sin nombre'
      );
    }
    // Para persona natural, mostrar names
    return customer.names || 'Sin nombre';
  }

  onCustomerChange(event: any): void {
    const selectedCustomer = this.customers().find(
      (customer) => customer.identification === event.value
    );

    if (selectedCustomer) {
      // Buscar el código del tributo basado en el tribute_id
      const tribute = this.tributes().find(
        (tribute) =>
          tribute.id.toString() === selectedCustomer.tribute_id.toString()
      );

      this.invoiceForm.patchValue({
        customer: {
          identification: selectedCustomer.identification,
          identification_document_id:
            selectedCustomer.identification_document_id,
          dv: selectedCustomer.dv || '',
          names: selectedCustomer.names || selectedCustomer.company,
          address: selectedCustomer.address,
          email: selectedCustomer.email,
          phone: selectedCustomer.phone,
          legal_organization_id: selectedCustomer.legal_organization_id,
          tribute_id: tribute ? tribute.code : null,
          municipality_id: selectedCustomer.municipality_id,
        },
      });
    }
  }

  onSubmit(): void {
    if (this.invoiceForm.valid && this.isTributeValid()) {
      // Mostrar alerta de carga
      Swal.fire({
        title: 'Creando factura...',
        text: 'Por favor espere mientras procesamos su factura',
        icon: 'info',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
        customClass: {
          popup: 'custom-swal-popup',
          title: 'custom-swal-title',
        },
      });

      console.log(
        'Submitting with items:',
        this.items.controls.map((control) => control.value)
      );
      const raw = this.invoiceForm.getRawValue();
      const invoice: Invoice = {
        document: '01',
        numbering_range_id: Number(raw.numbering_range_id),
        reference_code: String(raw.reference_code),
        observation: raw.observation || '',
        payment_form: String(raw.payment_form),
        payment_due_date: String(raw.payment_due_date),
        payment_method_code: String(raw.payment_method_code),
        billing_period: {
          start_date: String(raw.billing_period.start_date),
          start_time: String(raw.billing_period.start_time),
          end_date: String(raw.billing_period.end_date),
          end_time: String(raw.billing_period.end_time),
        },
        customer: {
          identification: String(raw.customer.identification),
          identification_document_id: Number(
            raw.customer.identification_document_id
          ),
          dv: String(raw.customer.dv),
          graphic_representation_name:
            raw.customer.graphic_representation_name || '',
          company: raw.customer.company || '',
          trade_name: raw.customer.trade_name || '',
          names: raw.customer.names || '',
          address: raw.customer.address || '',
          email: raw.customer.email || '',
          phone: raw.customer.phone || '',
          legal_organization_id: String(raw.customer.legal_organization_id),
          tribute_id: '21',
          municipality_id:
            raw.customer.municipality_id === null
              ? null
              : String(raw.customer.municipality_id),
        },
        items: raw.items.map((item: any) => ({
          code_reference: String(item.code_reference),
          name: String(item.name),
          quantity: Number(item.quantity),
          discount_rate: Number(item.discount_rate),
          price: Number(item.price),
          tax_rate: String(item.tax_rate),
          unit_measure_id: Number(item.unit_measure_id),
          standard_code_id: Number(item.standard_code_id),
          is_excluded: item.tribute_id === '01' ? Number(item.is_excluded) : 0,
          tribute_id: String(item.tribute_id),
          withholding_taxes: item.withholding_taxes.map((tax: any) => ({
            code: String(tax.code),
            withholding_tax_rate: String(tax.withholding_tax_rate),
          })),
        })),
        createdAt: new Date().toISOString(),
        status: 'PENDIENTE',
      };

      console.log('Factura que se enviará:', invoice);
      this.invoiceService.createInvoice(invoice).subscribe({
        next: (response) => {
          console.log('Respuesta completa del backend:', response);
          if (response && response.status === 'Created') {
            this.items.clear();
            this.dataSource.data = [];

            // Cerrar la alerta de carga y mostrar éxito
            Swal.fire({
              position: 'top-end',
              icon: 'success',
              title: 'Factura creada exitosamente',
              showConfirmButton: false,
              timer: 3000,
              toast: true,
              customClass: {
                popup: 'custom-swal-popup',
                title: 'custom-swal-title',
              },
            });

            // Reiniciar formulario con nuevas fechas y horas
            this.resetForm();
          } else {
            // Cerrar la alerta de carga y mostrar error
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'La factura no se creó correctamente.',
              customClass: {
                popup: 'custom-swal-popup',
                title: 'custom-swal-title',
              },
            });
          }
        },
        error: (err: HttpErrorResponse) => {
          const errorMessage =
            err.error?.message || err.message || 'Error desconocido';

          // Cerrar la alerta de carga y mostrar error
          Swal.fire({
            icon: 'error',
            title: 'Error al crear factura',
            text: errorMessage,
            customClass: {
              popup: 'custom-swal-popup',
              title: 'custom-swal-title',
            },
          });
        },
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor, completa todos los campos requeridos y verifica las fechas.',
        customClass: {
          popup: 'custom-swal-popup',
          title: 'custom-swal-title',
        },
      });
    }
  }

  private resetForm(): void {
    this.invoiceForm.reset({
      document: '01',
      numbering_range_id: 8,
      reference_code: 'I85699874456',
      payment_form: '1',
      payment_due_date: '2024-12-30',
      payment_method_code: '10',
      billing_period: {
        start_date: this.getCurrentDate(),
        start_time: this.getCurrentTime(),
        end_date: this.getCurrentDate(),
        end_time: this.getCurrentTime(),
      },
    });
    this.cdr.markForCheck();
  }

  private isTributeValid(): boolean {
    const tributeId = this.invoiceForm.get('customer.tribute_id')?.value;
    return (
      tributeId !== null && this.tributes().some((t) => t.code === tributeId)
    );
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
        this.router.navigate(['/dashboard/invoice']);
      }
    });
  }
}
