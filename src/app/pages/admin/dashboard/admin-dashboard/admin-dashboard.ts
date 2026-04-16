import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboardComponent implements OnInit {
  protected readonly Math = Math;
  isLoading = false;
  
  revenueData: any[] = [];
  enrollmentData: any[] = [];
  stats: any[] = [];
  recentActivities: any[] = [];
  totalRevenueAmount = 0;

  // Filters
  selectedCategory = 'Optometry';
  selectedPeriod = '6_months';
  
  categories = ['Optometry', 'Dispensing', 'Contact Lens', 'General'];
  periods = [
    { value: '7_days', label: 'Last 7 Days' },
    { value: '30_days', label: 'Last 30 Days' },
    { value: '6_months', label: 'Last 6 Months' }
  ];

  constructor(
    private router: Router,
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  onFilterChange() {
    this.fetchDashboardData(this.selectedCategory);
  }

  fetchDashboardData(category: string = this.selectedCategory) {
    this.isLoading = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Determine startDate based on period
    let startDate = '2026-03-07T01:17:15.411Z'; // Default
    const now = new Date();
    if (this.selectedPeriod === '7_days') {
      now.setDate(now.getDate() - 7);
      startDate = now.toISOString();
    } else if (this.selectedPeriod === '30_days') {
      now.setDate(now.getDate() - 30);
      startDate = now.toISOString();
    } else if (this.selectedPeriod === '6_months') {
      now.setMonth(now.getMonth() - 6);
      startDate = now.toISOString();
    }

    const params = new HttpParams()
      .set('category', category)
      .set('startDate', startDate);

    this.api.get<any>('web/admin/dashboard', params, headers).pipe(
      catchError(err => {
        console.error('Error fetching dashboard data:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
        return throwError(() => err);
      })
    ).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const d = res.data;
          
          this.stats = [
            { label: 'Total Students', value: (d.overview.totalStudents?.value || 0).toLocaleString(), icon: 'students', trend: `+${d.overview.totalStudents?.growth || 0}%` },
            { label: 'Total Revenue', value: this.formatCurrency(d.overview.totalRevenue?.value || 0), icon: 'revenue', trend: `+${d.overview.totalRevenue?.growth || 0}%` },
            { label: 'Active Courses', value: (d.overview.activeCourses?.value || 0).toString(), icon: 'courses', trend: `+${d.overview.activeCourses?.growth || 0}%` },
            { label: 'Recent Enrollments', value: (d.overview.recentEnrollments?.value || 0).toString(), icon: 'enrollments', trend: `+${d.overview.recentEnrollments?.growth || 0}%` },
          ];

          this.revenueData = d.revenueTrend.map((item: any) => ({
            month: item.month,
            amount: item.total
          }));
          this.totalRevenueAmount = d.overview.totalRevenue?.value || 0;

          this.enrollmentData = d.enrollmentBreakdown.map((item: any) => ({
            course: item.category,
            count: item.count
          }));

          this.recentActivities = d.recentActivities.map((item: any) => ({
            type: item.type,
            message: item.message,
            time: this.formatTimeAgo(item.createdAt)
          }));
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get revenuePath(): string {
    if (!this.revenueData || this.revenueData.length < 2) return '';
    const maxAmount = Math.max(...this.revenueData.map(d => d.amount), 1);
    const width = 500;
    const height = 150;
    const padding = 20;

    const points = this.revenueData.map((d, i) => {
      const x = i * (width / (this.revenueData.length - 1));
      const y = height - (d.amount / maxAmount) * (height - padding * 2) - padding;
      return `${x},${y}`;
    });

    return `M${points.join(' L')}`;
  }

  get chartPoints() {
    if (!this.revenueData || this.revenueData.length === 0) return [];
    const maxAmount = Math.max(...this.revenueData.map(d => d.amount), 1);
    const width = 500;
    const height = 150;
    const padding = 20;

    return this.revenueData.map((d, i) => ({
      cx: i * (width / (this.revenueData.length - 1)),
      cy: height - (d.amount / maxAmount) * (height - padding * 2) - padding
    }));
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  logout() {
    localStorage.removeItem('email');
    localStorage.removeItem('name');
    localStorage.removeItem('role');
    localStorage.removeItem('token');

    this.router.navigate(['/auth/admin-login']);
  }
}

