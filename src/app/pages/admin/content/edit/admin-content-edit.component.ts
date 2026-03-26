import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

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
    private router: Router
  ) {
    this.contentForm = this.fb.group({
      contentType: ['Blog', Validators.required],
      title: ['', [Validators.required, Validators.minLength(5)]],

      excerpt: ['', [Validators.required, Validators.maxLength(200)]],
      author: ['Dr. Sarah Wilson', Validators.required],

      date: [new Date().toISOString().split('T')[0], Validators.required],
      tags: ['', Validators.required],
      status: ['Draft', Validators.required],
      image: ['/images/FeatureCard-Image1.jpg'],
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
    // Mock data based on blog detail structure
    const mockArticle = {
      contentType: 'Blog',
      title: '10 Tips for Better Eye Health in the Digital Age',

      excerpt: 'Discover simple yet effective ways to protect your vision while working with digital screens and devices.',
      author: 'Dr. Sarah Wilson',

      date: '2026-03-20',
      tags: 'Health, Digital, Optometry',
      status: 'Published',
      image: '/images/FeatureCard-Image1.jpg',
      content: '<p>In today\'s digital world, our eyes are under constant strain...</p>',
      authorBio: 'Dr. Sarah Wilson is a renowned optometrist specializing in pediatric eye care and digital vision syndrome.'
    };

    this.contentForm.patchValue(mockArticle);
    this.imagePreview = mockArticle.image;
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
      console.log('Article Saved:', this.contentForm.value);
      this.router.navigate(['/admin/content']);
    } else {
      this.contentForm.markAllAsTouched();
    }
  }
}
