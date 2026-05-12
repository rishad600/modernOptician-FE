import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { PaymentService } from '../../core/services/payment.service';
import { ToastService } from '../../core/services/toast.service';
import { HttpParams } from '@angular/common/http';
import { catchError, throwError, finalize } from 'rxjs';

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

  course: any = {
    title: 'Loading...',
    instructor: '',
    duration: '',
    lessons: 0,
    price: '',
    rawPrice: 0,
    currency: 'USD',
    image: 'images/course-placeholder.jpg',
    description: '',
    features: [],
    isEnrolled: false
  };

  curriculum: any[] = [];
  testimonials: any[] = [];
  isLoading = true;
  error: string | null = null;

  // Purchase State
  isPurchasing = false;
  showPaymentModal = false;
  paypalClientId: string | null = null;

  // Video Preview State
  showVideoModal = false;
  safeVideoUrl: SafeResourceUrl | null = null;
  isFetchingVideo = false;
  videoError: string | null = null;

  stats = [
    { label: 'Students', value: '1,248', icon: 'students' },
    { label: 'Average Rating', value: '4.8', icon: 'rating' },
    { label: 'Completion Rate', value: '92%', icon: 'completion' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private paymentService: PaymentService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id');
    if (this.courseId) {
      this.fetchCourseDetails(this.courseId);
    }
    this.startStatsCycle();
  }

  fetchCourseDetails(id: string) {
    this.isLoading = true;

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role') || ''; // Handle null/empty

    // Determine endpoint based on role
    let endpoint: string;
    if (role === 'admin') {
      endpoint = `web/admin/course/${id}`;
    } else if (token && role === 'user') {
      endpoint = `web/user/course/${id}`;
    } else {
      // Empty role, guest, or other = use public API
      endpoint = `web/public/course/${id}`;
    }

    this.api.get<any>(endpoint, new HttpParams()).pipe(
      catchError(err => {
        this.isLoading = false;
        this.error = 'Failed to load course details. Please try again later.';
        this.cdr.detectChanges();
        return throwError(() => err);
      })
    ).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && res.data) {
          const data = res.data;
          const isAdmin = role === 'admin';
          const isUser = role === 'user';
          const isPublic = !isAdmin && !isUser; // Empty role or other

          this.course = {
            title: data.name,
            instructor: data.instructorName || 'Dr. Sarah Mitchell',
            duration: this.formatMinutes(data.totalDuration || 0),
            lessons: data.lessonsArray?.filter((l: any) => !l.isTrashed).length ?? data.lessons ?? 0,
            price: this.formatPrice(data.price, data.currency),
            rawPrice: data.price,
            currency: data.currency || 'USD',
            image: data.thumbnail || 'images/article-1.jpg',
            description: data.description,
            features: data.features || [],
            isEnrolled: isAdmin ? true : (data.isEnrolled || false), // Admin sees as enrolled
            isAdmin: isAdmin, // Flag to show admin view
            isPublic: isPublic // Flag to show public view (empty role)
          };

          this.curriculum = (data.lessonsArray || [])
            .filter((l: any) => !l.isTrashed && l.isPublished) // Only show published lessons
            .map((l: any) => ({
              id: l._id,
              title: l.title,
              duration: this.formatDuration(l.duration),
              isLocked: isAdmin ? false : (!l.isFreePreview && !this.course.isEnrolled), // Admin sees all unlocked
              isFreePreview: l.isFreePreview || false,
              bunnyVideoId: l.bunnyVideoId || null // For public video access check
            }));

          this.testimonials = (data.testimonials || []).map((t: any) => ({
            author: t.author,
            role: t.role,
            comment: t.comment,
            avatar: t.avatar || 'images/testimonial-placeholder.jpg'
          }));

          this.cdr.detectChanges();
        }
      }
    });
  }

  private formatPrice(price: any, currency: string): string {
    const amount = parseFloat(price);
    if (isNaN(amount)) return price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  }

  private formatMinutes(minutes: number): string {
    if (!minutes) return '0h 0m';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  private formatDuration(seconds: number): string {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
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

  // --- Purchase Logic ---

  purchaseCourse(): void {
    if (!this.courseId || this.isPurchasing || this.course.isEnrolled) return;

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      this.toast.info('Please log in to purchase this course');
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    this.showPaymentModal = true;
    this.initPaypal();
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.cdr.detectChanges();
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
      await this.paymentService.loadPaypalSdk(this.paypalClientId!, this.course.currency);
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
        return this.paymentService.createOrder(this.courseId!).toPromise();
      },
      onApprove: (data: any) => {
        this.isPurchasing = true;
        this.cdr.detectChanges();
        
        this.paymentService.captureOrder(data.orderID).pipe(
          finalize(() => {
            this.isPurchasing = false;
            this.cdr.detectChanges();
          })
        ).subscribe({
          next: () => {
            this.toast.success('Successfully enrolled in ' + this.course.title);
            this.closePaymentModal();
            this.course.isEnrolled = true;
            // Unlock all lessons
            this.curriculum = this.curriculum.map(l => ({
              ...l,
              isLocked: !l.isFreePreview
            }));
            this.cdr.detectChanges();
          },
          error: (err: any) => {
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

  // --- Video Preview Logic ---

  watchPreview(): void {
    // Find the first free preview lesson
    const firstFreeLesson = this.curriculum.find(item => item.isFreePreview);
    if (firstFreeLesson) {
      this.playLesson(firstFreeLesson.id);
    } else {
      this.toast.info('No free preview available for this course');
    }
  }

  playLesson(lessonId: string): void {
    if (this.isFetchingVideo) return;

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role') || ''; // Handle null/empty
    const isAdmin = role === 'admin';
    const isUser = role === 'user';
    const isPublic = !token || (!isAdmin && !isUser); // No token or empty role

    const lesson = this.curriculum.find(l => l.id === lessonId);
    if (!lesson) return;

    // For public users: check if lesson is accessible (free preview or has video)
    if (isPublic && lesson.isLocked && !lesson.bunnyVideoId) {
      this.toast.info('Please log in to watch this lesson');
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    // For logged in users: check if lesson is locked and not admin
    if (!isPublic && lesson.isLocked && !isAdmin) {
      this.toast.info('Please purchase the course to access this lesson');
      return;
    }

    this.isFetchingVideo = true;
    this.videoError = null;
    this.showVideoModal = true;
    this.safeVideoUrl = null;

    // Use appropriate API endpoint based on role
    let endpoint: string;
    if (isAdmin) {
      endpoint = `web/admin/course/play/${lessonId}`;
    } else if (isUser) {
      endpoint = `web/user/course/play-video/${lessonId}`;
    } else {
      // Public user (no token or empty role) = use public play API
      endpoint = `web/public/course/play/${lessonId}`;
    }

    this.api.get<any>(endpoint).subscribe({
      next: (res) => {
        this.isFetchingVideo = false;
        if (res.success && res.data?.playUrl) {
          this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(res.data.playUrl);
        } else {
          this.videoError = res.message || 'Failed to generate playback URL.';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isFetchingVideo = false;
        if (err.status === 403) {
          this.videoError = 'Purchase Required: This lesson is not available for free preview.';
          this.toast.info('Please purchase the course to access this lesson.');
        } else {
          this.videoError = err?.message || 'Error occurred while fetching video.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  closeVideoModal(): void {
    this.showVideoModal = false;
    this.safeVideoUrl = null;
    this.videoError = null;
    this.cdr.detectChanges();
  }
}
