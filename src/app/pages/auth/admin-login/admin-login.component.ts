import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss'
})
export class AdminLoginComponent {
  loginForm: FormGroup;
  isSubmitting = false;
  showPassword = false;

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

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const requestBody = this.loginForm.value;

    this.apiService.post<any>('/web/admin/profile/login', requestBody).subscribe({
      next: (response) => {
        this.isSubmitting = false;

        if (response && response.data && response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('role', 'admin');

          if (response.data.admin) {
            localStorage.setItem('name', response.data.admin.name);
            localStorage.setItem('email', response.data.admin.email);
          }

          this.router.navigate(['/admin/dashboard']);
        }
      },
      error: (error) => {
        console.error('Admin login failed:', error);
        this.isSubmitting = false;
      }
    });
  }
}
