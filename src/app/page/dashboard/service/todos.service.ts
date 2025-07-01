import { inject, Injectable, signal } from '@angular/core';
import { InvoiceService } from '../../invoice/service/Invoice.service';
import { Invoice } from '../../invoice/interface/Invoice';

@Injectable({
  providedIn: 'root',
})
export class TodosService {
  private invoiceService = inject(InvoiceService);

  todos = signal<{ task: string; completed: boolean }[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  constructor() {
    this.fetchTodos();
  }

  private fetchTodos(): void {
    this.isLoading.set(true);
    this.invoiceService.getInvoices(0, 5).subscribe({
      next: (response) => {
        const transformedTodos = response.data
          .slice(0, 5)
          .map((invoice: Invoice) => ({
            task: `Revisar factura ${invoice.status}`,
            completed: invoice.status === 'completed',
          }));
        this.todos.set(transformedTodos);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching todos:', err);
        this.error.set('Error al cargar tareas');
        this.todos.set([]);
        this.isLoading.set(false);
      },
    });
  }
}
