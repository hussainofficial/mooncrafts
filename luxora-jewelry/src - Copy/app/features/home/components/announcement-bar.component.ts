import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../../../core/services/mock-data.service';
import { AnnouncementItem } from '../../../core/models';

@Component({
  selector: 'app-announcement-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-200">
      <div class="max-w-7xl mx-auto px-4">
        <!-- Desktop View -->
        <div class="hidden md:grid grid-cols-5 gap-4 py-3">
          <div *ngFor="let item of announcements" class="flex items-center justify-center gap-2 text-sm text-gray-700">
            <span class="text-rose-500">●</span>
            <span>{{ item.text }}</span>
          </div>
        </div>
        <!-- Mobile View - Scrollable -->
        <div class="md:hidden overflow-x-auto py-3">
          <div class="flex gap-6 whitespace-nowrap px-2">
            <div *ngFor="let item of announcements" class="flex items-center gap-2 text-xs text-gray-700">
              <span class="text-rose-500">●</span>
              <span>{{ item.text }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AnnouncementBarComponent implements OnInit {
  announcements: AnnouncementItem[] = [];

  constructor(private mockDataService: MockDataService) {}

  ngOnInit() {
    this.announcements = this.mockDataService.getAnnouncements();
  }
}
