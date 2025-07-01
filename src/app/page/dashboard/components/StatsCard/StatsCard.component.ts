import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StatsService } from '../../service/stats.service';

@Component({
  selector: 'app-stats-card',
  imports: [CommonModule],
  templateUrl: './StatsCard.component.html',
  styleUrl: './StatsCard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsCardComponent {
  constructor(public statsService: StatsService) {}
}
