import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

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
    private router: Router
  ) {
    this.courseForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      instructor: ['', Validators.required],
      price: ['', Validators.required],
      duration: ['', Validators.required],
      lessons: [0, [Validators.required, Validators.min(1)]],
      description: ['', Validators.required],
      status: ['Draft', Validators.required],
      image: ['/images/FeatureCard-Image1.jpg'],
      curriculum: this.fb.array([]),
      testimonials: this.fb.array([])
    });
  }

  get curriculum(): any {
    return this.courseForm.get('curriculum') as any;
  }

  get testimonials(): any {
    return this.courseForm.get('testimonials') as any;
  }

  addCurriculumItem() {
    const item = this.fb.group({
      title: ['', Validators.required],
      duration: ['', Validators.required],
      type: ['video', Validators.required],
      file: [''] // Ensure this is always defined
    });
    this.curriculum.push(item);
  }

  removeCurriculumItem(index: number) {
    this.curriculum.removeAt(index);
  }

  addTestimonial() {
    const item = this.fb.group({
      author: ['', Validators.required],
      role: ['Student', Validators.required],
      comment: ['', Validators.required],
      avatar: ['/images/favicon.ico']
    });
    this.testimonials.push(item);
  }

  removeTestimonial(index: number) {
    this.testimonials.removeAt(index);
  }

  ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('id');
    if (this.courseId) {
      this.isEditMode = true;
      this.loadCourseData(this.courseId);
    } else {
      this.addCurriculumItem();
      this.addTestimonial();
    }
  }

  loadCourseData(id: string) {
    const mockData = {
      title: 'Advanced Optometry Masterclass',
      instructor: 'Dr. Sarah Wilson',
      price: '12499',
      duration: '12h 45m',
      lessons: 24,
      description: 'A comprehensive guide to modern optometry practices and advanced diagnostic techniques.',
      status: 'Published',
      image: '/images/FeatureCard-Image1.jpg',
      curriculum: [
        { title: 'Introduction to Optometry', duration: '15m', type: 'video', file: 'https://example.com/video1.mp4' },
        { title: 'Anatomy of the Eye', duration: '45m', type: 'video', file: 'https://example.com/video2.mp4' },
        { title: 'Diagnostic Tools Guide', duration: '5m', type: 'document', file: 'guide.pdf' }
      ],
      testimonials: [
        { author: 'Jane Cooper', role: 'Optometrist', comment: 'The course was incredibly detailed and helpful for my practice.', avatar: '/images/favicon.ico' },
        { author: 'Wade Warren', role: 'Student', comment: 'Clear explanations and great resources!', avatar: '/images/favicon.ico' }
      ]
    };

    while (this.curriculum.length) { this.curriculum.removeAt(0); }
    mockData.curriculum.forEach(item => { 
      this.curriculum.push(this.fb.group({
        title: [item.title, Validators.required],
        duration: [item.duration, Validators.required],
        type: [item.type, Validators.required],
        file: [item.file] // Explicitly include file
      })); 
    });

    while (this.testimonials.length) { this.testimonials.removeAt(0); }
    mockData.testimonials.forEach(item => { this.testimonials.push(this.fb.group(item)); });

    this.courseForm.patchValue({
      title: mockData.title,
      instructor: mockData.instructor,
      price: mockData.price,
      duration: mockData.duration,
      lessons: mockData.lessons,
      description: mockData.description,
      status: mockData.status,
      image: mockData.image
    });
  }

  onFileSelected(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      const curriculumArray = this.curriculum;
      curriculumArray.at(index).patchValue({
        file: file.name
      });
      console.log('File selected for item', index, file.name);
    }
  }

  onThumbnailSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.courseForm.patchValue({
        image: URL.createObjectURL(file) // For preview
      });
      // In a real app, you'd upload this to a server
      console.log('Thumbnail selected:', file.name);
    }
  }

  onSubmit() {
    if (this.courseForm.valid) {
      console.log('Form Submitted:', this.courseForm.value);
      alert('Course saved successfully!');
      this.router.navigate(['/admin/courses']);
    } else {
      Object.keys(this.courseForm.controls).forEach(key => {
        const control = this.courseForm.get(key);
        if (control?.invalid) control.markAsTouched();
      });
    }
  }
}
