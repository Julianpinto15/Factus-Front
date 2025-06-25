import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { InvoiceService } from '../../service/Invoice.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-invoice-detail',
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './invoice-detail.component.html',
  styleUrl: './invoice-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceDetailComponent {
  private readonly invoiceService = inject(InvoiceService);
  private readonly route = inject(ActivatedRoute);

  readonly invoice = signal<any | null>(null);
  readonly error = signal<string | null>(null);
  readonly loading = signal(true);
  readonly displayedColumns: string[] = ['name', 'quantity', 'price', 'total'];

  constructor() {
    const number = this.route.snapshot.paramMap.get('number');
    if (number) {
      this.loadInvoice(number);
    } else {
      this.error.set('Número de factura no proporcionado');
      this.loading.set(false);
    }
  }

  private loadInvoice(number: string): void {
    this.loading.set(true);
    this.invoiceService.getInvoiceByNumber(number).subscribe({
      next: (data) => {
        this.invoice.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar factura: ' + err.message);
        this.loading.set(false);
        console.error('Error fetching invoice:', err);
      },
    });
  }
}
