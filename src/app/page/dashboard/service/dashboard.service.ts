import { inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private router = inject(Router);

  isSidebarHidden = signal(true);
  isDarkMode = signal(false);
  isSearchFormShown = signal(false);
  activeMenuItem = signal<string>('dashboard');
  isNotificationMenuShown = signal(false);
  isProfileMenuShown = signal(false);

  constructor() {
    this.setActiveMenuFromUrl(this.router.url);
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navEnd = event as NavigationEnd;
        this.setActiveMenuFromUrl(navEnd.urlAfterRedirects);
      });
  }

  private setActiveMenuFromUrl(url: string) {
    const parts = url.split('/');
    const menuId = parts[2]?.split('?')[0]?.split('#')[0];
    if (menuId) {
      this.activeMenuItem.set(menuId);
    }
  }

  toggleSidebar() {
    this.isSidebarHidden.set(!this.isSidebarHidden());
  }

  setActiveMenu(menuId: string) {
    this.activeMenuItem.set(menuId);
  }

  toggleSearchForm(event?: Event) {
    if (event && window.innerWidth < 768) {
      event.preventDefault();
    }
    this.isSearchFormShown.set(!this.isSearchFormShown());
  }

  toggleDarkMode() {
    this.isDarkMode.set(!this.isDarkMode());
  }

  toggleNotificationMenu() {
    this.isNotificationMenuShown.set(!this.isNotificationMenuShown());
    this.isProfileMenuShown.set(false);
  }

  toggleProfileMenu() {
    this.isProfileMenuShown.set(!this.isProfileMenuShown());
    this.isNotificationMenuShown.set(false);
  }
}
