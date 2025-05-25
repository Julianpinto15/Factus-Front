import {
  ChangeDetectionStrategy,
  Component,
  effect,
  HostListener,
  inject,
  Renderer2,
  signal,
} from '@angular/core';

import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
  LayoutModule,
} from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { NavbarComponent } from '../../components/Navbar/Navbar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { StatsCardComponent } from '../../components/StatsCard/StatsCard.component';
import { RecentOrdersComponent } from '../../components/recent-orders/recent-orders.component';
import { TodoListComponent } from '../../components/todo-list/todo-list.component';
import { DashboardService } from '../../service/dashboard.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    LayoutModule,
    SidebarComponent,
    NavbarComponent,
    RouterOutlet,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  public dashboardService = inject(DashboardService);
  private renderer = inject(Renderer2);
  private breakpointObserver = inject(BreakpointObserver);

  constructor() {
    // Initialize sidebar state based on screen size
    this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .subscribe((result: BreakpointState) => {
        this.dashboardService.isSidebarHidden.set(result.matches);
      });

    // Sync dark mode with body class
    effect(() => {
      const isDark = this.dashboardService.isDarkMode();
      if (isDark) {
        this.renderer.addClass(document.body, 'dark');
      } else {
        this.renderer.removeClass(document.body, 'dark');
      }
    });
  }

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth <= 576) {
      this.dashboardService.isSidebarHidden.set(true);
    } else {
      this.dashboardService.isSidebarHidden.set(false);
    }
  }
}
