import { inject, Injectable, signal } from '@angular/core';
import { InvoiceService } from '../../invoice/service/Invoice.service';
import { Invoice } from '../../invoice/interface/Invoice';

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private invoiceService = inject(InvoiceService);

  orders = signal<
    { user: string; image: string; date: string; status: string }[]
  >([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  constructor() {
    this.fetchOrders();
  }

  private fetchOrders(): void {
    this.isLoading.set(true);
    this.invoiceService.getInvoices(0, 6).subscribe({
      next: (response) => {
        const transformedOrders = response.data
          .slice(0, 6)
          .map((invoice: Invoice, index) => ({
            user:
              invoice.customer?.names ||
              invoice.customer?.company ||
              'Cliente desconocido',
            image: 'https://placehold.co/600x400/png', // Placeholder, reemplaza si tienes imágenes
            date: new Date(invoice.createdAt).toLocaleDateString(),
            status: (invoice.status || 'pending').toLowerCase(),
          }));
        this.orders.set(transformedOrders);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching orders:', err);
        this.error.set('Error al cargar órdenes recientes');
        this.orders.set([]);
        this.isLoading.set(false);
      },
    });
  }
}
