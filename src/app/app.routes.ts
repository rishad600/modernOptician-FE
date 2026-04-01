// Admin and Auth routes configuration
import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/layout/main-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { authGuard } from './core/guards/auth-guard';
import { adminAuthGuard } from './core/guards/admin-auth.guard';

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
      },
      {
        path: 'about',
        loadComponent: () => import('./pages/about/about.component').then(c => c.AboutComponent)
      },
      {
        path: 'courses',
        loadComponent: () => import('./pages/courses/courses.component').then(m => m.CoursesComponent)
      },
      {
        path: 'blog',
        loadComponent: () => import('./pages/blog/listing').then(m => m.BlogComponent)
      },
      {
        path: 'blog/:id',
        loadComponent: () => import('./pages/blog-detail/detail').then(m => m.BlogDetailComponent)
      }
    ]
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    children: [
      {
        path: '',
        redirectTo: 'my-courses',
        pathMatch: 'full'
      },
      {
        path: 'my-courses',
        loadComponent: () => import('./pages/dashboard/my-courses/my-courses.component').then(m => m.MyCoursesComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/dashboard/profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin/dashboard/admin-dashboard/admin-dashboard').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'courses',
        loadComponent: () => import('./pages/admin/courses/admin-courses.component').then(m => m.AdminCoursesComponent)
      },
      {
        path: 'courses/new',
        loadComponent: () => import('./pages/admin/courses/edit/admin-course-edit.component').then(m => m.AdminCourseEditComponent)
      },
      {
        path: 'courses/edit/:id',
        loadComponent: () => import('./pages/admin/courses/edit/admin-course-edit.component').then(m => m.AdminCourseEditComponent)
      },
      {
        path: 'students',
        loadComponent: () => import('./pages/admin/students/admin-students.component').then(m => m.AdminStudentsComponent)
      },
      {
        path: 'payments',
        loadComponent: () => import('./pages/admin/payments/admin-payments.component').then(m => m.AdminPaymentsComponent)
      },
      {
        path: 'content',
        loadComponent: () => import('./pages/admin/content/admin-content.component').then(m => m.AdminContentComponent)
      },
      {
        path: 'content/new',
        loadComponent: () => import('./pages/admin/content/edit/admin-content-edit.component').then(m => m.AdminContentEditComponent)
      },
      {
        path: 'content/edit/:id',
        loadComponent: () => import('./pages/admin/content/edit/admin-content-edit.component').then(m => m.AdminContentEditComponent)
      }
    ]

  },
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      // {
      //   path: '',
      //   redirectTo: 'dashboard',
      //   pathMatch: 'full'
      // },
      {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'admin-login',
        loadComponent: () => import('./pages/auth/admin-login/admin-login.component').then(m => m.AdminLoginComponent)
      },
      {
        path: 'signup',
        loadComponent: () => import('./pages/auth/signup/signup.component').then(m => m.SignupComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./pages/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
      }
    ]
  }
];
