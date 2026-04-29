import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
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

  passwordError: string | null = null;
  passwordSuccess: string | null = null;
  profileError: string | null = null;
  profileSuccess: string | null = null;
  selectedAvatarFile: File | null = null;
  avatarPreview: string | null = null;

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get(`${this.apiUrl}/web/user/profile`, { headers }).subscribe({
      next: (response: any) => {
        // Assume response structure maps 'name' to 'firstName'
        const profile = response.data || response;
        if (profile) {
          this.user.firstName = profile.name || profile.firstName || '';
          this.user.lastName = profile.lastName || '';
          this.user.email = profile.email || '';
          this.user.phone = profile.phone || '';
          this.user.avatar = profile.avatar || '';
          this.avatarPreview = profile.avatar || '';
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load profile:', error);
      }
    });
  }

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

  onAvatarSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedAvatarFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarPreview = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile() {
    this.profileError = null;
    this.profileSuccess = null;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const formData = new FormData();
    formData.append('name', this.user.firstName);
    formData.append('lastName', this.user.lastName);
    formData.append('phone', this.user.phone);

    if (this.selectedAvatarFile) {
      formData.append('avatar', this.selectedAvatarFile);
    }

    this.http.put(`${this.apiUrl}/web/user/profile`, formData, { headers }).subscribe({
      next: (response: any) => {
        this.profileSuccess = response.message || 'Profile updated successfully!';
        if (response.data?.avatar) {
          this.user.avatar = response.data.avatar;
          this.avatarPreview = response.data.avatar;
        }
        this.selectedAvatarFile = null;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Profile update error:', error);
        this.profileError = error.error?.message || 'Failed to update profile. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  changePassword() {
    this.passwordError = null;
    this.passwordSuccess = null;

    if (!this.user.oldPassword || !this.user.newPassword || !this.user.confirmPassword) {
      this.passwordError = 'Please fill in all password fields.';
      return;
    }

    if (this.user.newPassword !== this.user.confirmPassword) {
      this.passwordError = 'New passwords do not match!';
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const body = {
      currentPassword: this.user.oldPassword,
      newPassword: this.user.newPassword
    };

    this.http.put(`${this.apiUrl}/web/user/profile/change-password`, body, { headers }).subscribe({
      next: (response: any) => {
        this.passwordSuccess = 'Password changed successfully!';
        this.user.oldPassword = '';
        this.user.newPassword = '';
        this.user.confirmPassword = '';
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Password change error:', error);
        
        // Extract the error message from the JSON body if it exists
        const apiErrorMsg = error.error?.message;
        
        if (error.status === 400) {
          this.passwordError = apiErrorMsg || 'The current password you entered is incorrect. Please try again.';
        } else {
          this.passwordError = apiErrorMsg || 'Failed to change password. Please try again.';
        }
        this.cdr.detectChanges();
      }
    });
  }
}
