import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  isMobileMenuOpen = false;
  user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: ''
  };

  navItems = [
    { label: 'My Courses', icon: 'book', route: 'my-courses' },
    { label: 'Profile Settings', icon: 'settings', route: 'profile' }
  ];
  getInitials(): string {
    if (!this.user.name) return 'JD';
    const names = this.user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
    }
    return this.user.name.charAt(0).toUpperCase();
  }
}
