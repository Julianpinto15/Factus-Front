import { Chart, ChartConfiguration, registerables } from 'chart.js';
Chart.register(...registerables);
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';
import { ChartService } from '../../service/chart.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-chart',
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
  ],

  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartComponent {
  @ViewChild('statusChart', { static: true })
  statusChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('timelineChart', { static: true })
  timelineChartRef!: ElementRef<HTMLCanvasElement>;

  chartService = inject(ChartService);

  private statusChart?: Chart;
  private timelineChart?: Chart;

  constructor() {
    // Effect para actualizar la gráfica cuando cambien los datos
    effect(() => {
      const data = this.chartService.chartData();

      if (data && this.statusChart) {
        this.updateStatusChart();
      }
    });
  }

  ngAfterViewInit() {
    this.initStatusChart();
    this.initTimelineChart();
  }

  ngOnDestroy() {
    this.statusChart?.destroy();
    this.timelineChart?.destroy();
  }

  private initStatusChart() {
    const ctx = this.statusChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: [],
        datasets: [],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Estado de las Tareas',
          },
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
          },
        },
      },
    };

    this.statusChart = new Chart(ctx, config);
    this.updateStatusChart();
  }

  private initTimelineChart() {
    const ctx = this.timelineChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const timelineData = this.chartService.getTimelineData();

    const config: ChartConfiguration = {
      type: 'line',
      data: timelineData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Tendencia de Tareas en el Tiempo',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
        elements: {
          point: {
            radius: 6,
            hoverRadius: 8,
          },
        },
      },
    };

    this.timelineChart = new Chart(ctx, config);
  }

  private updateStatusChart() {
    const ctx = this.statusChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const data = this.chartService.chartData();
    if (!data) return;

    this.statusChart?.destroy(); // Destruir el anterior

    this.statusChart = new Chart(ctx, {
      type: this.chartService.chartType(),
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Estado de las Tareas',
          },
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
          },
        },
      },
    });
  }

  toggleChartType() {
    this.chartService.toggleChartType();
  }
}
