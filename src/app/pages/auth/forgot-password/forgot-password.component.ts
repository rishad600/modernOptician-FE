import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent implements OnInit {
  forgotForm: FormGroup;
  resetForm: FormGroup;
  step = signal<'email' | 'otp'>('email');
  isSubmitting = signal(false);
  showPassword = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {
    this.checkAuthentication();
  }

  private checkAuthentication() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('_id');
    const role = localStorage.getItem('role');

    // If a user token exists, redirect to dashboard
    if (token && userId && role === 'user') {
      console.log('User is already authenticated, redirecting to dashboard...');
      this.router.navigate(['/dashboard/my-courses']);
    }
  }

  togglePasswordVisibility() {
    this.showPassword.update(v => !v);
  }

  onForgotSubmit() {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const email = this.forgotForm.value.email;
    this.apiService.post<any>('/web/user/profile/forgot-password', { email })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (res) => {
          if (res.success || res.code === 200) {
            this.successMessage.set(res.message || 'OTP sent successfully to your email.');
            this.resetForm.get('email')?.setValue(email);
          } else {
            this.errorMessage.set(res.message || 'Something went wrong.');
          }
        },
        error: (error) => {
          console.error('Forgot password failed:', error);
          
          let message = 'Failed to send OTP. Please try again.';
          if (error && typeof error === 'string') {
            message = error;
          } else if (error && error.message) {
            message = error.message;
          } else if (error && error.error && error.error.message) {
            message = error.error.message;
          }
          
          this.errorMessage.set(message);
        }
      });
  }

  onResetSubmit() {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.apiService.post<any>('/web/user/profile/reset-password', this.resetForm.value)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (res) => {
          if (res.success || res.code === 200) {
            this.successMessage.set('Password reset successful! Redirecting to login...');
            setTimeout(() => {
              this.router.navigate(['/auth/login']);
            }, 2000);
          } else {
            this.errorMessage.set(res.message || 'Reset failed.');
          }
        },
        error: (error) => {
          console.error('Reset password failed:', error);
          
          let message = 'Failed to reset password. Please try again.';
          if (error && typeof error === 'string') {
            message = error;
          } else if (error && error.message) {
            message = error.message;
          } else if (error && error.error && error.error.message) {
            message = error.error.message;
          }
          
          this.errorMessage.set(message);
        }
      });
  }
}
