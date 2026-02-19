import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestimonialsComponent } from './sections/testimonials/testimonials.component';
import { CtaComponent } from './sections/cta/cta.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    TestimonialsComponent,
    CtaComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  steps = [
    {
      number: '01',
      title: 'Register Your Account',
      description: 'Create your student profile in just a few clicks to get started.'
    },
    {
      number: '02',
      title: 'Choose Your Class',
      description: 'Select either a single class or the full comprehensive course.'
    },
    {
      number: '03',
      title: 'Start Learning',
      description: 'Pay securely and gain instant access to all included subjects.'
    }
  ];


  faqs = [
    { question: 'How many subjects are included in one class?', answer: '', isOpen: false },
    { question: 'Is this a subscription?', answer: 'No, we use a one-time payment model. Once you buy a class or the full course, you own it for life.', isOpen: true },
    { question: 'What payment methods accepted?', answer: '', isOpen: false },
    { question: 'Can I access the course anytime?', answer: '', isOpen: false }
  ];
}
