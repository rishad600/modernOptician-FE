import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboardComponent {
  revenueData = [
    { month: 'Jan', amount: 45000 },
    { month: 'Feb', amount: 52000 },
    { month: 'Mar', amount: 48000 },
    { month: 'Apr', amount: 61000 },
    { month: 'May', amount: 55000 },
    { month: 'Jun', amount: 67000 },
  ];

  enrollmentData = [
    { course: 'Optometry', count: 120 },
    { course: 'Retail Mgmt', count: 85 },
    { course: 'Contact Lens', count: 65 },
    { course: 'Dispensing', count: 40 },
  ];

  stats = [
    { label: 'Total Students', value: '1,234', icon: 'students', trend: '+12%' },
    { label: 'Total Revenue', value: '$45,678', icon: 'revenue', trend: '+8%' },
    { label: 'Active Courses', value: '42', icon: 'courses', trend: '+3%' },
    { label: 'Recent Enrollments', value: '156', icon: 'enrollments', trend: '+15%' },
  ];

  recentActivities = [
    { type: 'payment', message: 'New payment received from John Doe', time: '2 mins ago' },
    { type: 'enrollment', message: 'Sarah Smith enrolled in Web Development 101', time: '15 mins ago' },
    { type: 'payment', message: 'Payment of $80 confirmed for Course B', time: '1 hour ago' },
    { type: 'enrollment', message: 'Mike Jones joined the "Modern Optician" masterclass', time: '3 hours ago' },
  ];
}
