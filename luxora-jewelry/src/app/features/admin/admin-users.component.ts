import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, UserProfile } from '../../core/services/user.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-6">Registered Users ({{ users.length }})</h2>

      <div class="bg-white rounded-lg shadow overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-100 border-b">
            <tr>
              <th class="px-6 py-3 text-left text-sm font-semibold">Name</th>
              <th class="px-6 py-3 text-left text-sm font-semibold">Email</th>
              <th class="px-6 py-3 text-left text-sm font-semibold">Phone</th>
              <th class="px-6 py-3 text-left text-sm font-semibold">Location</th>
              <th class="px-6 py-3 text-left text-sm font-semibold">Orders</th>
              <th class="px-6 py-3 text-left text-sm font-semibold">Total Spent</th>
              <th class="px-6 py-3 text-left text-sm font-semibold">Registered</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users" class="border-b hover:bg-gray-50">
              <td class="px-6 py-4 font-semibold">{{ user.name }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ user.email }}</td>
              <td class="px-6 py-4 text-sm">{{ user.phone }}</td>
              <td class="px-6 py-4 text-sm">{{ user.city }}, {{ user.country }}</td>
              <td class="px-6 py-4">
                <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {{ user.orders.length }}
                </span>
              </td>
              <td class="px-6 py-4 font-semibold">₹{{ getTotalSpent(user) }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ user.registeredDate | date: 'MMM dd, yyyy' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="users.length === 0" class="text-center py-12">
        <p class="text-gray-600">No users registered yet</p>
      </div>

      <!-- Summary Stats -->
      <div class="grid grid-cols-3 gap-6 mt-8">
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-gray-600 text-sm">Total Users</p>
          <p class="text-3xl font-bold text-gray-900">{{ users.length }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-gray-600 text-sm">Total Orders</p>
          <p class="text-3xl font-bold text-gray-900">{{ getTotalOrders() }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-gray-600 text-sm">Total Revenue</p>
          <p class="text-3xl font-bold text-rose-500">₹{{ getTotalRevenue() }}</p>
        </div>
      </div>
    </div>
  `,
})
export class AdminUsersComponent implements OnInit {
  users: UserProfile[] = [];

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.users = this.userService.getAllUsers();
  }

  getTotalSpent(user: UserProfile): number {
    return user.orders.reduce((sum, order) => sum + order.total, 0);
  }

  getTotalOrders(): number {
    return this.users.reduce((sum, user) => sum + user.orders.length, 0);
  }

  getTotalRevenue(): number {
    return this.users.reduce((sum, user) => sum + this.getTotalSpent(user), 0);
  }
}
