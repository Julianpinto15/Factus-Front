import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Renderer2,
  signal,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
  LayoutModule,
} from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, LayoutModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  // Signals for reactive state
  isSidebarHidden = signal(true);
  isDarkMode = signal(false);
  isSearchFormShown = signal(false);
  activeMenuItem = signal<string>('dashboard');
  isNotificationMenuShown = signal(false);
  isProfileMenuShown = signal(false);

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

  constructor(
    private renderer: Renderer2,
    private breakpointObserver: BreakpointObserver
  ) {
    // Initialize sidebar state based on screen size
    this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .subscribe((result: BreakpointState) => {
        // Explicitly type result as BreakpointState
        this.isSidebarHidden.set(result.matches); // Hide sidebar on small screens
      });
  }

  toggleSidebar() {
    this.isSidebarHidden.set(!this.isSidebarHidden());
  }

  setActiveMenu(menuId: string) {
    this.activeMenuItem.set(menuId);
  }

  toggleSearchForm(event: Event) {
    if (window.innerWidth < 768) {
      event.preventDefault();
      this.isSearchFormShown.set(!this.isSearchFormShown());
    }
  }

  toggleDarkMode() {
    this.isDarkMode.set(!this.isDarkMode());
    if (this.isDarkMode()) {
      this.renderer.addClass(document.body, 'dark');
    } else {
      this.renderer.removeClass(document.body, 'dark');
    }
  }

  toggleNotificationMenu() {
    this.isNotificationMenuShown.set(!this.isNotificationMenuShown());
    this.isProfileMenuShown.set(false);
  }

  toggleProfileMenu() {
    this.isProfileMenuShown.set(!this.isProfileMenuShown());
    this.isNotificationMenuShown.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification') && !target.closest('.profile')) {
      this.isNotificationMenuShown.set(false);
      this.isProfileMenuShown.set(false);
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth <= 576) {
      this.isSidebarHidden.set(true);
    } else {
      this.isSidebarHidden.set(false);
    }
  }
}
