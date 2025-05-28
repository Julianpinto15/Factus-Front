import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ProductService } from '../../service/Product.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Product } from '../../interface/Product';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UnitMeasure } from '../../interface/UnitMeasure';
import { StandardCode } from '../../interface/StandardCode';
import { Tribute } from '../../interface/Tribute';
import { DataService } from '../../service/Data.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { map, startWith, tap } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-create',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatAutocompleteModule,
  ],
  templateUrl: './product-create.component.html',
  styleUrl: './product-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCreateComponent {
  private readonly productService = inject(ProductService);
  private readonly dataService = inject(DataService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly productForm: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(3)]],
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    quantity: ['', [Validators.required, Validators.min(0.01)]],
    price: ['', [Validators.required, Validators.min(0.01)]],
    taxRate: [
      '',
      [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)],
    ],
    discountRate: ['', [Validators.min(0), Validators.max(100)]],
    unitMeasureId: ['', Validators.required],
    standardCodeId: ['', Validators.required],
    tributeId: ['', Validators.required],
    isExcluded: ['', Validators.required],
  });

  readonly unitMeasures = signal<UnitMeasure[]>([]);
  readonly standardCodes = signal<StandardCode[]>([]);
  readonly tributes = signal<Tribute[]>([]);
  readonly filteredUnitMeasures = signal<UnitMeasure[]>([]);
  readonly filteredStandardCodes = signal<StandardCode[]>([]);
  readonly filteredTributes = signal<Tribute[]>([]);
  readonly isEdit = signal(false);
  readonly showJSON = signal(false);
  readonly factusJSON = signal<any>({});
  readonly error = signal<string | null>(null);

  constructor() {
    this.loadReferenceData();
    this.setupFilters();
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit.set(true);
      const id = +idParam;
      this.productService.getProductById(id).subscribe({
        next: (product) =>
          this.productForm.patchValue({
            ...product,
            isExcluded: product.isExcluded.toString(),
          }),
        error: (err) =>
          this.error.set('Error al cargar producto: ' + err.message),
      });
    }
  }

  private loadReferenceData(): void {
    this.dataService
      .getUnitMeasures()
      .pipe(
        tap({
          next: (data) => {
            this.unitMeasures.set(data);
            this.filteredUnitMeasures.set(data);
          },
          error: (err) =>
            this.error.set(
              'Error al cargar unidades de medida: ' + err.message
            ),
        })
      )
      .subscribe();

    this.dataService
      .getStandardCodes()
      .pipe(
        tap({
          next: (data) => {
            this.standardCodes.set(data);
            this.filteredStandardCodes.set(data);
          },
          error: (err) =>
            this.error.set('Error al cargar códigos estándar: ' + err.message),
        })
      )
      .subscribe();

    this.dataService
      .getTributes()
      .pipe(
        tap({
          next: (data) => {
            this.tributes.set(data);
            this.filteredTributes.set(data);
          },
          error: (err) =>
            this.error.set('Error al cargar tributos: ' + err.message),
        })
      )
      .subscribe();
  }

  private setupFilters(): void {
    this.productForm
      .get('unitMeasureId')
      ?.valueChanges.pipe(
        startWith(''),
        map((value) => this.filterOptions(this.unitMeasures(), value))
      )
      .subscribe((filtered) => this.filteredUnitMeasures.set(filtered));

    this.productForm
      .get('standardCodeId')
      ?.valueChanges.pipe(
        startWith(''),
        map((value) => this.filterOptions(this.standardCodes(), value))
      )
      .subscribe((filtered) => this.filteredStandardCodes.set(filtered));

    this.productForm
      .get('tributeId')
      ?.valueChanges.pipe(
        startWith(''),
        map((value) => this.filterOptions(this.tributes(), value))
      )
      .subscribe((filtered) => this.filteredTributes.set(filtered));
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

  displayUnitMeasure(id: number | string): string {
    const item = this.unitMeasures().find(
      (item) => item.id.toString() === id.toString()
    );
    return item ? item.name : '';
  }

  displayStandardCode(id: number | string): string {
    const item = this.standardCodes().find(
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

  filterUnitMeasures(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filteredUnitMeasures.set(
      this.filterOptions(this.unitMeasures(), value)
    );
  }

  filterStandardCodes(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filteredStandardCodes.set(
      this.filterOptions(this.standardCodes(), value)
    );
  }

  filterTributes(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filteredTributes.set(this.filterOptions(this.tributes(), value));
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    if (this.productForm.valid) {
      this.error.set(null);
      const formValue = this.productForm.value;
      const productData: Product = {
        code: formValue.code,
        name: formValue.name,
        description: formValue.description,
        quantity: formValue.quantity,
        price: formValue.price,
        taxRate: formValue.taxRate,
        discountRate: formValue.discountRate || 0,
        unitMeasureId: Number(formValue.unitMeasureId),
        standardCodeId: Number(formValue.standardCodeId),
        tributeId: Number(formValue.tributeId),
        isExcluded: Number(formValue.isExcluded),
        active: true,
      };

      const action = this.isEdit()
        ? this.productService.updateProduct(productData.id!, productData)
        : this.productService.createProduct(productData);

      action
        .pipe(
          tap({
            next: () => {
              Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: this.isEdit()
                  ? 'Producto actualizado exitosamente'
                  : 'Producto creado exitosamente',
                showConfirmButton: false,
                timer: 3000,
                toast: true,
                customClass: {
                  popup: 'custom-swal-popup',
                  title: 'custom-swal-title',
                },
              });
              this.productForm.reset({
                isExcluded: '0',
                quantity: 1,
                discountRate: 0,
              });
              if (!this.isEdit()) {
                this.router.navigate(['/product/create']);
              }
            },
            error: (err) =>
              this.error.set('Error al guardar producto: ' + err.message),
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
        this.router.navigate(['/product/create']);
      }
    });
  }

  showFactusJSON(): void {
    const formValue = this.productForm.value;
    const json = {
      code_reference: formValue.code,
      name: formValue.name,
      quantity: formValue.quantity || 1,
      discount_rate: formValue.discountRate || 0,
      price: formValue.price,
      tax_rate: formValue.taxRate,
      unit_measure_id: Number(formValue.unitMeasureId),
      standard_code_id: Number(formValue.standardCodeId),
      is_excluded: Number(formValue.isExcluded),
      tribute_id: Number(formValue.tributeId),
      withholding_taxes: [],
    };
    this.factusJSON.set(json);
    this.showJSON.set(!this.showJSON());
  }
}
