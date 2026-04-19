import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { catchError, throwError } from 'rxjs';

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-courses.component.html',
  styleUrl: './my-courses.component.scss'
})
export class MyCoursesComponent implements OnInit {
  courses: any[] = [];
  availableCourses: any[] = [];
  isLoading = true;
  isLoadingAvailable = false;
  error: string | null = null;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.fetchEnrolledCourses();
    this.fetchAvailableCourses();
  }

  fetchEnrolledCourses() {
    this.isLoading = true;
    this.error = null;

    this.api.get<any>('web/user/course/enrolled').pipe(
      catchError(err => {
        this.isLoading = false;
        this.error = 'Failed to load your courses. Please try again later.';
        this.cdr.detectChanges();
        return throwError(() => err);
      })
    ).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && Array.isArray(res.data)) {
          this.courses = res.data.map((c: any) => ({
            id: c._id,
            title: c.name,
            instructor: c.instructorName || 'Dr. Sarah Mitchell',
            progress: c.progress || 0,
            image: c.thumbnail || 'images/article-1.jpg',
            lastAccessed: c.lastAccessed || 'Recently',
            totalLessons: c.totalLessons || 0,
            completedLessons: c.completedLessons || 0
          }));
        }
        this.cdr.detectChanges();
      }
    });
  }

  fetchAvailableCourses() {
    this.isLoadingAvailable = true;

    this.api.get<any>('web/user/course').pipe(
      catchError(() => {
        this.isLoadingAvailable = false;
        this.cdr.detectChanges();
        return throwError(() => null);
      })
    ).subscribe({
      next: (res) => {
        this.isLoadingAvailable = false;
        if (res.success && Array.isArray(res.data)) {
          // Filter out already enrolled courses (show only not enrolled)
          this.availableCourses = res.data
            .filter((c: any) => !c.isEnrolled)
            .map((c: any) => ({
              id: c._id,
              title: c.name,
              instructor: c.instructorName || 'Dr. Sarah Mitchell',
              price: this.formatPrice(c.price, c.currency),
              rawPrice: c.price,
              image: c.thumbnail || 'images/course-placeholder.jpg',
              features: c.features || []
            }));
        }
        this.cdr.detectChanges();
      }
    });
  }

  private formatPrice(price: any, currency: string): string {
    const amount = parseFloat(price);
    if (isNaN(amount)) return String(price);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  }
}
