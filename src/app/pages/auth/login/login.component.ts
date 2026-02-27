import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  loginForm: FormGroup;
  isSubmitting = false;

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

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const requestBody = this.loginForm.value;
    console.log('Sending login request:', requestBody);

    this.apiService.post<any>('/web/v1/user/login', requestBody).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.isSubmitting = false;

        if (response && response.data && response.data.token) {
          localStorage.setItem('token', response.data.token);
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.isSubmitting = false;
      }
    });
  }
}
