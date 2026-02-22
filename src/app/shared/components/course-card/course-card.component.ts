import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './course-card.component.html',
  styleUrl: './course-card.component.scss'
})
export class CourseCardComponent {
  @Input({ required: true }) plan!: any;
}
