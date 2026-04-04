import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

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

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
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
      title: [''],
      duration: [''],
      type: ['video', Validators.required],
      file: ['']
    });
    this.curriculum.push(item);
  }

  removeCurriculumItem(index: number) {
    this.curriculum.removeAt(index);
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
          if (data.curriculum && Array.isArray(data.curriculum)) {
            data.curriculum.forEach((item: any) => {
              this.curriculum.push(this.fb.group({
                title: [item.title, Validators.required],
                duration: [item.duration, Validators.required],
                type: [item.type, Validators.required],
                file: [item.file || '']
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
      this.curriculum.at(index).patchValue({ file: file.name });
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

  private parseDuration(durationStr: string): number {
    const match = durationStr.match(/(\d+)h\s*(\d+)m/);
    if (match) {
      return parseInt(match[1]) * 60 + parseInt(match[2]);
    }
    return 0;
  }
}
