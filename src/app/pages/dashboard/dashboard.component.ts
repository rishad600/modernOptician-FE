import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  isMobileMenuOpen = false;
  showLogoutDialog = false;
  user = {
    name: '',
    email: '',
    avatar: ''
  };

  constructor(private router: Router) { }

  ngOnInit(): void {
    if (typeof localStorage !== 'undefined') {
      this.user.name = localStorage.getItem('name') || '';
      this.user.email = localStorage.getItem('email') || '';
      this.user.avatar = localStorage.getItem('avatar') || '';
    }
  }

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

  confirmLogout() {
    this.isMobileMenuOpen = false;
    this.showLogoutDialog = true;
  }

  cancelLogout() {
    this.showLogoutDialog = false;
  }

  logout() {
    this.showLogoutDialog = false;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('_id');
      localStorage.removeItem('name');
      localStorage.removeItem('email');
      localStorage.removeItem('role');
      localStorage.removeItem('avatar');
    }
    this.router.navigate(['/auth/login']);
  }
}
