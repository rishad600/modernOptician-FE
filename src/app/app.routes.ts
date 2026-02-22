import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/layout/main-layout.component';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: HomeComponent
      },
      {
        path: 'course/:id',
        loadComponent: () => import('./pages/course-detail/course-detail.component').then(m => m.CourseDetailComponent)
      }
    ]
  },
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'signup',
        loadComponent: () => import('./pages/auth/signup/signup.component').then(m => m.SignupComponent)
      }
    ]
  }
];
