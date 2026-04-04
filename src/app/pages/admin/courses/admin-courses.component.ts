import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

@Component({
  selector: 'app-admin-courses',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-courses.component.html',
  styleUrl: './admin-courses.component.scss'
})
export class AdminCoursesComponent implements OnInit {
  courses: any[] = [];
  filteredCourses: any[] = [];
  searchTerm: string = '';
  showDeleteModal: boolean = false;
  courseToDeleteId: string | null = null;

  constructor(
    private api: ApiService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchCourses();
  }

  fetchCourses() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.api.get<any>(`web/admin/course`, new HttpParams(), headers).pipe(
      catchError(err => {
        console.error('API Error fetching admin courses:', err);
        return throwError(() => err);
      })
    ).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.courses = res.data.map((c: any) => ({
            id: c._id,
            title: c.name,
            instructor: c.instructorName || 'Dr. Sarah Wilson',
            price: `${c.currency || 'USD'} ${c.price}`,
            duration: this.formatDuration(c.totalDuration),
            lessons: c.lessons || 0,
            students: 0, // Not in API currently
            rating: parseFloat(c.rating || '0'),
            status: c.status || 'Draft',
            image: c.thumbnail || 'images/course-placeholder.jpg'
          }));
          this.applyFilters();
          this.cdr.detectChanges();
        }
      }
    });
  }

  applyFilters() {
    this.filteredCourses = this.courses.filter(course => {
      const search = this.searchTerm.toLowerCase();
      return course.title.toLowerCase().includes(search) || 
             course.instructor.toLowerCase().includes(search);
    });
    this.cdr.detectChanges();
  }

  private formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  }

  deleteCourse(id: string) {
    this.courseToDeleteId = id;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.courseToDeleteId = null;
  }

  confirmDelete() {
    if (!this.courseToDeleteId) return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.api.delete<any>(`web/admin/course/${this.courseToDeleteId}`, headers).subscribe({
      next: (res) => {
        if (res.success) {
          // Remove from local arrays
          this.courses = this.courses.filter(c => c.id !== this.courseToDeleteId);
          this.applyFilters();
          this.closeDeleteModal();
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error deleting course:', err);
        this.closeDeleteModal();
      }
    });
  }
}
