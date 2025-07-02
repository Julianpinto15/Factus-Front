import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UnitMeasure } from '../../interface/UnitMeasure';
import { StandardCode } from '../../interface/StandardCode';
import { Tribute } from '../../interface/Tribute';
import { ProductService } from '../../service/Product.service';
import { DataService } from '../../service/Data.service';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { Product } from '../../interface/Product';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-product-edit',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
  ],
  templateUrl: './product-edit.component.html',
  styleUrl: './product-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductEditComponent implements OnInit {
  productForm: FormGroup;
  readonly unitMeasures = signal<UnitMeasure[]>([]);
  readonly standardCodes = signal<StandardCode[]>([]);
  readonly tributes = signal<Tribute[]>([]);

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private dataService: DataService,
    public dialogRef: MatDialogRef<ProductEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { product: Product }
  ) {
    this.productForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      taxRate: [0, [Validators.required, Validators.min(0)]],
      unitMeasureId: [null, Validators.required],
      standardCodeId: [null, Validators.required],
      tributeId: [null, Validators.required],
      isExcluded: [false],
    });
  }

  ngOnInit(): void {
    // Load reference data
    this.loadReferenceData();

    // Populate form with product data
    if (this.data.product) {
      this.productForm.patchValue({
        code: this.data.product.code,
        name: this.data.product.name,
        price: this.data.product.price,
        taxRate: this.data.product.taxRate,
        unitMeasureId: this.data.product.unitMeasureId,
        standardCodeId: this.data.product.standardCodeId,
        tributeId: this.data.product.tributeId,
        isExcluded: !!this.data.product.isExcluded,
      });
    }
  }

  private loadReferenceData(): void {
    this.dataService.getUnitMeasures().subscribe({
      next: (data) => this.unitMeasures.set(data),
      error: (err) => console.error('Error fetching unit measures:', err),
    });

    this.dataService.getStandardCodes().subscribe({
      next: (data) => this.standardCodes.set(data),
      error: (err) => console.error('Error fetching standard codes:', err),
    });

    this.dataService.getTributes().subscribe({
      next: (data) => this.tributes.set(data),
      error: (err) => console.error('Error fetching tributes:', err),
    });
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const updatedProduct: Product = {
        ...this.data.product,
        ...this.productForm.value,
        id: this.data.product.id,
      };
      const id = updatedProduct.id;

      if (id == null) {
        console.error('El producto no tiene ID. No se puede actualizar.');
        return;
      }

      this.productService.updateProduct(id, updatedProduct).subscribe({
        next: () => this.dialogRef.close(updatedProduct),
        error: (err) => console.error('Error updating product:', err),
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
