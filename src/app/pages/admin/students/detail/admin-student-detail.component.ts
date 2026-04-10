import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

interface StudentDetail {
  _id: string;
  student: {
    name: string;
    lastName: string;
    email: string;
    mobile?: string;
  };
  studentId: string;
  joined: string;
  status: string;
  courses: number;
  totalSpent: number;
  enrolledCourses?: {
    courseId: string;
    courseName: string;
    amountPaid: number;
    enrolledAt: string;
    paymentStatus: string;
    isCompleted: boolean;
    completedAt: string | null;
  }[];
}

@Component({
  selector: 'app-admin-student-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-student-detail.component.html',
  styleUrl: './admin-student-detail.component.scss'
})
export class AdminStudentDetailComponent implements OnInit {
  student: StudentDetail | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchStudentDetail(id);
    } else {
      this.error = 'No student ID provided';
      this.isLoading = false;
    }
  }

  fetchStudentDetail(id: string) {
    this.isLoading = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.api.get<any>(`web/admin/student/${id}`, new HttpParams(), headers).pipe(
      catchError(err => {
        console.error('Error fetching student detail:', err);
        this.error = 'Failed to load student details. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
        return throwError(() => err);
      })
    ).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.student = res.data;
          // In case enrolled courses are not in the top level, we might need to adjust
          // For now assuming the structure matches the list item but with more details
        } else {
          this.error = res.message || 'Student not found';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getInitials(name: string, lastName: string): string {
    return `${name[0]}${lastName[0]}`.toUpperCase();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  goBack() {
    this.router.navigate(['/admin/students']);
  }
}
