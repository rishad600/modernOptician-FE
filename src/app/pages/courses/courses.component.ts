import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseCardComponent } from '../../shared/components/course-card/course-card.component';
import { ApiService } from '../../core/services/api.service';
import { catchError, throwError } from 'rxjs';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, CourseCardComponent],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss'
})
export class CoursesComponent implements OnInit {

  allCourses: any[] = [];
  filteredCourses: any[] = [];

  selectedCategory: string = 'all';
  searchQuery: string = '';
  selectedSort: string = 'latest';

  isLoading = true;
  error: string | null = null;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.fetchCourses();
  }

  fetchCourses() {
    this.isLoading = true;
    this.error = null;

    this.api.get<any>('web/public/course').pipe(
      catchError(err => {
        this.isLoading = false;
        this.error = 'Failed to load courses. Please try again later.';
        this.cdr.detectChanges();
        return throwError(() => err);
      })
    ).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && Array.isArray(res.data)) {
          this.allCourses = res.data.map((c: any) => ({
            id: c._id,
            title: c.name,
            price: this.formatPrice(c.price, c.currency),
            rawPrice: c.price,
            features: c.features || [],
            image: c.thumbnail || 'images/course-placeholder.jpg',
            category: (c.category || '').toLowerCase(),
            createdAt: c.createdAt || ''
          }));
          this.applyFilters();
        }
        this.cdr.detectChanges();
      }
    });
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  onSearch(event: any) {
    this.searchQuery = (event.target as HTMLInputElement).value.toLowerCase();
    this.applyFilters();
  }

  onSort(event: any) {
    this.selectedSort = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = this.allCourses.filter(course => {
      const matchesCategory = this.selectedCategory === 'all' || course.category === this.selectedCategory;
      const matchesSearch = course.title.toLowerCase().includes(this.searchQuery);
      return matchesCategory && matchesSearch;
    });

    this.filteredCourses = filtered.sort((a, b) => {
      switch (this.selectedSort) {
        case 'latest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'price-low':
          return a.rawPrice - b.rawPrice;
        case 'price-high':
          return b.rawPrice - a.rawPrice;
        default:
          return 0;
      }
    });
  }

  private formatPrice(price: any, currency: string): string {
    const amount = parseFloat(price);
    if (isNaN(amount)) return String(price);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  }
}
