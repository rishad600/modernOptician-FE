import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

@Component({
  selector: 'app-admin-content',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-content.component.html',
  styleUrl: './admin-content.component.scss'
})
export class AdminContentComponent implements OnInit {
  articles: any[] = [];
  filteredArticles: any[] = [];
  availableTags: string[] = [];
  
  searchTerm: string = '';
  selectedCategory: string = 'All Categories';
  selectedStatus: string = 'All Status';

  constructor(
    private api: ApiService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchArticles();
  }

  fetchArticles() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.api.get<any>(`web/admin/blog`, new HttpParams(), headers).pipe(
      catchError(err => {
        console.error('API Error fetching admin blogs:', err);
        return throwError(() => err);
      })
    ).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.articles = res.data.map((art: any) => ({
            id: art._id,
            title: art.title,
            author: art.author || 'Anonymous',
            date: this.formatDate(art.publishDate || art.createdAt),
            tags: art.tags || [],
            status: art.status || 'Draft',
            views: art.views || 0,
            type: (art.contentType || 'Blog Post').includes('Blog') ? 'Blog' : 'Article'
          }));
          
          // Extract unique tags for the filter
          const tagSet = new Set<string>();
          this.articles.forEach(art => {
            art.tags.forEach((tag: string) => tagSet.add(tag));
          });
          this.availableTags = Array.from(tagSet).sort();

          this.applyFilters();
          this.cdr.detectChanges();
        }
      }
    });
  }

  applyFilters() {
    this.filteredArticles = this.articles.filter(article => {
      const matchesSearch = !this.searchTerm || 
        article.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        article.author.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesCategory = this.selectedCategory === 'All Categories' || 
        article.tags.some((tag: string) => tag.toLowerCase() === this.selectedCategory.toLowerCase());
      
      const matchesStatus = this.selectedStatus === 'All Status' || 
        article.status === this.selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
    this.cdr.detectChanges();
  }

  private formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getStatusClass(status: string): string {
    return status ? status.toLowerCase() : 'draft';
  }

  deleteArticle(id: string) {
    if (confirm('Are you sure you want to delete this article?')) {
      const article = this.articles.find(a => a.id === id);
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      const body = {
        title: article ? article.title : '',
        isPublished: false
      };

      this.api.delete<any>(`web/admin/blog/${id}`, headers, body).subscribe({
        next: (res) => {
          if (res.success) {
            this.articles = this.articles.filter(a => a.id !== id);
            this.applyFilters();
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          console.error('Error deleting article:', err);
        }
      });
    }
  }
}
