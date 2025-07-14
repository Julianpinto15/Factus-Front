import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  inject,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProductService } from '../../../product/service/Product.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Product } from '../../../product/interface/Product';
import { MatDialogRef } from '@angular/material/dialog';
import { Tribute } from '../../../customer/interface/Tribute';

@Component({
  selector: 'app-modal-product',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
  ],
  templateUrl: './modal-product.component.html',
  styleUrl: './modal-product.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalProductComponent implements OnInit {
  productForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ModalProductComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { products: Product[]; tributes: Tribute[] }
  ) {
    this.productForm = this.fb.group({
      productId: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      discount_rate: [0, [Validators.required, Validators.min(0)]],
      tax_rate: ['19.00', Validators.required],
      tribute_id: ['01', Validators.required],
    });
  }

  ngOnInit(): void {
    // Update form when product is selected
    this.productForm.get('productId')?.valueChanges.subscribe((productId) => {
      this.onProductChange(productId);
    });
  }

  onProductChange(productId: number): void {
    const selectedProduct = this.data.products.find((p) => p.id === +productId);
    if (selectedProduct) {
      const tribute = this.data.tributes.find(
        (t) => t.id === Number(selectedProduct.tributeId)
      );
      const tributeCode = tribute ? tribute.code : '01';
      this.productForm.patchValue({
        tax_rate: selectedProduct.taxRate,
        tribute_id: tributeCode,
      });
    }
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const selectedProduct = this.data.products.find(
        (p) => p.id === this.productForm.get('productId')?.value
      );
      if (selectedProduct) {
        const formValue = this.productForm.value;
        const productData = {
          code_reference: selectedProduct.code,
          name: selectedProduct.name,
          quantity: formValue.quantity,
          discount_rate: formValue.discount_rate,
          price: selectedProduct.price,
          tax_rate: formValue.tax_rate,
          unit_measure_id: selectedProduct.unitMeasureId,
          standard_code_id: selectedProduct.standardCodeId,
          is_excluded:
            formValue.tribute_id === '01' ? selectedProduct.isExcluded ?? 0 : 0, // Valor por defecto 0
          tribute_id: formValue.tribute_id,
        };
        console.log('Product data returned from modal:', productData);
        this.dialogRef.close(productData); // Close dialog and pass data
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close(); // Close dialog without data
  }
}
