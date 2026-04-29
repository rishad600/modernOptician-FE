import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss'
})
export class AdminLoginComponent implements OnInit {
  loginForm: FormGroup;
  isSubmitting = signal(false);
  showPassword = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.checkAuthentication();
  }

  private checkAuthentication() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // If an admin token exists, redirect to admin dashboard
    if (token && role === 'admin') {
      console.log('Admin is already authenticated, redirecting to dashboard...');
      this.router.navigate(['/admin/dashboard']);
    }
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const requestBody = this.loginForm.value;

    this.apiService.post<any>('/web/admin/profile/login', requestBody)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          console.log('Admin login request finalized.');
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Admin login successful:', response);

          if (response && response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', 'admin');

            if (response.data.admin) {
              localStorage.setItem('name', response.data.admin.name);
              localStorage.setItem('email', response.data.admin.email);
              if (response.data.admin.avatar) {
                localStorage.setItem('avatar', response.data.admin.avatar);
              }
            }

            this.router.navigate(['/admin/dashboard']);
          }
        },
        error: (error) => {
          console.error('Admin login failed:', error);
          
          let message = 'An unexpected error occurred. Please try again.';
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
