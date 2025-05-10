import { Routes } from '@angular/router';

import { DashboardComponent } from './page/dashboard-home/components/dashboard/dashboard.component';
import { LoginComponent } from './auth/page/login/login.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
