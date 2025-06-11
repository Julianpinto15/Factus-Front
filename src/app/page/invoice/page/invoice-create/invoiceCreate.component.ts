import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { InvoiceService } from '../../service/Invoice.service';
import { CustomerService } from '../../../customer/service/Customer.service';
import {
  FormArray,
  FormBuilder,
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

@Component({
  selector: 'app-invoice-create',
  imports: [CommonModule, ReactiveFormsModule],
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

  customers = signal<Customer[]>([]);
  products = signal<Product[]>([]);
  tributes = signal<Tribute[]>([]);

  invoiceForm = this.fb.group({
    document: ['01', Validators.required], // Asegúrate de que este valor sea correcto
    numbering_range_id: [8, [Validators.required, Validators.min(1)]],
    reference_code: ['I85699874456', Validators.required],
    observation: [''],
    payment_form: ['1', Validators.required],
    payment_due_date: ['2024-12-30', Validators.required],
    payment_method_code: ['10', [Validators.required]], // <-- Cambiado a string
    billing_period: this.fb.group({
      start_date: ['2024-01-10', Validators.required],
      start_time: ['00:00:00', Validators.required],
      end_date: ['2024-02-09', Validators.required],
      end_time: ['23:59:59', Validators.required],
    }),
    customer: this.fb.group({
      identification: ['', Validators.required],
      identification_document_id: [0, Validators.required],
      dv: [''], // <-- Cambiado para no aceptar null, mejor string vacío
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
    this.addItem();
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
          ?.setValue(defaultTribute.code); // Usa "21"
      },
      error: () => console.error('Error loading tributes'),
    });
  }

  get items(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  addItem(): void {
    const itemForm = this.fb.group({
      code_reference: ['', Validators.required],
      name: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      discount_rate: [0, [Validators.required, Validators.min(0)]],
      price: [0, [Validators.required, Validators.min(0)]],
      tax_rate: ['19.00', Validators.required],
      unit_measure_id: [70, Validators.required],
      standard_code_id: [1, Validators.required],
      is_excluded: [0, Validators.required], // Por defecto 0
      tribute_id: ['', Validators.required], // Almacena code
      withholding_taxes: this.fb.array([]),
    });
    if (this.tributes().length > 0) {
      itemForm.get('tribute_id')?.setValue('01'); // Usa "01" para IVA
    }
    this.items.push(itemForm);
  }

  onProductChange(event: any, itemIndex: number): void {
    const selectedProduct = this.products().find(
      (p) => p.id === +event.target.value
    );
    if (selectedProduct) {
      const item = this.items.at(itemIndex);
      const tribute = this.tributes().find(
        (t) => t.id === Number(selectedProduct.tributeId)
      );
      const tributeCode = tribute ? tribute.code : '01';
      item.patchValue({
        code_reference: selectedProduct.code,
        name: selectedProduct.name,
        price: selectedProduct.price,
        tax_rate: selectedProduct.taxRate,
        unit_measure_id: selectedProduct.unitMeasureId,
        standard_code_id: selectedProduct.standardCodeId,
        is_excluded: tributeCode === '01' ? selectedProduct.isExcluded : 0, // Solo permite is_excluded con IVA
        tribute_id: tributeCode,
      });
    }
  }

  onCustomerChange(event: any): void {
    const selectedCustomer = this.customers().find(
      (c) => c.identification === event.target.value
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
      const raw = this.invoiceForm.getRawValue();
      console.log('JSON enviado al backend:', JSON.stringify(raw, null, 2));

      const invoice: Invoice = {
        document: '01', // Asegúrate de incluir document
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
          tribute_id: '21', // Usa "21" como en el JSON que funciona
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
          is_excluded: item.tribute_id === '01' ? Number(item.is_excluded) : 0, // Solo permite is_excluded con IVA
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
          // Verifica si la respuesta indica éxito real
          if (response && response.status === 'Created') {
            // Ajusta según la estructura de la respuesta
            alert('Factura creada con éxito!');
            this.invoiceForm.reset();
            this.items.clear();
            this.addItem();
          } else {
            alert(
              'La factura no se creó correctamente. Respuesta: ' +
                JSON.stringify(response, null, 2)
            );
          }
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error completo:', err);
          const errorMessage =
            err.error?.message || err.message || 'Error desconocido';
          const errorDetails = JSON.stringify(err.error, null, 2);
          alert(
            `Error al crear factura: ${errorMessage}\nDetalles: ${errorDetails}`
          );
        },
      });
    } else {
      alert(
        'Por favor, completa todos los campos requeridos y verifica el ID de tributo.'
      );
    }
  }

  private isTributeValid(): boolean {
    const tributeId = this.invoiceForm.get('customer.tribute_id')?.value;
    return (
      tributeId !== null && this.tributes().some((t) => t.code === tributeId)
    );
  }
}
