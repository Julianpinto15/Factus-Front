import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
} from '@angular/core';
import { DashboardService } from '../../service/dashboard.service';

@Component({
  selector: 'app-stats-card',
  imports: [CommonModule],
  templateUrl: './StatsCard.component.html',
  styleUrl: './StatsCard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsCardComponent {
  private dashboardService = inject(DashboardService);

  get stats() {
    return this.dashboardService.stats();
  }
}
