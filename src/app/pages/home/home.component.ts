import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestimonialsComponent } from './sections/testimonials/testimonials.component';
import { CourseCardComponent } from '../../shared/components/course-card/course-card.component';
import { ApiService } from '../../core/services/api.service';
import { catchError, throwError } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    TestimonialsComponent,
    CourseCardComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  @ViewChild('heroSection') heroSection!: ElementRef<HTMLElement>;
  
  showVideoModal = false;
  videoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4'; // Placeholder premium-looking video
  private observer: IntersectionObserver | null = null;
  plans: any[] = [];

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchCourses();
  }

  fetchCourses() {
    this.api.get<any>('web/public/course', new HttpParams()).pipe(
      catchError(err => {
        console.error('API Error fetching public courses:', err);
        return throwError(() => err);
      })
    ).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.plans = res.data.map((c: any) => ({
            id: c._id,
            title: c.name,
            price: this.formatPrice(c.price, c.currency),
            features: c.features || ['4 Video Chapters', 'Lens Physics & Optics', 'Frame Selection Basics', 'Lifetime Access'],
            image: c.thumbnail || 'images/article-1.jpg'
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

  openVideoModal() {
    this.showVideoModal = true;
    setTimeout(() => {
      if (this.videoPlayer) {
        this.videoPlayer.nativeElement.play();
      }
    }, 100);
  }

  closeVideoModal() {
    if (this.videoPlayer) {
      this.videoPlayer.nativeElement.pause();
    }
    this.showVideoModal = false;
  }

  private setupIntersectionObserver() {
    this.cleanupObserver();
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting && this.showVideoModal && this.videoPlayer) {
          this.videoPlayer.nativeElement.pause();
        }
      });
    }, { threshold: 0 }); // Trigger as soon as it leaves the viewport

    if (this.heroSection) {
      this.observer.observe(this.heroSection.nativeElement);
    }
  }

  private cleanupObserver() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  ngAfterViewInit() {
    this.setupIntersectionObserver();
  }

  ngOnDestroy() {
    this.cleanupObserver();
  }


  steps = [
    {
      number: '01',
      title: 'Register Your Account',
      description: 'Create your student profile in just a few clicks to get started.'
    },
    {
      number: '02',
      title: 'Choose Your Class',
      description: 'Select either a single class or the full comprehensive course.'
    },
    {
      number: '03',
      title: 'Start Learning',
      description: 'Pay securely and gain instant access to all included subjects.'
    }
  ];


  faqs = [
    { question: 'How many subjects are included in one class?', answer: '', isOpen: false },
    { question: 'Is this a subscription?', answer: 'No, we use a one-time payment model. Once you buy a class or the full course, you own it for life.', isOpen: true },
    { question: 'What payment methods accepted?', answer: '', isOpen: false },
    { question: 'Can I access the course anytime?', answer: '', isOpen: false }
  ];
}
