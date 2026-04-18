import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';

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
  showLogoutDialog = false;

  navItems = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Manage Courses', route: '/admin/courses', icon: 'courses' },
    { label: 'Manage Students', route: '/admin/students', icon: 'students' },
    { label: 'View Payments', route: '/admin/payments', icon: 'payments' },
    { label: 'Content Mgmt', route: '/admin/content', icon: 'content' },
  ];

  constructor(private router: Router) {}

  confirmLogout() {
    this.isMobileMenuOpen = false;
    this.showLogoutDialog = true;
  }

  cancelLogout() {
    this.showLogoutDialog = false;
  }

  logout() {
    this.showLogoutDialog = false;
    localStorage.clear();
    this.router.navigate(['/auth/admin-login']);
  }
}
