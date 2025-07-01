import { computed, inject, Injectable, signal } from '@angular/core';
import { TodosService } from './todos.service';

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    type?: 'bar' | 'line';
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class ChartService {
  private todosService = inject(TodosService);

  chartType = signal<'bar' | 'line'>('bar');

  // Computed para generar datos de gráfica automáticamente
  chartData = computed(() => {
    const todos = this.todosService.todos();

    if (!todos.length) {
      return null;
    }

    // Agrupar por estado
    const completed = todos.filter((t) => t.completed).length;
    const pending = todos.filter((t) => !t.completed).length;

    const data: ChartData = {
      labels: ['Completadas', 'Pendientes'],
      datasets: [
        {
          label: 'Tareas',
          data: [completed, pending],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 99, 132, 0.6)',
          ],
          borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
          borderWidth: 2,
          type: this.chartType(),
        },
      ],
    };

    return data;
  });

  // Datos para gráfica de líneas temporales (simulado)
  getTimelineData(): ChartData {
    return {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
      datasets: [
        {
          label: 'Tareas Completadas',
          data: [12, 19, 15, 25, 22],
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderWidth: 2,
          type: 'line',
        },
        {
          label: 'Tareas Creadas',
          data: [15, 25, 20, 30, 28],
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderWidth: 2,
          type: 'line',
        },
      ],
    };
  }

  toggleChartType() {
    this.chartType.update((type) => (type === 'bar' ? 'line' : 'bar'));
  }
}
