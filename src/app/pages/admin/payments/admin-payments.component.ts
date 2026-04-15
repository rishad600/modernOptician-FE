import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, throwError, Subject, debounceTime, distinctUntilChanged } from 'rxjs';

interface PaymentStats {
  revenue: {
    total: number;
    growthPercentage: number;
  };
  successPayment: {
    total: number;
    growthPercentage: number;
  };
  pendingPayment: {
    total: number;
    todaysPending: number;
  };
}

interface PaymentTransaction {
  id: string;
  student: string;
  course: string;
  amount: string;
  date: string;
  status: string;
  method: string;
  dbId?: string;
}

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-payments.component.html',
  styleUrl: './admin-payments.component.scss'
})
export class AdminPaymentsComponent implements OnInit {
  protected readonly Math = Math;
  stats: PaymentStats | null = null;
  isLoadingStats = false;
  
  transactions: PaymentTransaction[] = [];
  isLoadingPayments = false;

  // Pagination & Filters
  currentPage = 1;
  pageSize = 20;
  totalCount = 0;
  searchTerm = '';
  statusFilter = '';

  private searchSubject = new Subject<string>();

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchStats();
    this.fetchPayments();

    // Setup search debouncing
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 1;
      this.fetchPayments();
    });
  }

  fetchStats() {
    this.isLoadingStats = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.api.get<any>('web/admin/payment/stats', new HttpParams(), headers).pipe(
      catchError(err => {
        console.error('Error fetching payment stats:', err);
        this.isLoadingStats = false;
        this.cdr.detectChanges();
        return throwError(() => err);
      })
    ).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.stats = res.data;
        }
        this.isLoadingStats = false;
        this.cdr.detectChanges();
      }
    });
  }

  fetchPayments() {
    this.isLoadingPayments = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    let params = new HttpParams()
      .set('page', this.currentPage.toString())
      .set('limit', this.pageSize.toString());

    if (this.searchTerm) params = params.set('search', this.searchTerm);
    if (this.statusFilter) params = params.set('status', this.statusFilter);

    this.api.get<any>('web/admin/payment/list', params, headers).pipe(
      catchError(err => {
        console.error('Error fetching payments:', err);
        this.isLoadingPayments = false;
        this.cdr.detectChanges();
        return throwError(() => err);
      })
    ).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.transactions = res.data.payments.map((p: any) => ({
            id: p.transactionId || 'N/A',
            dbId: p._id,
            student: `${p.student?.name || ''} ${p.student?.lastName || ''}`.trim() || 'Unknown Student',
            course: p.course?.name || 'N/A',
            amount: this.formatCurrency(p.amount),
            date: this.formatDate(p.date),
            status: p.status,
            method: p.student?.method || 'N/A'
          }));
          this.totalCount = res.data.totalCount || 0;
        }
        this.isLoadingPayments = false;
        this.cdr.detectChanges();
      }
    });

  }

  onSearch() {
    this.searchSubject.next(this.searchTerm);
  }

  onFilter() {
    this.currentPage = 1;
    this.fetchPayments();
  }

  nextPage() {
    if (this.currentPage * this.pageSize < this.totalCount) {
      this.currentPage++;
      this.fetchPayments();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchPayments();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize) || 1;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value || 0);
  }

  private formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  }

  getStatusClass(status: string): string {
    if (!status) return '';
    const s = status.toLowerCase();
    if (s === 'completed') return 'success';
    return s;
  }


  viewReceipt(id: string) {
    console.log('Viewing receipt for', id);
  }
}


