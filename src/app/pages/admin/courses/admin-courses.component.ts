import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-courses',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-courses.component.html',
  styleUrl: './admin-courses.component.scss'
})
export class AdminCoursesComponent {
  courses = [
    {
      id: '1',
      title: 'Advanced Optometry Masterclass',
      instructor: 'Dr. Sarah Wilson',
      price: '₹12,499',
      duration: '12h 45m',
      lessons: 24,
      students: 156,
      rating: 4.8,
      status: 'Published',
      image: '/images/FeatureCard-Image1.jpg'
    },
    {
      id: '2',
      title: 'Retail Management for Opticians',
      instructor: 'Robert Chen',
      price: '₹8,999',
      duration: '8h 20m',
      lessons: 15,
      students: 89,
      rating: 4.5,
      status: 'Published',
      image: '/images/FeatureCard-Image2.jpg'
    },
    {
      id: '3',
      title: 'Contact Lens Fitting & Care',
      instructor: 'Dr. Emily Brown',
      price: '₹10,500',
      duration: '10h 15m',
      lessons: 18,
      students: 64,
      rating: 4.9,
      status: 'Draft',
      image: '/images/FeatureCard-Image3.jpg'
    }
  ];

  stats = [
    { label: 'Total Courses', value: '42', icon: 'courses', color: 'purple' },
    { label: 'Active Students', value: '1,234', icon: 'students', color: 'blue' },
    { label: 'Avg. Rating', value: '4.7', icon: 'rating', color: 'orange' },
    { label: 'Total Revenue', value: '₹4,56,780', icon: 'revenue', color: 'green' }
  ];

  deleteCourse(id: string) {
    if (confirm('Are you sure you want to delete this course?')) {
      this.courses = this.courses.filter(c => c.id !== id);
    }
  }
}
