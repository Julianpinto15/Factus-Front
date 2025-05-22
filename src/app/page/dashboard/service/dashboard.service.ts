import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { delay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);

  isSidebarHidden = signal(true);
  isDarkMode = signal(false);
  isSearchFormShown = signal(false);
  activeMenuItem = signal<string>('dashboard');
  isNotificationMenuShown = signal(false);
  isProfileMenuShown = signal(false);

  // Signals for dynamic data
  stats = signal<{ icon: string; value: string; label: string }[]>([]);
  orders = signal<
    { user: string; image: string; date: string; status: string }[]
  >([]);
  todos = signal<{ task: string; completed: boolean }[]>([]);

  constructor() {
    // Simulate initial data fetch on service initialization
    this.fetchStats();
    this.fetchOrders();
    this.fetchTodos();
  }

  // Simulated API calls (replace with real endpoints)
  private fetchStats(): void {
    this.http
      .get<{ icon: string; value: string; label: string }[]>(
        'https://jsonplaceholder.typicode.com/posts' // Example endpoint, replace with your API
      )
      .pipe(delay(1000)) // Simulate network delay
      .subscribe((data) => {
        const transformedStats = data
          .map((item, index) => ({
            icon: ['bxs-calendar-check', 'bxs-group', 'bxs-dollar-circle'][
              index % 3
            ],
            value: (Math.random() * 1000).toFixed(0),
            label: ['New Order', 'Visitors', 'Total Sales'][index % 3],
          }))
          .slice(0, 3); // Limit to 3 items
        this.stats.set(transformedStats);
      });
  }

  private fetchOrders(): void {
    this.http
      .get<any[]>('https://jsonplaceholder.typicode.com/users') // Example endpoint, replace with your API
      .pipe(delay(1000)) // Simulate network delay
      .subscribe((data) => {
        const transformedOrders = data.slice(0, 5).map((user, index) => ({
          user: user.name,
          image: 'https://placehold.co/600x400/png',
          date: new Date(Date.now() - index * 86400000).toLocaleDateString(),
          status: ['completed', 'pending', 'process'][index % 3],
        }));
        this.orders.set(transformedOrders);
      });
  }

  private fetchTodos(): void {
    this.http
      .get<any[]>('https://jsonplaceholder.typicode.com/todos') // Example endpoint, replace with your API
      .pipe(delay(1000)) // Simulate network delay
      .subscribe((data) => {
        const transformedTodos = data.slice(0, 5).map((todo) => ({
          task: todo.title,
          completed: todo.completed,
        }));
        this.todos.set(transformedTodos);
      });
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
