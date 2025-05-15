import { Routes } from '@angular/router';

import { LoginComponent } from './auth/page/login/login.component';
import { DashboardComponent } from './page/dashboard/page/dashboard-main/dashboard.component';

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
    redirectTo: 'dashboard',
  },
];
