import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  styleUrls: ['./dashboard.component.scss'],
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule, RouterModule],
  template: `
    <div class="container mx-auto p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Dashboard</h1>
        <button mat-raised-button color="warn" (click)="logout()">
          <mat-icon>logout</mat-icon>
          Logout
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <mat-card class="hover:shadow-lg transition-shadow cursor-pointer" routerLink="/projects">
          <mat-card-header>
            <mat-icon class="text-5xl text-blue-500 mb-4">folder</mat-icon>
          </mat-card-header>
          <mat-card-content>
            <h2 class="text-2xl font-bold mb-2">Projects</h2>
            <p class="text-gray-600">Manage your projects</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary">View Projects</button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="hover:shadow-lg transition-shadow cursor-pointer" routerLink="/tasks">
          <mat-card-header>
            <mat-icon class="text-5xl text-green-500 mb-4">assignment</mat-icon>
          </mat-card-header>
          <mat-card-content>
            <h2 class="text-2xl font-bold mb-2">Tasks</h2>
            <p class="text-gray-600">Manage all your tasks</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary">View Tasks</button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="hover:shadow-lg transition-shadow">
          <mat-card-header>
            <mat-icon class="text-5xl text-purple-500 mb-4">analytics</mat-icon>
          </mat-card-header>
          <mat-card-content>
            <h2 class="text-2xl font-bold mb-2">Analytics</h2>
            <p class="text-gray-600">Coming soon...</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: calc(100vh - 64px);
      background-color: #f5f5f5;
    }
    
    mat-card {
      text-align: center;
    }
    
    mat-card-header {
      display: flex;
      justify-content: center;
      padding-top: 24px;
    }
  `]
})
export class DashboardComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}