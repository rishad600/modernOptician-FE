import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-content',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-content.component.html',
  styleUrl: './admin-content.component.scss'
})
export class AdminContentComponent implements OnInit {
  articles = [
    {
      id: '1',
      title: '10 Tips for Better Eye Health in the Digital Age',
      author: 'Dr. Sarah Wilson',
      date: 'Mar 20, 2026',
      tags: ['Health', 'Digital'],
      status: 'Published',
      views: 1240,
      type: 'Blog'
    },
    {
      id: '2',
      title: 'The Future of Contact Lenses: What to Expect',
      author: 'Dr. Sarah Wilson',
      date: 'Mar 18, 2026',
      tags: ['Technology', 'Lenses'],
      status: 'Published',
      views: 856,
      type: 'Blog'
    },
    {
      id: '3',
      title: 'Understanding Glaucoma: Prevention and Treatment',
      author: 'Dr. Sarah Wilson',
      date: 'Mar 15, 2026',
      tags: ['Health', 'Medical'],
      status: 'Draft',
      views: 0,
      type: 'Article'
    }
  ];

  constructor() {}

  ngOnInit(): void {}

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  deleteArticle(id: string) {
    if (confirm('Are you sure you want to delete this article?')) {
      console.log('Deleting article', id);
    }
  }
}
