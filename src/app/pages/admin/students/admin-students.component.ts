import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, throwError, Subject, debounceTime, distinctUntilChanged } from 'rxjs';

interface StudentStats {
  totalStudents: number;
  totalStudentsThisWeek: number;
  activeStudents: number;
  activeStudentsGrowth: number;
  completions: number;
  completionsGrowth: number;
}

@Component({
  selector: 'app-admin-students',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-students.component.html',
  styleUrl: './admin-students.component.scss'
})
export class AdminStudentsComponent implements OnInit {
  protected readonly Math = Math;
  students: any[] = [];
  stats: StudentStats | null = null;
  
  // Pagination & Filters
  currentPage = 1;
  pageSize = 20;
  totalCount = 0;
  searchTerm = '';
  statusFilter = '';
  isLoading = false;
  showDeleteModal = false;
  studentToDeleteId: string | null = null;

  private searchSubject = new Subject<string>();

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchStats();
    this.fetchStudents();

    // Setup search debouncing
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 1;
      this.fetchStudents();
    });
  }

  fetchStudents() {
    this.isLoading = true;
    this.students = [];
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    let params = new HttpParams()
      .set('page', this.currentPage.toString())
      .set('limit', this.pageSize.toString());

    if (this.searchTerm) params = params.set('search', this.searchTerm);
    if (this.statusFilter) params = params.set('status', this.statusFilter);

    this.api.get<any>(`web/admin/student/`, params, headers).pipe(
      catchError(err => {
        console.error('Error fetching students:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
        return throwError(() => err);
      })
    ).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.users) {
          this.students = res.data.users.map((u: any) => ({
            id: u.studentId,
            dbId: u._id,
            name: `${u.student.name} ${u.student.lastName}`,
            email: u.student.email,
            joined: this.formatDate(u.joined),
            courses: u.courses || 0,
            spent: this.formatCurrency(u.totalSpent),
            status: u.status || 'Inactive',
            avatar: this.getInitials(`${u.student.name} ${u.student.lastName}`)
          }));
          this.totalCount = res.data.totalCount || 0;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch() {
    this.searchSubject.next(this.searchTerm);
  }

  onFilter() {
    this.currentPage = 1;
    this.fetchStudents();
  }

  nextPage() {
    if (this.currentPage * this.pageSize < this.totalCount) {
      this.currentPage++;
      this.fetchStudents();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchStudents();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize) || 1;
  }

  private formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  private getInitials(name: string): string {
    if (!name) return '??';
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  fetchStats() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.api.get<any>(`web/admin/student/stats`, new HttpParams(), headers).pipe(
      catchError(err => {
        console.error('Error fetching student stats:', err);
        return throwError(() => err);
      })
    ).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.stats = res.data;
          this.cdr.detectChanges();
        }
      }
    });
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  viewDetails(id: string) {
    this.router.navigate(['/admin/students', id]);
  }

  openDeleteModal(id: string) {
    this.studentToDeleteId = id;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.studentToDeleteId = null;
  }

  confirmDelete() {
    if (!this.studentToDeleteId) return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.api.delete<any>(`web/admin/student/${this.studentToDeleteId}`, headers).subscribe({
      next: (res) => {
        if (res.success) {
          this.students = this.students.filter(s => s.dbId !== this.studentToDeleteId);
          this.totalCount--;
          this.closeDeleteModal();
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error deleting student:', err);
      }
    });
  }
}
