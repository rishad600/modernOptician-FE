import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { PaymentService } from '../../../core/services/payment.service';
import { ToastService } from '../../../core/services/toast.service';
import { catchError, throwError, finalize } from 'rxjs';

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

  // Payment state
  showPaymentModal = false;
  selectedCourse: any = null;
  isProcessingPayment = false;
  paypalClientId: string | null = null;

  constructor(
    private api: ApiService,
    private paymentService: PaymentService,
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
        const enrolledData = res.data?.courses || (Array.isArray(res.data) ? res.data : []);
        
        if (res.success && Array.isArray(enrolledData)) {
          this.courses = enrolledData.map((c: any) => ({
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
        const availableData = res.data?.courses || (Array.isArray(res.data) ? res.data : []);

        if (res.success && Array.isArray(availableData)) {
          this.availableCourses = availableData
            .filter((c: any) => !c.isEnrolled)
            .map((c: any) => ({
              id: c._id,
              title: c.name,
              instructor: c.instructorName || 'Dr. Sarah Mitchell',
              price: this.formatPrice(c.price, c.currency),
              rawPrice: c.price,
              currency: c.currency || 'USD',
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

  // --- Payment Logic ---

  openEnrollment(course: any) {
    this.selectedCourse = course;
    this.showPaymentModal = true;
    this.initPaypal();
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.selectedCourse = null;
  }

  async initPaypal() {
    if (!this.paypalClientId) {
      try {
        const config = await this.paymentService.getPaypalConfig().toPromise();
        this.paypalClientId = config.clientId;
      } catch (err) {
        this.toast.error('Failed to load PayPal configuration');
        return;
      }
    }

    try {
      await this.paymentService.loadPaypalSdk(this.paypalClientId!, this.selectedCourse.currency);
      this.renderPaypalButtons();
    } catch (err) {
      this.toast.error('Failed to load PayPal SDK');
    }
  }

  renderPaypalButtons() {
    const container = document.getElementById('paypal-button-container');
    if (!container) return;

    container.innerHTML = '';
    (window as any).paypal.Buttons({
      createOrder: () => {
        return this.paymentService.createOrder(this.selectedCourse.id).toPromise();
      },
      onApprove: (data: any) => {
        this.isProcessingPayment = true;
        this.cdr.detectChanges();
        
        this.paymentService.captureOrder(data.orderID).pipe(
          finalize(() => {
            this.isProcessingPayment = false;
            this.cdr.detectChanges();
          })
        ).subscribe({
          next: () => {
            this.toast.success('Successfully enrolled in ' + this.selectedCourse.title);
            this.closePaymentModal();
            this.fetchEnrolledCourses();
            this.fetchAvailableCourses();
          },
          error: (err) => {
            this.toast.error(err.message || 'Payment capture failed');
          }
        });
      },
      onCancel: () => {
        this.toast.info('Payment cancelled');
      },
      onError: (err: any) => {
        this.toast.error('PayPal Error: ' + (err?.message || 'Unknown error'));
      }
    }).render('#paypal-button-container');
  }
}
