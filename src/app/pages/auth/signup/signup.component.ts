import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  isSubmitting = signal(false);
  showPassword = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      repeatPassword: ['', Validators.required],
      terms: [false, Validators.requiredTrue]
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
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const formValue = this.signupForm.value;
    const requestBody = {
      name: formValue.name,
      email: formValue.email,
      password: formValue.password
    };

    console.log('Sending registration request:', requestBody);

    this.apiService.post<any>('/web/user/profile/register', requestBody)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          console.log('Signup request finalized. isSubmitting = false');
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Registration successful:', response);

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
          console.error('Registration failed in component:', error);
          
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
