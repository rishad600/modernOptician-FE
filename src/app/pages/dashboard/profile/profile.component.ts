import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  user = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 000-0000',
    bio: 'Optometry student passionate about eye care and modern lens technology.',
    avatar: '',
    languagePreference: 'en',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  faqs = [
    {
      question: 'How do I change my email address?',
      answer: 'To change your email address, please contact our support team through the help center.',
      isOpen: false
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we use industry-standard encryption to protect your personal information and account data.',
      isOpen: false
    },
    {
      question: 'Can I delete my account?',
      answer: 'Account deletion can be requested via the Account Management section or by contacting support.',
      isOpen: false
    }
  ];

  toggleFaq(index: number) {
    this.faqs[index].isOpen = !this.faqs[index].isOpen;
  }

  scrollTo(elementId: string) {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  getInitials(): string {
    if (!this.user.firstName || !this.user.lastName) return 'JD';
    return `${this.user.firstName.charAt(0)}${this.user.lastName.charAt(0)}`.toUpperCase();
  }

  saveProfile() {
    console.log('Saving profile...', this.user);
    // TODO: Implement actual save logic
  }
}
