import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-admin-content-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-content-edit.component.html',
  styleUrl: './admin-content-edit.component.scss'
})
export class AdminContentEditComponent implements OnInit {
  contentForm: FormGroup;
  isEditMode = false;
  articleId: string | null = null;
  imagePreview: string | null = null;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService
  ) {
    this.contentForm = this.fb.group({
      contentType: ['Blog Post', Validators.required],
      title: ['', [Validators.required, Validators.minLength(5)]],
      excerpt: ['', [Validators.required, Validators.maxLength(200)]],
      author: ['Dr. Sarah Wilson', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      tags: ['', Validators.required],
      status: ['Draft', Validators.required],
      image: [''],
      content: ['', Validators.required],
      authorBio: ['Expert Optometrist with over 15 years of clinical experience.', Validators.required]
    });
  }

  ngOnInit(): void {
    this.articleId = this.route.snapshot.paramMap.get('id');
    if (this.articleId) {
      this.isEditMode = true;
      this.loadArticleData(this.articleId);
    }
  }

  loadArticleData(id: string) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.api.get<any>(`web/admin/blog/${id}`, new HttpParams(), headers).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const data = res.data;
          const article = {
            contentType: data.contentType || 'Blog Post',
            title: data.title,
            excerpt: data.excerpt || '',
            author: data.author || 'Anonymous',
            date: data.publishDate ? data.publishDate.split('T')[0] : new Date().toISOString().split('T')[0],
            tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
            status: data.status || 'Draft',
            image: data.thumbnail || '',
            content: data.content,
            authorBio: data.aboutAuthor || ''
          };

          this.contentForm.patchValue(article);
          this.imagePreview = article.image;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error loading article:', err);
      }
    });
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.contentForm.valid) {
      const formValue = this.contentForm.value;
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      const formData = new FormData();
      formData.append('contentType', formValue.contentType);
      formData.append('title', formValue.title);
      formData.append('excerpt', formValue.excerpt);
      formData.append('content', formValue.content);
      formData.append('author', formValue.author);
      formData.append('publishDate', new Date(formValue.date).toISOString());
      formData.append('aboutAuthor', formValue.authorBio);
      formData.append('status', formValue.status);
      
      const tagsArray = formValue.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0);
      tagsArray.forEach((tag: string) => formData.append('tags[]', tag));

      if (this.selectedFile) {
        formData.append('thumbnail', this.selectedFile);
      } else if (formValue.image) {
        formData.append('thumbnail', formValue.image);
      }

      const request = this.isEditMode
        ? this.api.put<any>(`web/admin/blog/${this.articleId}`, formData, headers)
        : this.api.post<any>(`web/admin/blog`, formData, headers);

      request.subscribe({
        next: (res) => {
          if (res.success) {
            this.router.navigate(['/admin/content']);
          }
        },
        error: (err) => {
          console.error('Error saving article:', err);
          this.toastService.error(err.message || 'Failed to save article. Please try again.');
        }
      });
    } else {
      this.contentForm.markAllAsTouched();
    }
  }
}
