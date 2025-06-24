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
import { CommonModule } from '@angular/common';
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
    ModalProductComponent,
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
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef); // Inject ChangeDetectorRef

  customers = signal<Customer[]>([]);
  products = signal<Product[]>([]);
  tributes = signal<Tribute[]>([]);
  showModal = signal(false);
  displayedColumns: string[] = [
    'product',
    'quantity',
    'discount',
    'tax',
    'tribute',
    'actions',
  ];
  dataSource = new MatTableDataSource<FormGroup>([]); // Use MatTableDataSource

  invoiceForm = this.fb.group({
    document: ['01', Validators.required],
    numbering_range_id: [8, [Validators.required, Validators.min(1)]],
    reference_code: ['I85699874456', Validators.required],
    observation: [''],
    payment_form: ['1', Validators.required],
    payment_due_date: ['2024-12-30', Validators.required],
    payment_method_code: ['10', [Validators.required]],
    billing_period: this.fb.group({
      start_date: ['2024-01-10', Validators.required],
      start_time: ['00:00:00', Validators.required],
      end_date: ['2024-02-09', Validators.required],
      end_time: ['23:59:59', Validators.required],
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
        const defaultTribute =
          tributes.find((t) => t.code === 'DEFAULT_CODE') || tributes[0];
        this.invoiceForm
          .get('customer.tribute_id')
          ?.setValue(defaultTribute.code);
      },
      error: () => console.error('Error loading tributes'),
    });
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
      is_excluded: [productData.is_excluded, Validators.required],
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
    this.showModal.set(true);
  }

  closeProductModal(): void {
    this.showModal.set(false);
  }

  addProductFromModal(productData: any): void {
    console.log('Adding product:', productData);
    this.addItem(productData);
    this.closeProductModal();
  }

  getTributeName(tributeId: string | null): string {
    if (!tributeId) return '';
    const tribute = this.tributes().find((t) => t.code === tributeId);
    return tribute ? `${tribute.name} (${tribute.code})` : tributeId;
  }

  onCustomerChange(event: any): void {
    const selectedCustomer = this.customers().find(
      (c) => c.identification === event.value
    );
    if (selectedCustomer) {
      this.invoiceForm.get('customer')?.patchValue({
        identification: selectedCustomer.identification,
        identification_document_id: selectedCustomer.identification_document_id,
        dv: selectedCustomer.dv ?? null,
        graphic_representation_name:
          selectedCustomer.graphic_representation_name || '',
        company: selectedCustomer.company || '',
        trade_name: selectedCustomer.trade_name || '',
        names: selectedCustomer.names || '',
        address: selectedCustomer.address || '',
        email: selectedCustomer.email || '',
        phone: selectedCustomer.phone || '',
        legal_organization_id: selectedCustomer.legal_organization_id,
        tribute_id: selectedCustomer.tribute_id,
        municipality_id: selectedCustomer.municipality_id ?? null,
      });
    }
  }

  onSubmit(): void {
    if (this.invoiceForm.valid && this.isTributeValid()) {
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
      };

      this.invoiceService.createInvoice(invoice).subscribe({
        next: (response) => {
          console.log('Respuesta de la API:', response);
          if (response && response.status === 'Created') {
            console.log('Clearing items after successful submission');
            this.items.clear();
            this.dataSource.data = []; // Clear MatTableDataSource
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
            this.invoiceForm.reset({
              document: '01',
              numbering_range_id: 8,
              reference_code: 'I85699874456',
              payment_form: '1',
              payment_due_date: '2024-12-30',
              payment_method_code: '10',
              billing_period: {
                start_date: '2024-01-10',
                start_time: '00:00:00',
                end_date: '2024-02-09',
                end_time: '23:59:59',
              },
            });
          } else {
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
        text: 'Por favor, completa todos los campos requeridos y verifica el ID de tributo.',
        customClass: {
          popup: 'custom-swal-popup',
          title: 'custom-swal-title',
        },
      });
    }
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
        this.router.navigate(['/dashboard/invoice/list']);
      }
    });
  }
}
