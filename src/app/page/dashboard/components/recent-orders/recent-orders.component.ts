import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
} from '@angular/core';
import { DashboardService } from '../../service/dashboard.service';

@Component({
  selector: 'app-recent-orders',
  imports: [CommonModule],
  templateUrl: './recent-orders.component.html',
  styleUrl: './recent-orders.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecentOrdersComponent {
  private dashboardService = inject(DashboardService);

  get orders() {
    return this.dashboardService.orders();
  }
}
