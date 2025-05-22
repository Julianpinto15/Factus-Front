import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  inject,
  Input,
  Output,
} from '@angular/core';
import { DashboardService } from '../../service/dashboard.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './Navbar.component.html',
  styleUrl: './Navbar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  public dashboardService = inject(DashboardService);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification') && !target.closest('.profile')) {
      this.dashboardService.isNotificationMenuShown.set(false);
      this.dashboardService.isProfileMenuShown.set(false);
    }
  }
  onToggleSearchForm(event: Event): void {
    this.dashboardService.toggleSearchForm(event);
  }
}
