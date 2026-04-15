import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { HttpParams } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

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
    image: 'images/course-placeholder.jpg',
    description: '',
    features: []
  };

  curriculum: any[] = [];
  testimonials: any[] = [];
  isLoading = true;
  error: string | null = null;

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
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
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
    this.api.get<any>(`web/public/course/${id}`, new HttpParams()).pipe(
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
          this.course = {
            title: data.name,
            instructor: data.instructorName || 'Dr. Sarah Mitchell',
            duration: this.formatMinutes(data.totalDuration || 0),
            lessons: data.lessonsArray?.length || data.lessons || 0,
            price: this.formatPrice(data.price, data.currency),
            image: data.thumbnail || 'images/article-1.jpg',
            description: data.description,
            features: data.features || []
          };

          this.curriculum = (data.lessonsArray || []).map((l: any) => ({
            id: l._id,
            title: l.title,
            duration: this.formatDuration(l.duration),
            isLocked: !l.isFreePreview
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

  // --- Video Preview Logic ---

  watchPreview(): void {
    // Find the first free preview lesson
    const firstFreeLesson = this.curriculum.find(item => !item.isLocked);
    if (firstFreeLesson) {
      this.playLesson(firstFreeLesson.id);
    } else {
      // Potentially show a message that no preview is available
      console.log('No free preview lessons available for this course.');
    }
  }

  playLesson(lessonId: string): void {
    if (this.isFetchingVideo) return;

    this.isFetchingVideo = true;
    this.videoError = null;
    this.showVideoModal = true;
    this.safeVideoUrl = null;

    this.api.get<any>(`web/public/course/play/${lessonId}`).subscribe({
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
        this.videoError = err.message || 'Error occurred while fetching video.';
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
