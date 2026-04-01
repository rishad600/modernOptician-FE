import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
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
    const userId = localStorage.getItem('_id');
    const name = localStorage.getItem('name');
    const email = localStorage.getItem('email');
    const role = localStorage.getItem('role');

    // If a token exists, the user is already authenticated
    if (token && userId && name && email && role) {
      console.log('User is already authenticated, redirecting to dashboard...');
      this.router.navigate(['/dashboard/my-courses']);
    }
  }

  togglePasswordVisibility() {
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
    console.log('Sending login request:', requestBody);

    this.apiService.post<any>('/web/user/profile/login', requestBody)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          console.log('Login request finalized. isSubmitting = false');
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Login successful:', response);

          if (response && response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);

            if (response.data.user) {
              localStorage.setItem('_id', response.data.user._id);
              localStorage.setItem('name', response.data.user.name);
              localStorage.setItem('email', response.data.user.email);
              localStorage.setItem('role', 'user');
            }

            this.router.navigate(['/dashboard/my-courses']);
          }
        },
        error: (error) => {
          console.error('Login failed in component:', error);
          
          let message = 'An unexpected error occurred. Please try again.';
          if (error && typeof error === 'string') {
            message = error;
          } else if (error && error.message) {
            message = error.message;
          } else if (error && error.error && error.error.message) {
            message = error.error.message;
          }
          
          this.errorMessage.set(message);
          console.log('Error message shown to user:', message);
        }
      });
  }
}
