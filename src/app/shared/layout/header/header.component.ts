import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  isLoggedIn = false;
  isAdmin = false;
  private checkInterval: any;

  ngOnInit(): void {
    this.checkLoginStatus();
    // Check login status periodically to catch login/logout changes
    this.checkInterval = setInterval(() => {
      this.checkLoginStatus();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  checkLoginStatus(): void {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    this.isLoggedIn = !!token;
    this.isAdmin = role === 'admin';
  }

  getDashboardLink(): string {
    return this.isAdmin ? '/admin/dashboard' : '/dashboard/my-courses';
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }
}
