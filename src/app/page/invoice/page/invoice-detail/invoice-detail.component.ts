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
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { HttpErrorResponse } from '@angular/common/http';

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
    MatListModule,
    MatExpansionModule,
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
  readonly displayedColumns: string[] = [
    'code',
    'name',
    'quantity',
    'price',
    'tax_rate',
    'total',
  ];

  constructor() {
    const number = this.route.snapshot.paramMap.get('invoiceNumber');
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

  getInvoiceNumber(): string {
    const data = this.invoice();
    return (
      data?.data?.bill?.number || data?.invoiceNumber || data?.number || 'N/A'
    );
  }

  getCustomerName(): string {
    const data = this.invoice();
    // Basado en la estructura del JSON proporcionado
    return (
      data?.data?.customer?.graphic_representation_name ||
      data?.data?.customer?.names ||
      data?.data?.customer?.company ||
      data?.customer?.company ||
      data?.customer?.names ||
      data?.bill?.customer?.company ||
      data?.bill?.customer?.names ||
      'N/A'
    );
  }

  getInvoiceStatus(): string {
    const data = this.invoice();
    const status =
      data?.data?.bill?.status || data?.status || data?.bill?.status;

    // Convertir el estado numérico a texto descriptivo
    switch (status) {
      case 1:
        return 'Activa';
      case 0:
        return 'Inactiva';
      default:
        return status || 'N/A';
    }
  }

  getCreatedAt(): string {
    const data = this.invoice();
    return (
      data?.data?.bill?.created_at ||
      data?.createdAt ||
      data?.bill?.createdAt ||
      ''
    );
  }

  // Método para convertir la fecha del formato del API a Date object
  parseCreatedAt(): Date | null {
    const dateString = this.getCreatedAt();
    if (!dateString) return null;

    try {
      // El formato es "25-06-2025 03:29:50 PM"
      // Convertir a formato que pueda parsear JavaScript
      const [datePart, timePart, ampm] = dateString.split(' ');
      const [day, month, year] = datePart.split('-');
      const [hours, minutes, seconds] = timePart.split(':');

      let hour24 = parseInt(hours);
      if (ampm === 'PM' && hour24 !== 12) {
        hour24 += 12;
      } else if (ampm === 'AM' && hour24 === 12) {
        hour24 = 0;
      }

      return new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        hour24,
        parseInt(minutes),
        parseInt(seconds)
      );
    } catch (error) {
      console.error('Error parsing date:', error);
      return null;
    }
  }

  getCufe(): string {
    const data = this.invoice();
    return (
      data?.data?.bill?.cufe ||
      data?.cufe ||
      data?.bill?.cufe ||
      data?.invoiceUuid ||
      'N/A'
    );
  }

  getItems(): any[] {
    const data = this.invoice();
    return (
      data?.data?.items ||
      data?.items ||
      data?.bill?.items ||
      data?.invoiceItems ||
      []
    );
  }

  // Método para obtener totales de la factura
  getGrossValue(): number {
    const data = this.invoice();
    return parseFloat(data?.data?.bill?.gross_value || '0');
  }

  getTaxAmount(): number {
    const data = this.invoice();
    return parseFloat(data?.data?.bill?.tax_amount || '0');
  }

  getTotal(): number {
    const data = this.invoice();
    return parseFloat(data?.data?.bill?.total || '0');
  }

  // Método para obtener información de la empresa
  getCompanyInfo(): any {
    const data = this.invoice();
    return data?.data?.company || {};
  }

  // Método para obtener errores si existen
  getErrors(): string[] {
    const data = this.invoice();
    return data?.data?.bill?.errors || [];
  }

  downloadPdf(number: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.invoiceService.downloadInvoicePdf(number).subscribe({
      next: (blob) => {
        this.downloadFile(blob, `invoice_${number}.pdf`);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        let errorMessage = 'Error al descargar el PDF';
        if (err.status === 500) {
          errorMessage += ': Error interno del servidor';
          if (err.error instanceof Blob) {
            err.error.text().then((text: string) => {
              try {
                const jsonError = JSON.parse(text);
                errorMessage += `: ${
                  jsonError.message || 'No PDF data available'
                }`;
              } catch {
                errorMessage += `: ${text || 'Invalid response'}`;
              }
              this.error.set(errorMessage);
            });
          } else {
            errorMessage += `: ${
              err.error?.message || 'Invalid PDF content received'
            }`;
            this.error.set(errorMessage);
          }
        } else {
          errorMessage += `: ${err.message}`;
          this.error.set(errorMessage);
        }
        console.error('Error downloading PDF:', err);
      },
    });
  }

  downloadXml(number: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.invoiceService.downloadInvoiceXml(number).subscribe({
      next: (blob) => {
        this.downloadFile(blob, `invoice_${number}.xml`);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        let errorMessage = 'Error al descargar el XML';
        if (err.status === 500) {
          errorMessage += ': Error interno del servidor';
          if (err.error instanceof Blob) {
            err.error.text().then((text: string) => {
              try {
                const jsonError = JSON.parse(text);
                errorMessage += `: ${
                  jsonError.message || 'No XML data available'
                }`;
              } catch {
                errorMessage += `: ${text || 'Invalid response'}`;
              }
              this.error.set(errorMessage);
            });
          } else {
            errorMessage += `: ${
              err.error?.message || 'Invalid XML content received'
            }`;
            this.error.set(errorMessage);
          }
        } else if (err.status === 204) {
          errorMessage += ': No se encontró contenido XML para la factura';
          this.error.set(errorMessage);
        } else {
          errorMessage += `: ${err.message}`;
          this.error.set(errorMessage);
        }
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
