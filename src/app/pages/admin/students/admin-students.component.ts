import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-students',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-students.component.html',
  styleUrl: './admin-students.component.scss'
})
export class AdminStudentsComponent implements OnInit {
  students = [
    {
      id: 'STU-001',
      name: 'Alex Johnson',
      email: 'alex.j@example.com',
      joined: 'Jan 15, 2026',
      courses: 3,
      spent: '₹35,497',
      status: 'Active',
      avatar: 'AJ'
    },
    {
      id: 'STU-002',
      name: 'Maria Garcia',
      email: 'm.garcia@example.com',
      joined: 'Feb 10, 2026',
      courses: 1,
      spent: '₹10,500',
      status: 'Active',
      avatar: 'MG'
    },
    {
      id: 'STU-003',
      name: 'Robert Wilson',
      email: 'robert.w@example.com',
      joined: 'Mar 05, 2026',
      courses: 2,
      spent: '₹18,999',
      status: 'Inactive',
      avatar: 'RW'
    },
    {
      id: 'STU-004',
      name: 'Sarah Brown',
      email: 'sarah.b@example.com',
      joined: 'Mar 12, 2026',
      courses: 4,
      spent: '₹42,999',
      status: 'Active',
      avatar: 'SB'
    }
  ];

  constructor() {}

  ngOnInit(): void {}

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  viewDetails(id: string) {
    console.log('Viewing details for', id);
  }
}
