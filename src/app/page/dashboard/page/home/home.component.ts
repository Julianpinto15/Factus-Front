import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { StatsCardComponent } from '../../components/StatsCard/StatsCard.component';
import { RecentOrdersComponent } from '../../components/recent-orders/recent-orders.component';
import { TodoListComponent } from '../../components/todo-list/todo-list.component';

@Component({
  selector: 'app-home',
  imports: [
    HeaderComponent,
    StatsCardComponent,
    RecentOrdersComponent,
    TodoListComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {}
