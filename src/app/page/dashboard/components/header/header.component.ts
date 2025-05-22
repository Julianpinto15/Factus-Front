import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { DashboardService } from '../../service/dashboard.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  dashboardService = inject(DashboardService);

  // Texto legible del menú (por ejemplo: 'Dashboard' en vez de 'home')
  menuTitles: Record<string, string> = {
    home: 'Dashboard',
    customer: 'Customers',
    analytics: 'Analytics',
    message: 'Mensajes',
    team: 'Equipo',
    settings: 'Configuración',
    logout: 'Salir',
  };

  // Computed signal para el título dinámico
  currentTitle = computed(() => {
    const key = this.dashboardService.activeMenuItem();
    return this.menuTitles[key] || 'Inicio';
  });
}
