import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CourseCardComponent } from '../../shared/components/course-card/course-card.component';

interface Course {
  id: string;
  title: string;
  price: string;
  features: string[];
  image: string;
  category: 'clinical' | 'business' | 'technical';
}

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, RouterLink, CourseCardComponent],
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
      category: 'technical'
    },
    {
      id: 'clinical-procedures',
      title: 'Clinical Procedures',
      price: '$80.00',
      features: ['5 Video Chapters', 'Exam Techniques', 'Diagnosis Basics', 'Lifetime Access'],
      image: 'images/article-1.jpg',
      category: 'clinical'
    },
    {
      id: 'contact-lens',
      title: 'Contact Lens Theory',
      price: '$80.00',
      features: ['4 Video Chapters', 'Material Science', 'Fitting Guides', 'Lifetime Access'],
      image: 'images/FeatureCard-Image2.jpg',
      category: 'clinical'
    },
    {
      id: 'modern-tech',
      title: 'Modern Lens Tech',
      price: '$80.00',
      features: ['4 Video Chapters', 'Digital Surfacing', 'Coating Technology', 'Lifetime Access'],
      image: 'images/FeatureCard-Image1.jpg',
      category: 'technical'
    },
    {
      id: 'optical-mgmt',
      title: 'Optical Business Mgmt',
      price: '$95.00',
      features: ['6 Video Chapters', 'Inventory Control', 'Sales Strategies', 'Lifetime Access'],
      image: 'images/FeatureCard-Image3.jpg',
      category: 'business'
    },
    {
      id: 'patient-comm',
      title: 'Patient Communication',
      price: '$75.00',
      features: ['3 Video Chapters', 'Soft Skills', 'Conflict Resolution', 'Lifetime Access'],
      image: 'images/Hero Image.jpg',
      category: 'business'
    }
  ];

  filteredCourses: Course[] = [];
  selectedCategory: string = 'all';
  searchQuery: string = '';

  ngOnInit() {
    this.filteredCourses = [...this.allCourses];
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  onSearch(event: any) {
    this.searchQuery = event.target.value.toLowerCase();
    this.applyFilters();
  }

  applyFilters() {
    this.filteredCourses = this.allCourses.filter(course => {
      const matchesCategory = this.selectedCategory === 'all' || course.category === this.selectedCategory;
      const matchesSearch = course.title.toLowerCase().includes(this.searchQuery);
      return matchesCategory && matchesSearch;
    });
  }
}
