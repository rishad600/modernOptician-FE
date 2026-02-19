import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cta.component.html',
  styleUrl: './cta.component.scss'
})
export class CtaComponent {
  plans = [
    {
      title: 'Basic Optical Science',
      price: '$80.00',
      features: ['4 Video Chapters', 'Lens Physics & Optics', 'Frame Selection Basics', 'Lifetime Access'],
      image: 'images/article-1.jpg'
    },
    {
      title: 'Clinical Procedures',
      price: '$80.00',
      features: ['4 Video Chapters', 'Lens Physics & Optics', 'Frame Selection Basics', 'Lifetime Access'],
      image: 'images/article-1.jpg'
    },
    {
      title: 'Contact Lens Theory',
      price: '$80.00',
      features: ['4 Video Chapters', 'Lens Physics & Optics', 'Frame Selection Basics', 'Lifetime Access'],
      image: 'images/article-1.jpg'
    },
    {
      title: 'Modern Lens Tech',
      price: '$80.00',
      features: ['4 Video Chapters', 'Lens Physics & Optics', 'Frame Selection Basics', 'Lifetime Access'],
      image: 'images/article-1.jpg'
    }
  ];
}
