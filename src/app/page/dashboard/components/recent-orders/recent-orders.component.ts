import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
} from '@angular/core';
import { DashboardService } from '../../service/dashboard.service';
import { OrdersService } from '../../service/orders.service';

@Component({
  selector: 'app-recent-orders',
  imports: [CommonModule],
  templateUrl: './recent-orders.component.html',
  styleUrl: './recent-orders.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecentOrdersComponent {
  private ordersService = inject(OrdersService);

  getOrders() {
    return this.ordersService.orders();
  }
}
