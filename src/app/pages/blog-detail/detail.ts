import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorBio: string;
  date: string;
  image: string;
  tags: string[];
}

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detail.html',
  styleUrl: './detail.scss'
})
export class BlogDetailComponent implements OnInit {
  blog: Blog | null = null;
  relatedBlogs: Blog[] = [];

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.fetchBlogDetail(id);
        this.fetchRelatedBlogs(id);
      }
    });
  }

  fetchBlogDetail(id: string) {
    this.api.get<any>(`web/public/blog/${id}`).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const data = res.data;
          this.blog = {
            id: data._id,
            title: data.title,
            excerpt: this.stripHtml(data.content),
            content: data.content,
            author: data.author || 'Anonymous',
            authorBio: data.authorBio || 'Expert contributor at Modern Optician.',
            date: this.formatDate(data.createdAt),
            image: data.thumbnail || 'images/blog-placeholder.jpg',
            tags: data.category || []
          };
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error fetching blog detail:', err);
      }
    });
  }

  fetchRelatedBlogs(currentId: string) {
    this.api.get<any>('web/public/blog').subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.relatedBlogs = res.data
            .filter((b: any) => b._id !== currentId)
            .slice(0, 3)
            .map((b: any) => ({
              id: b._id,
              title: b.title,
              excerpt: this.stripHtml(b.content),
              content: b.content,
              author: b.author || 'Anonymous',
              authorBio: b.authorBio || '',
              date: this.formatDate(b.createdAt),
              image: b.thumbnail || 'images/blog-placeholder.jpg',
              tags: b.category || []
            }));
          this.cdr.detectChanges();
        }
      }
    });
  }

  private stripHtml(html: string): string {
    if (!html) return '';
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  private formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Recently';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
