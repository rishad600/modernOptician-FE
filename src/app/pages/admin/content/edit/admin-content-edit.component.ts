import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

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

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
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
      this.imagePreview = URL.createObjectURL(file);
      this.contentForm.patchValue({ image: this.imagePreview });
    }
  }

  onSubmit() {
    if (this.contentForm.valid) {
      const formValue = this.contentForm.value;
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      // Transform form data to match the required API body structure
      const payload = {
        contentType: formValue.contentType,
        title: formValue.title,
        excerpt: formValue.excerpt,
        content: formValue.content,
        author: formValue.author,
        publishDate: new Date(formValue.date).toISOString(),
        aboutAuthor: formValue.authorBio,
        status: formValue.status,
        thumbnail: formValue.image || 'https://images.unsplash.com/photo-1541560052-5e137f229371',
        tags: formValue.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0)
      };

      const request = this.isEditMode
        ? this.api.put<any>(`web/admin/blog/${this.articleId}`, payload, headers)
        : this.api.post<any>(`web/admin/blog`, payload, headers);

      request.subscribe({
        next: (res) => {
          if (res.success) {
            this.router.navigate(['/admin/content']);
          }
        },
        error: (err) => {
          console.error('Error saving article:', err);
        }
      });
    } else {
      this.contentForm.markAllAsTouched();
    }
  }
}
