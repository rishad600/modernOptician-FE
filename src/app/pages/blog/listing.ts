import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  image: string;
  tags: string[];
}

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './listing.html',
  styleUrl: './listing.scss'
})
export class BlogComponent implements OnInit {
  allBlogs: Blog[] = [];

  filteredBlogs: Blog[] = [];
  searchQuery: string = '';
  selectedTag: string = 'All';
  allTags: string[] = ['All'];

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.fetchBlogs();
  }

  fetchBlogs() {
    this.api.get<any>('web/public/blog').subscribe({
      next: (res) => {
        console.log('Blog API raw response:', res);
        
        // Handle cases where res itself might be the array, or res.data is the array
        const blogData = res.data || (Array.isArray(res) ? res : null);
        
        if (blogData && Array.isArray(blogData)) {
          this.allBlogs = blogData.map((blog: any) => ({
            id: blog._id || blog.id || '',
            title: blog.title || 'Untitled Article',
            excerpt: this.stripHtml(blog.content || blog.excerpt || ''),
            author: blog.author || 'Anonymous',
            date: this.formatDate(blog.createdAt || blog.date || new Date()),
            image: blog.thumbnail || blog.image || 'images/blog-placeholder.jpg',
            tags: blog.category || blog.tags || []
          }));
          
          this.filteredBlogs = [...this.allBlogs];
          this.extractTags();
          console.log('Successfully processed blogs:', this.allBlogs.length);
        } else {
          console.warn('API returned no valid blog data array:', res);
          this.allBlogs = [];
          this.filteredBlogs = [];
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('API Error fetching blogs:', err);
        this.allBlogs = [];
        this.filteredBlogs = [];
        this.cdr.detectChanges();
      }
    });
  }

  private stripHtml(html: any): string {
    if (!html || typeof html !== 'string') return '';
    try {
      const tmp = document.createElement('DIV');
      tmp.innerHTML = html;
      const text = tmp.textContent || tmp.innerText || '';
      return text.length > 150 ? text.substring(0, 150) + '...' : text;
    } catch (e) {
      console.warn('Error stripping HTML:', e);
      return String(html).substring(0, 150);
    }
  }

  private formatDate(dateStr: any): string {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Recently';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'Recently';
    }
  }

  extractTags() {
    const tagsSet = new Set<string>();
    this.allBlogs.forEach(blog => blog.tags.forEach(tag => tagsSet.add(tag)));
    this.allTags = ['All', ...Array.from(tagsSet).sort()];
  }

  onSearch(event: any) {
    this.searchQuery = (event.target as HTMLInputElement).value.toLowerCase();
    this.applyFilters();
  }

  filterByTag(tag: string) {
    this.selectedTag = tag;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredBlogs = this.allBlogs.filter(blog => {
      const matchesSearch = blog.title.toLowerCase().includes(this.searchQuery) || 
                           blog.excerpt.toLowerCase().includes(this.searchQuery);
      const matchesTag = this.selectedTag === 'All' || blog.tags.includes(this.selectedTag);
      return matchesSearch && matchesTag;
    });
  }
}
