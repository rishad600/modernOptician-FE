import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  signupForm: FormGroup;
  isSubmitting = false;
  showPassword = false;

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

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const formValue = this.signupForm.value;
    const requestBody = {
      name: formValue.name,
      email: formValue.email,
      password: formValue.password
    };

    console.log('Sending registration request:', requestBody);

    this.apiService.post<any>('/web/user/profile/register', requestBody).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.isSubmitting = false;

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

        // Handle successful registration router navigation or show success message
      },
      error: (error) => {
        console.error('Registration failed:', error);
        this.isSubmitting = false;
        // Handle error message rendering
      }
    });
  }
}
