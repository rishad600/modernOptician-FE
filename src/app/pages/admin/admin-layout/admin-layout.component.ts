import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent {
  adminName = 'Admin';
  adminEmail = 'admin@modernoptician.com';
  isMobileMenuOpen = false;

  navItems = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Manage Courses', route: '/admin/courses', icon: 'courses' },
    { label: 'Manage Students', route: '/admin/students', icon: 'students' },
    { label: 'View Payments', route: '/admin/payments', icon: 'payments' },
    { label: 'Content Mgmt', route: '/admin/content', icon: 'content' },
  ];
}
