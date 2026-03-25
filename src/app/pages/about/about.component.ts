import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
}

interface Value {
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  activeTab: 'mission' | 'vision' | 'process' = 'mission';

  team: TeamMember[] = [
    {
      name: 'Dr. Sarah Wilson',
      role: 'Lead Instructor',
      image: 'images/Team-1.jpg',
      bio: 'Expert in clinical optometry with over 15 years of teaching experience.'
    },
    {
      name: 'James Chen',
      role: 'Optical Specialist',
      image: 'images/Team-2.jpg',
      bio: 'Specialist in lens technology and frame styling.'
    },
    {
      name: 'Elena Rodriguez',
      role: 'Course Coordinator',
      image: 'images/Team-3.jpg',
      bio: 'Passionate about creating accessible learning environments.'
    },
    {
      name: 'Mark Thompson',
      role: 'Technical Instructor',
      image: 'images/About-image.png',
      bio: 'Expert in modern diagnostic equipment and digital optometry tools.'
    }
  ];

  stats = [
    { label: 'Happy Students', value: '10K+' },
    { label: 'Video Lessons', value: '500+' },
    { label: 'Expert Instructors', value: '25+' },
    { label: 'Clinical Case Studies', value: '200+' }
  ];

  milestones = [
    { year: '2020', title: 'Platform Launch', description: 'Started with our first basic optician training course.' },
    { year: '2021', title: 'Global Reach', description: 'Expanded to over 15 countries with localized content.' },
    { year: '2022', title: 'Industry Partners', description: 'Collaborated with major eyewear brands for practical training.' },
    { year: '2023', title: 'Digital Innovation', description: 'Integrated AR tools for virtual frame fitting practice.' }
  ];

  benefits = [
    { title: 'Flexible Learning', description: 'Study at your own pace from anywhere in the world.', icon: 'images/Book.svg' },
    { title: 'Expert Guidance', description: 'Direct access to industry veterans and clinical experts.', icon: 'images/video lesson.svg' },
    { title: 'Career Growth', description: 'Upskill your knowledge and unlock new professional opportunities.', icon: 'images/Quizzes.svg' }
  ];

  setTab(tab: 'mission' | 'vision' | 'process'): void {
    this.activeTab = tab;
  }
}
