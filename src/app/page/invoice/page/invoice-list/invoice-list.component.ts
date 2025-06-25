import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { InvoiceService } from '../../service/Invoice.service';
import { Invoice } from '../../interface/Invoice';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { tap } from 'rxjs';
import { PaginatedResponse } from '../../interface/PaginatedResponse';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-invoice-list',
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceListComponent {
  private readonly invoiceService = inject(InvoiceService);

  readonly invoices = signal<Invoice[]>([]);
  readonly error = signal<string | null>(null);
  readonly loading = signal(true);
  readonly displayedColumns: string[] = [
    'invoiceNumber',
    'customer',
    'createdAt',
    'status',
    'actions',
  ];

  // Pagination properties
  readonly pageSize = signal(10);
  readonly pageIndex = signal(0);
  readonly totalInvoices = signal(0);
  readonly skeletonRows = signal(Array(10).fill(0));

  // ViewChild for sort and paginator
  readonly sort = viewChild.required(MatSort);
  readonly paginator = viewChild.required(MatPaginator);

  constructor() {
    this.loadInvoices();

    // Update skeleton rows when pageSize changes
    effect(() => {
      this.skeletonRows.set(Array(this.pageSize()).fill(0));
    });
  }

  private loadInvoices(): void {
    this.loading.set(true);
    this.invoiceService
      .getInvoices(this.pageIndex(), this.pageSize())
      .pipe(
        tap({
          next: (response: PaginatedResponse) => {
            this.invoices.set(response.data);
            this.totalInvoices.set(response.total);
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set('Error al cargar facturas: ' + err.message);
            this.loading.set(false);
            console.error('Error fetching invoices:', err);
          },
        })
      )
      .subscribe();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadInvoices();
  }

  onSortChange(sort: Sort): void {
    // Optionally handle sorting if backend supports it
    this.loadInvoices();
  }

  downloadPdf(number: string): void {
    this.invoiceService.downloadInvoicePdf(number).subscribe({
      next: (blob) => {
        this.downloadFile(blob, `invoice_${number}.pdf`);
      },
      error: (err) => {
        this.error.set('Error al descargar PDF: ' + err.message);
        console.error('Error downloading PDF:', err);
      },
    });
  }

  downloadXml(number: string): void {
    this.invoiceService.downloadInvoiceXml(number).subscribe({
      next: (blob) => {
        this.downloadFile(blob, `invoice_${number}.xml`);
      },
      error: (err) => {
        this.error.set('Error al descargar XML: ' + err.message);
        console.error('Error downloading XML:', err);
      },
    });
  }

  private downloadFile(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
