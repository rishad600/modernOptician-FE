import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss'
})
export class TestimonialsComponent {
  testimonials = [
    {
      text: '"I finished the course in six weeks and landed a job at a clinic two weeks later. The material was thorough and the instructors knew what they were talking about."',
      author: 'Jane Cooper',
      role: 'Optician, Boston',
      avatar: 'assets/avatar-jane.png'
    }
  ];
}
