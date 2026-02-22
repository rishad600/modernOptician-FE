import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.scss'
})
export class CourseDetailComponent implements OnInit, OnDestroy {
  courseId: string | null = null;
  activeStatIndex: number = 0;
  private statsInterval: any;
  
  course = {
    title: 'Basic Optical Science',
    category: 'OPTICS',
    price: '$80.00',
    duration: '4.5 Hours',
    lessons: 12,
    rating: 4.8,
    reviews: 124,
    instructor: 'Dr. Sarah Mitchell',
    description: 'Master the fundamental principles of optics and lens science. This course covers everything from light physics to advanced frame selection techniques, specifically designed for aspiring and professional opticians.',
    image: 'images/article-1.jpg'
  };

  curriculum = [
    { title: 'Introduction to Lens Physics', duration: '15:00', isLocked: false },
    { title: 'The Anatomy of the Eye', duration: '25:00', isLocked: true },
    { title: 'Understanding Refractive Errors', duration: '20:00', isLocked: true },
    { title: 'Frame Materials & Selection', duration: '30:00', isLocked: true },
    { title: 'Patient Communication Basics', duration: '18:00', isLocked: true },
    { title: 'Final Certification Exam', duration: '45:00', isLocked: true }
  ];

  stats = [
    { label: 'Students', value: '1,248', icon: 'students' },
    { label: 'Average Rating', value: '4.8', icon: 'rating' },
    { label: 'Completion Rate', value: '92%', icon: 'completion' }
  ];

  testimonials = [
    {
      author: 'Emily Chen',
      role: 'Optometry Student',
      comment: 'This course was exactly what I needed. The video lessons are clear and very easy to follow.',
      avatar: 'images/testimonial-1.jpg'
    },
    {
      author: 'James Wilson',
      role: 'Junior Optician',
      comment: 'The clinical procedures section helped me gain confidence in my daily practice. Highly recommended!',
      avatar: 'images/testimonial-2.jpg'
    },
    {
      author: 'Sarah Johnson',
      role: 'Optical Assistant',
      comment: 'Great value for money. The lifetime access is a huge plus for reviewing complex topics later.',
      avatar: 'images/testimonial-3.jpg'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id');
    // In a real app, logic to fetch course details based on ID would go here

    this.startStatsCycle();
  }

  ngOnDestroy(): void {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
    }
  }

  private startStatsCycle(): void {
    this.statsInterval = setInterval(() => {
      this.activeStatIndex = (this.activeStatIndex + 1) % this.stats.length;
      this.cdr.detectChanges();
    }, 3000);
  }
}
