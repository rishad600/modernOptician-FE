import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseCardComponent } from '../../shared/components/course-card/course-card.component';

interface Course {
  id: string;
  title: string;
  price: string;
  features: string[];
  image: string;
  category: 'clinical' | 'business' | 'technical';
  date: string;
}

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, CourseCardComponent],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss'
})
export class CoursesComponent implements OnInit {
  allCourses: Course[] = [
    {
      id: 'basic-optics',
      title: 'Basic Optical Science',
      price: '$80.00',
      features: ['4 Video Chapters', 'Lens Physics & Optics', 'Frame Selection Basics', 'Lifetime Access'],
      image: 'images/article-1.jpg',
      category: 'technical',
      date: '2024-03-10'
    },
    {
      id: 'clinical-procedures',
      title: 'Clinical Procedures',
      price: '$80.00',
      features: ['5 Video Chapters', 'Exam Techniques', 'Diagnosis Basics', 'Lifetime Access'],
      image: 'images/article-1.jpg',
      category: 'clinical',
      date: '2024-03-12'
    },
    {
      id: 'contact-lens',
      title: 'Contact Lens Theory',
      price: '$80.00',
      features: ['4 Video Chapters', 'Material Science', 'Fitting Guides', 'Lifetime Access'],
      image: 'images/FeatureCard-Image2.jpg',
      category: 'clinical',
      date: '2024-03-15'
    },
    {
      id: 'modern-tech',
      title: 'Modern Lens Tech',
      price: '$80.00',
      features: ['4 Video Chapters', 'Digital Surfacing', 'Coating Technology', 'Lifetime Access'],
      image: 'images/FeatureCard-Image1.jpg',
      category: 'technical',
      date: '2024-03-14'
    },
    {
      id: 'optical-mgmt',
      title: 'Optical Business Mgmt',
      price: '$95.00',
      features: ['6 Video Chapters', 'Inventory Control', 'Sales Strategies', 'Lifetime Access'],
      image: 'images/FeatureCard-Image3.jpg',
      category: 'business',
      date: '2024-03-18'
    },
    {
      id: 'patient-comm',
      title: 'Patient Communication',
      price: '$75.00',
      features: ['3 Video Chapters', 'Soft Skills', 'Conflict Resolution', 'Lifetime Access'],
      image: 'images/Hero Image.jpg',
      category: 'business',
      date: '2024-03-20'
    }
  ];

  filteredCourses: Course[] = [];
  selectedCategory: string = 'all';
  searchQuery: string = '';
  selectedSort: string = 'latest';

  ngOnInit() {
    this.filteredCourses = [...this.allCourses];
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

    // Apply Sorting
    this.filteredCourses = filtered.sort((a, b) => {
      switch (this.selectedSort) {
        case 'latest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'price-low':
          return parseFloat(a.price.replace('$', '')) - parseFloat(b.price.replace('$', ''));
        case 'price-high':
          return parseFloat(b.price.replace('$', '')) - parseFloat(a.price.replace('$', ''));
        default:
          return 0;
      }
    });
  }
}
