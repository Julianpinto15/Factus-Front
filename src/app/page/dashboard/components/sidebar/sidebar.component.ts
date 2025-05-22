import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DashboardService } from '../../service/dashboard.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  dashboardService = inject(DashboardService);

  menuItems = [
    { id: 'dashboard', icon: 'bxs-dashboard', text: 'Dashboard' },
    { id: 'store', icon: 'bxs-shopping-bag-alt', text: 'My Store' },
    { id: 'analytics', icon: 'bxs-doughnut-chart', text: 'Analytics' },
    { id: 'message', icon: 'bxs-message-dots', text: 'Message' },
    { id: 'team', icon: 'bxs-group', text: 'Team' },
  ];

  bottomMenuItems = [
    { id: 'settings', icon: 'bxs-cog', text: 'Settings' },
    { id: 'logout', icon: 'bx-power-off', text: 'Logout', class: 'logout' },
  ];
}
