import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { GuestGuard } from './auth/guest.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
    canActivate: [GuestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent),
    canActivate: [GuestGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'projects',
    loadComponent: () => import('./components/projects/projects.component').then(m => m.ProjectsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'projects/:projectId/tasks',
    loadComponent: () => import('./components/tasks/tasks.component').then(m => m.TasksComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'tasks',
    loadComponent: () => import('./components/tasks/tasks.component').then(m => m.TasksComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  }
];
