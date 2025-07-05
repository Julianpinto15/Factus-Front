import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ProductService } from '../../service/Product.service';
import { PaginatedResponse, Product } from '../../interface/Product';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { tap } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UnitMeasure } from '../../interface/UnitMeasure';
import { StandardCode } from '../../interface/StandardCode';
import { Tribute } from '../../interface/Tribute';
import { DataService } from '../../service/Data.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductEditComponent } from '../../components/product-edit/product-edit.component';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-list',
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
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent {
  private readonly productService = inject(ProductService);
  private readonly dataService = inject(DataService);
  private readonly dialog = inject(MatDialog);

  readonly products = signal<Product[]>([]);
  readonly error = signal<string | null>(null);
  readonly loading = signal(true);
  readonly unitMeasures = signal<UnitMeasure[]>([]);
  readonly standardCodes = signal<StandardCode[]>([]);
  readonly tributes = signal<Tribute[]>([]);
  readonly displayedColumns: string[] = [
    'code',
    'name',
    'price',
    'taxRate',
    'unitMeasureId',
    'standardCodeId',
    'tributeId',
    'isExcluded',
    'actions',
  ];

  // Pagination properties
  readonly pageSize = signal(10);
  readonly pageIndex = signal(0);
  readonly totalProducts = signal(0);
  readonly skeletonRows = signal(Array(10).fill(0));

  // ViewChild for sort and paginator
  readonly sort = viewChild.required(MatSort);
  readonly paginator = viewChild.required(MatPaginator);

  constructor() {
    this.loadReferenceData();
    this.loadProducts();

    // Update skeleton rows when pageSize changes
    effect(() => {
      this.skeletonRows.set(Array(this.pageSize()).fill(0));
    });
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

  private loadProducts(): void {
    this.loading.set(true);
    this.productService
      .getProducts(this.pageIndex(), this.pageSize())
      .pipe(
        tap({
          next: (response: PaginatedResponse) => {
            console.log('Updating products:', response);
            this.products.set(response.data); // Set the data array
            this.totalProducts.set(response.total); // Set the total count
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set('Error al cargar productos: ' + err.message);
            this.loading.set(false);
            console.error('Error fetching products:', err);
          },
        })
      )
      .subscribe();
  }

  openEditDialog(product: Product): void {
    const dialogRef = this.dialog.open(ProductEditComponent, {
      width: '600px',
      data: { product },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadProducts();
      }
    });
  }

  deleteProduct(id: number): void {
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
        this.productService.deleteProduct(id).subscribe({
          next: () => {
            Swal.fire(
              '¡Eliminado!',
              'El producto ha sido eliminado.',
              'success'
            );
            this.loadProducts(); // Reload to ensure pagination consistency
          },
          error: (err) => {
            this.error.set('Error al eliminar producto: ' + err.message);
            Swal.fire('¡Error!', 'No se pudo eliminar el producto.', 'error');
            console.error('Error deleting product:', err);
          },
        });
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadProducts();
  }

  onSortChange(sort: Sort): void {
    // Optionally handle sorting if backend supports it
    this.loadProducts();
  }

  // Helper methods to map IDs to names
  getUnitMeasureName(id: number): string {
    const unitMeasure = this.unitMeasures().find((um) => um.id === id);
    return unitMeasure ? unitMeasure.name : 'N/A';
  }

  getStandardCodeName(id: number): string {
    const standardCode = this.standardCodes().find((sc) => sc.id === id);
    return standardCode ? standardCode.name : 'N/A';
  }

  getTributeName(id: number): string {
    const tribute = this.tributes().find((t) => t.id === id);
    return tribute ? tribute.name : 'N/A';
  }
}
