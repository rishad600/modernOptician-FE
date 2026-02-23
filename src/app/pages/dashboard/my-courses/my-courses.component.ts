import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-courses.component.html',
  styleUrl: './my-courses.component.scss'
})
export class MyCoursesComponent {
  courses = [
    {
      id: 1,
      title: 'Basic Optical Science',
      instructor: 'Dr. Sarah Wilson',
      progress: 45,
      image: 'images/article-1.jpg',
      lastAccessed: '2 days ago'
    },
    {
      id: 2,
      title: 'Modern Lens Technology',
      instructor: 'James Miller',
      progress: 10,
      image: 'images/article-1.jpg',
      lastAccessed: '1 week ago'
    }
  ];
}
