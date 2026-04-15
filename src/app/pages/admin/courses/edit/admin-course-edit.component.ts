import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../../../core/services/toast.service';

declare var tus: any;

@Component({
  selector: 'app-admin-course-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-course-edit.component.html',
  styleUrl: './admin-course-edit.component.scss'
})
export class AdminCourseEditComponent implements OnInit {
  courseForm: FormGroup;
  isEditMode = false;
  courseId: string | null = null;
  Math = Math;

  // Video Preview State
  showVideoModal = false;
  safeVideoUrl: SafeResourceUrl | null = null;
  isLoadingPreview = false;

  // Delete Confirmation Modal State
  showDeleteModal = false;
  itemToDeleteIndex: number | null = null;
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private toastService: ToastService
  ) {
    this.courseForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      instructor: ['Dr. Sarah Wilson', Validators.required],
      category: ['Optometry', Validators.required],
      price: ['', Validators.required],
      duration: [''],
      lessons: [0],
      description: ['', Validators.required],
      status: ['Published', Validators.required],
      image: ['images/course-placeholder.jpg'],
      curriculum: this.fb.array([]),
      testimonials: this.fb.array([]),
      features: this.fb.array([])
    });
  }

  get curriculum(): FormArray {
    return this.courseForm.get('curriculum') as FormArray;
  }

  get testimonials(): FormArray {
    return this.courseForm.get('testimonials') as FormArray;
  }

  get features(): FormArray {
    return this.courseForm.get('features') as FormArray;
  }

  addCurriculumItem() {
    const item = this.fb.group({
      _id: [null],
      title: ['', Validators.required],
      description: [''],
      duration: [''],
      type: ['video', Validators.required],
      file: [''],
      videoFile: [null], // Store the actual File object
      bunnyVideoId: [null],
      videoStatus: [null], // Server-side video status
      uploadProgress: [0],
      isUploading: [false],
      isFreePreview: [false],
      isSaving: [false],
      isDeleting: [false]
    });
    this.curriculum.push(item);
  }

  removeCurriculumItem(index: number) {
    const lessonGroup = this.curriculum.at(index) as FormGroup;
    const lessonId = lessonGroup.get('_id')?.value;

    if (!lessonId) {
      // For unsaved lessons, just remove from UI
      this.curriculum.removeAt(index);
      return;
    }

    // Show custom confirmation modal instead of confirm()
    this.itemToDeleteIndex = index;
    this.showDeleteModal = true;
    this.cdr.detectChanges();
  }

  confirmDelete() {
    if (this.itemToDeleteIndex === null) return;
    
    const index = this.itemToDeleteIndex;
    const lessonGroup = this.curriculum.at(index) as FormGroup;
    const lessonId = lessonGroup.get('_id')?.value;
    const bunnyVideoId = lessonGroup.get('bunnyVideoId')?.value;

    this.showDeleteModal = false;
    lessonGroup.patchValue({ isDeleting: true });
    
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // 1. Delete video from Bunny if exists
    if (bunnyVideoId) {
      this.api.delete<any>(`web/admin/course/delete-video/${bunnyVideoId}`, headers).subscribe({
        next: (res) => {
          console.log('Associated video deleted from Bunny');
          if (res.success) {
            this.toastService.success(res.message || 'Video deleted successfully');
          }
        },
        error: (err) => console.error('Failed to delete video from Bunny:', err)
      });
    }

    // 2. Trash the lesson in DB
    this.api.patch<any>(`web/admin/course/trash-lesson/${lessonId}`, { isTrashed: true }, headers).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.success(res.message || 'Lesson trashed successfully');
          this.curriculum.removeAt(index);
          this.itemToDeleteIndex = null;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        lessonGroup.patchValue({ isDeleting: false });
        this.itemToDeleteIndex = null;
        console.error('Error trashing lesson:', err);
        this.toastService.error('Failed to delete lesson. Please try again.');
      }
    });
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.itemToDeleteIndex = null;
    this.cdr.detectChanges();
  }

  addTestimonial() {
    const item = this.fb.group({
      author: [''],
      role: ['Student'],
      comment: ['']
    });
    this.testimonials.push(item);
  }

  removeTestimonial(index: number) {
    this.testimonials.removeAt(index);
  }

  addFeature() {
    this.features.push(this.fb.control(''));
  }

  removeFeature(index: number) {
    this.features.removeAt(index);
  }

  ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('id');
    if (this.courseId) {
      this.isEditMode = true;
      this.loadCourseData(this.courseId);
    } else {
      // Don't auto-add to avoid blocking form submission with required empty fields
    }
  }

  loadCourseData(id: string) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.api.get<any>(`web/admin/course/${id}`, new HttpParams(), headers).pipe(
      catchError(err => {
        console.error('Error fetching course:', err);
        return throwError(() => err);
      })
    ).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const data = res.data;
          
          this.courseForm.patchValue({
            title: data.name,
            instructor: data.instructorName || 'Dr. Sarah Wilson',
            category: data.category || 'Optometry',
            price: data.price,
            duration: this.formatMinutes(data.totalDuration || 0),
            lessons: data.lessons || 0,
            description: data.description,
            status: data.status || 'Published',
            image: data.thumbnail || 'images/course-placeholder.jpg'
          });

          // Handle Curriculum
          while (this.curriculum.length) { this.curriculum.removeAt(0); }
          if (data.lessonsArray && Array.isArray(data.lessonsArray)) {
            data.lessonsArray.forEach((item: any) => {
              this.curriculum.push(this.fb.group({
                _id: [item._id],
                title: [item.title, Validators.required],
                description: [item.description || ''],
                duration: [item.duration || 0],
                type: [item.type || 'video', Validators.required],
                file: [item.file || ''],
                bunnyVideoId: [item.bunnyVideoId || null],
                videoStatus: [item.videoStatus || null],
                isFreePreview: [item.isFreePreview || false],
                isSaving: [false],
                isDeleting: [false]
              }));
            });
          } else {
            this.addCurriculumItem();
          }

          // Handle Testimonials
          while (this.testimonials.length) { this.testimonials.removeAt(0); }
          if (data.testimonials && Array.isArray(data.testimonials)) {
            data.testimonials.forEach((item: any) => {
              this.testimonials.push(this.fb.group({
                author: [item.author, Validators.required],
                role: [item.role || 'Student', Validators.required],
                comment: [item.comment, Validators.required]
              }));
            });
          } else {
            this.addTestimonial();
          }

          // Handle Features
          while (this.features.length) { this.features.removeAt(0); }
          if (data.features && Array.isArray(data.features)) {
            data.features.forEach((f: string) => this.features.push(this.fb.control(f, Validators.required)));
          }

          this.cdr.detectChanges();
        }
      }
    });
  }

  private formatMinutes(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  }

  onFileSelected(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      this.curriculum.at(index).patchValue({ 
        file: file.name,
        videoFile: file // Save the file object for TUS upload
      });
    }
  }

  onThumbnailSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.courseForm.patchValue({ image: URL.createObjectURL(file) });
    }
  }

  onSubmit() {
    if (this.courseForm.invalid) {
      this.courseForm.markAllAsTouched();
      // Also mark form arrays
      this.curriculum.controls.forEach(c => c.markAllAsTouched());
      this.testimonials.controls.forEach(c => c.markAllAsTouched());
      this.features.controls.forEach(c => c.markAllAsTouched());
      return;
    }

    if (this.courseForm.valid) {
      const formValue = this.courseForm.value;
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      const payload = {
        name: formValue.title,
        description: formValue.description,
        thumbnail: formValue.image || 'https://images.unsplash.com/photo-1574482620826-40685ca5ebe2?auto=format&fit=crop&q=80&w=800',
        price: parseFloat(formValue.price),
        category: formValue.category,
        instructorName: formValue.instructor,
        status: formValue.status,
        features: formValue.features
      };

      const request = this.isEditMode
        ? this.api.put<any>(`web/admin/course/${this.courseId}`, payload, headers)
        : this.api.post<any>(`web/admin/course/create`, payload, headers);

      request.subscribe({
        next: (res) => {
          if (res.success) {
            this.router.navigate(['/admin/courses']);
          }
        },
        error: (err) => {
          console.error('Error saving course:', err);
        }
      });
    } else {
      this.courseForm.markAllAsTouched();
    }
  }

  saveLesson(index: number) {
    const lessonGroup = this.curriculum.at(index) as FormGroup;
    if (lessonGroup.invalid) {
      lessonGroup.markAllAsTouched();
      return;
    }

    if (!this.courseId) {
      alert('Please save the course basics first before adding lessons.');
      return;
    }

    lessonGroup.patchValue({ isSaving: true });
    
    const val = lessonGroup.value;
    const payload = {
      courseId: this.courseId,
      title: val.title,
      description: val.description || val.title,
      order: index + 1,
      isFreePreview: val.isFreePreview || false,
      duration: this.parseDurationToSeconds(val.duration)
    };

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.api.post<any>('web/admin/course/add-lesson', payload, headers).subscribe({
      next: (res) => {
        if (res.success) {
          const lessonData = res.data;
          lessonGroup.patchValue({ 
            isSaving: false, 
            _id: lessonData?._id || 'saved' 
          });

          // Chain video upload preparation if it's a video lesson
          if (val.type === 'video' && lessonData?._id) {
            this.prepareLessonVideo(this.courseId!, lessonData._id, headers, index);
          }
        }
      },
      error: (err) => {
        lessonGroup.patchValue({ isSaving: false });
        console.error('Error adding lesson:', err);
      }
    });
  }

  private prepareLessonVideo(courseId: string, lessonId: string, headers: HttpHeaders, index: number) {
    const payload = { courseId, lessonId };
    
    this.api.post<any>('web/admin/course/prepare-video-upload', payload, headers).subscribe({
      next: (res) => {
        if (res.success) {
          console.log('Video upload prepared:', res.data);
          this.startTusUpload(index, res.data);
        }
      },
      error: (err) => {
        console.error('Error preparing video upload:', err);
      }
    });
  }

  private startTusUpload(index: number, uploadData: any) {
    const lessonGroup = this.curriculum.at(index) as FormGroup;
    
    if (!lessonGroup) {
      console.error('Lesson group not found at index:', index);
      return;
    }

    const file = lessonGroup.get('videoFile')?.value;

    if (!file) {
      console.error('No file selected for video lesson');
      this.cdr.detectChanges();
      return;
    }

    lessonGroup.patchValue({ isUploading: true, uploadProgress: 0 });

    const upload = new tus.Upload(file, {
      endpoint: uploadData.tusEndpoint,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        AuthorizationSignature: uploadData.signature,
        AuthorizationExpire: uploadData.expirationTime,
        VideoId: uploadData.videoId,
        LibraryId: uploadData.libraryId
      },
      metadata: {
        filetype: file.type,
        title: file.name
      },
      onError: (error: any) => {
        console.error('Failed because: ' + error);
        lessonGroup.patchValue({ isUploading: false });
      },
      onProgress: (bytesUploaded: number, bytesTotal: number) => {
        const percentage = Math.round((bytesUploaded / bytesTotal) * 100);
        lessonGroup.patchValue({ uploadProgress: percentage });
        this.cdr.detectChanges();
      },
      onSuccess: () => {
        console.log('Download %s from %s', upload.file.name, upload.url);
        lessonGroup.patchValue({ isUploading: false, uploadProgress: 100 });
        this.cdr.detectChanges();
        // Refresh to see updated video status if needed
        setTimeout(() => this.loadCourseData(this.courseId!), 2000);
      }
    });

    upload.start();
  }

  private parseDurationToSeconds(duration: any): number {
    if (typeof duration === 'number') return duration;
    const match = String(duration).match(/(\d+)m/);
    if (match) return parseInt(match[1]) * 60;
    return parseInt(duration) || 0;
  }

  private parseDuration(durationStr: string): number {
    const match = durationStr.match(/(\d+)h\s*(\d+)m/);
    if (match) {
      return parseInt(match[1]) * 60 + parseInt(match[2]);
    }
    return 0;
  }

  // --- Video Preview Methods ---
  
  previewLesson(index: number) {
    const lesson = this.curriculum.at(index);
    const lessonId = lesson.get('_id')?.value;
    
    if (!lessonId) {
      alert('Please save the lesson first before previewing.');
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.isLoadingPreview = true;
    this.api.get<any>(`web/admin/course/play/${lessonId}`, new HttpParams(), headers).subscribe({
      next: (res) => {
        this.isLoadingPreview = false;
        if (res.success && res.data?.playUrl) {
          this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(res.data.playUrl);
          this.showVideoModal = true;
          this.cdr.detectChanges();
        } else if (res.code === 206) {
          alert(res.message || 'Video is not ready for playback yet.');
        }
      },
      error: (err) => {
        this.isLoadingPreview = false;
        console.error('Error fetching playback URL:', err);
        alert('Failed to load video player. Please try again.');
        this.cdr.detectChanges();
      }
    });
  }

  closeVideoModal() {
    this.showVideoModal = false;
    this.safeVideoUrl = null;
    this.cdr.detectChanges();
  }
}
