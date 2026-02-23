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
    avatar: 'images/avatar-placeholder.png'
  };

  saveProfile() {
    console.log('Saving profile...', this.user);
    // TODO: Implement actual save logic
  }
}
