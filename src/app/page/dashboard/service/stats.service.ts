import { inject, Injectable, signal } from '@angular/core';
import { CustomerService } from '../../customer/service/Customer.service';
import { ProductService } from '../../product/service/Product.service';
import { InvoiceService } from '../../invoice/service/Invoice.service';

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  private customerService = inject(CustomerService);
  private productService = inject(ProductService);
  private invoiceService = inject(InvoiceService);

  stats = signal<{ icon: string; value: string; label: string }[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  constructor() {
    this.fetchStats();
  }

  private fetchStats(): void {
    let completedRequests = 0;
    const totalRequests = 3; // Clientes, productos, facturas

    const checkAllRequests = () => {
      completedRequests++;
      if (completedRequests === totalRequests) {
        this.isLoading.set(false);
      }
    };

    this.customerService.getCustomers(0, 10).subscribe({
      next: (response) => {
        this.updateStats(
          'bxs-group',
          response.total.toString(),
          'Total Clientes'
        );
        checkAllRequests();
      },
      error: (err) => {
        console.error('Error fetching customers:', err);
        this.updateStats('bxs-group', '0', 'Total Clientes');
        this.error.set('Error al cargar clientes');
        checkAllRequests();
      },
    });

    this.productService.getProducts(0, 10).subscribe({
      next: (response) => {
        this.updateStats(
          'bxs-box',
          response.total.toString(),
          'Total Productos'
        );
        checkAllRequests();
      },
      error: (err) => {
        console.error('Error fetching products:', err);
        this.updateStats('bxs-box', '0', 'Total Productos');
        this.error.set('Error al cargar productos');
        checkAllRequests();
      },
    });

    this.invoiceService.getInvoices(0, 10).subscribe({
      next: (response) => {
        this.updateStats(
          'bxs-receipt',
          response.total.toString(),
          'Total Facturas'
        );
        checkAllRequests();
      },
      error: (err) => {
        console.error('Error fetching invoices:', err);
        this.updateStats('bxs-receipt', '0', 'Total Facturas');
        this.error.set('Error al cargar facturas');
        checkAllRequests();
      },
    });
  }

  private updateStats(icon: string, value: string, label: string): void {
    this.stats.update((currentStats) => [
      ...currentStats.filter((stat) => stat.label !== label),
      { icon, value, label },
    ]);
  }
}
