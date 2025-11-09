import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { ProjectService, Project } from '../../services/project.service';
import { ProjectDialogComponent } from './project-dialog.component';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatMenuModule,
  ],
  template: `
    <div class="container mx-auto p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Projects</h1>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          New Project
        </button>
      </div>

      @if (loading()) {
        <div class="text-center py-8">Loading projects...</div>
      } @else if (projects().length === 0) {
        <div class="text-center py-12">
          <mat-icon class="text-6xl text-gray-400 mb-4">folder_open</mat-icon>
          <p class="text-gray-500 mb-4">No projects yet</p>
          <button mat-raised-button color="primary" (click)="openCreateDialog()">
            Create Your First Project
          </button>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (project of projects(); track project.id) {
            <mat-card class="hover:shadow-lg transition-shadow cursor-pointer">
              <mat-card-header>
                <mat-card-title>{{ project.title }}</mat-card-title>
                <button mat-icon-button [matMenuTriggerFor]="menu" (click)="$event.stopPropagation()">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="openEditDialog(project)">
                    <mat-icon>edit</mat-icon>
                    <span>Edit</span>
                  </button>
                  <button mat-menu-item (click)="deleteProject(project)">
                    <mat-icon>delete</mat-icon>
                    <span>Delete</span>
                  </button>
                </mat-menu>
              </mat-card-header>
              <mat-card-content (click)="viewProject(project.id)">
                <p class="text-gray-600 mb-4">{{ project.description || 'No description' }}</p>
                <div class="flex items-center text-sm text-gray-500">
                  <mat-icon class="text-sm mr-1">task</mat-icon>
                  <span>{{ project._count?.tasks || 0 }} tasks</span>
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: calc(100vh - 64px);
      background-color: #f5f5f5;
    }
    
    mat-card {
      cursor: pointer;
    }
    
    mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  `]
})
export class ProjectsComponent implements OnInit {
  projects = signal<Project[]>([]);
  loading = signal(true);

  constructor(
    private projectService: ProjectService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading.set(true);
    this.projectService.getAll().subscribe({
      next: (projects) => {
        this.projects.set(projects);
        this.loading.set(false);
      },
      error: (error) => {
        this.snackBar.open('Failed to load projects', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ProjectDialogComponent, {
      width: '500px',
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProjects();
      }
    });
  }

  openEditDialog(project: Project): void {
    const dialogRef = this.dialog.open(ProjectDialogComponent, {
      width: '500px',
      data: project
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProjects();
      }
    });
  }

  deleteProject(project: Project): void {
    if (confirm(`Are you sure you want to delete "${project.title}"?`)) {
      this.projectService.delete(project.id).subscribe({
        next: () => {
          this.snackBar.open('Project deleted successfully', 'Close', { duration: 3000 });
          this.loadProjects();
        },
        error: () => {
          this.snackBar.open('Failed to delete project', 'Close', { duration: 3000 });
        }
      });
    }
  }

  viewProject(projectId: number): void {
    this.router.navigate(['/projects', projectId, 'tasks']);
  }
}
