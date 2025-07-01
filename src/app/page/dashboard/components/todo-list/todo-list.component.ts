import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ChartComponent } from '../../shared/chart/chart.component';

@Component({
  selector: 'app-todo-list',
  imports: [CommonModule, ChartComponent],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoListComponent {}
