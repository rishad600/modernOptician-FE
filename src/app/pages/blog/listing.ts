import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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
  allBlogs: Blog[] = [
    {
      id: 'future-digital-optometry',
      title: 'The Future of Digital Optometry',
      excerpt: 'Explore how AI and digital diagnostics are transforming the landscape of eye care and what it means for practitioners.',
      author: 'Dr. Sarah Wilson',
      date: 'March 15, 2024',
      image: 'images/digital_optometry_blog.png',
      tags: ['Technology', 'AI', 'Future']
    },
    {
      id: 'progressive-lens-designs',
      title: 'Understanding Progressive Lens Designs',
      excerpt: 'A deep dive into the physics and geometry behind modern progressive lenses and how to prescribe them effectively.',
      author: 'James Chen',
      date: 'March 12, 2024',
      image: 'images/progressive_lens_blog.png',
      tags: ['Clinical', 'Opthalmology', 'Lenses']
    },
    {
      id: 'customer-service-excellence',
      title: 'Customer Service Excellence in Optical Retail',
      excerpt: 'Building trust and loyalty in your practice starts with the first interaction. Learn key strategies for retail success.',
      author: 'Elena Rodriguez',
      date: 'March 10, 2024',
      image: 'images/optical_retail_blog.png',
      tags: ['Business', 'Retail', 'Customer Care']
    },
    {
      id: 'advancements-contact-lens',
      title: 'Advancements in Contact Lens Materials',
      excerpt: 'From silicone hydrogels to biomimetic materials, discover the latest innovations in contact lens comfort.',
      author: 'Dr. Michael Brown',
      date: 'March 08, 2024',
      image: 'images/contact_lens_blog.png',
      tags: ['Clinical', 'Contact Lenses', 'Innovation']
    },
    {
      id: 'optical-marketing-2024',
      title: 'Marketing Your Optical Practice in 2024',
      excerpt: 'Digital marketing strategies that actually work for local practices. reach more patients and grow your brand.',
      author: 'Mark Thompson',
      date: 'March 05, 2024',
      image: 'images/optical_marketing_blog.png',
      tags: ['Business', 'Marketing', 'Digital']
    }
  ];

  filteredBlogs: Blog[] = [];
  searchQuery: string = '';
  selectedTag: string = 'All';
  allTags: string[] = ['All'];

  ngOnInit() {
    this.filteredBlogs = [...this.allBlogs];
    this.extractTags();
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
