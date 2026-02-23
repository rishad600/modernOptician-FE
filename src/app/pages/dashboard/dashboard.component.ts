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
    avatar: 'images/avatar-placeholder.png'
  };

  navItems = [
    { label: 'My Courses', icon: 'book', route: 'my-courses' },
    { label: 'Profile Settings', icon: 'settings', route: 'profile' }
  ];
}
