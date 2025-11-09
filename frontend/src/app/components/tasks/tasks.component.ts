import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { TaskService, Task } from '../../services/task.service';
import { ProjectService, Project } from '../../services/project.service';
import { TaskDialogComponent } from './task-dialog.component';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatMenuModule,
    MatTabsModule,
  ],
  template: `
    <div class="container mx-auto p-6">
      <div class="flex justify-between items-center mb-6">
        <div>
          <button mat-icon-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1 class="text-3xl font-bold inline-block ml-4">
            {{ project()?.title || 'Tasks' }}
          </h1>
        </div>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          New Task
        </button>
      </div>

      <mat-tab-group>
        <mat-tab label="All Tasks ({{ tasks().length }})">
          <div class="py-4">
            <div class="grid grid-cols-1 gap-4">
              @for (task of tasks(); track task.id) {
                <mat-card class="hover:shadow-md transition-shadow">
                  <mat-card-content class="flex justify-between items-start">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-2">
                        <h3 class="text-lg font-semibold">{{ task.title }}</h3>
                        <mat-chip [class]="'status-' + task.status">
                          {{ task.status.replace('_', ' ') }}
                        </mat-chip>
                        <mat-chip [class]="'priority-' + task.priority">
                          {{ task.priority }}
                        </mat-chip>
                      </div>
                      <p class="text-gray-600 mb-2">{{ task.description || 'No description' }}</p>
                      @if (task.dueDate) {
                        <div class="text-sm text-gray-500">
                          <mat-icon class="text-sm align-middle">event</mat-icon>
                          Due: {{ task.dueDate | date }}
                        </div>
                      }
                    </div>
                    <button mat-icon-button [matMenuTriggerFor]="menu">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #menu="matMenu">
                      <button mat-menu-item (click)="openEditDialog(task)">
                        <mat-icon>edit</mat-icon>
                        <span>Edit</span>
                      </button>
                      <button mat-menu-item (click)="deleteTask(task)">
                        <mat-icon>delete</mat-icon>
                        <span>Delete</span>
                      </button>
                    </mat-menu>
                  </mat-card-content>
                </mat-card>
              }
              @if (tasks().length === 0) {
                <div class="text-center py-12">
                  <mat-icon class="text-6xl text-gray-400 mb-4">assignment</mat-icon>
                  <p class="text-gray-500 mb-4">No tasks yet</p>
                  <button mat-raised-button color="primary" (click)="openCreateDialog()">
                    Create Your First Task
                  </button>
                </div>
              }
            </div>
          </div>
        </mat-tab>
        
        <mat-tab label="Pending ({{ getPendingTasks().length }})">
          <div class="py-4">
            <div class="grid grid-cols-1 gap-4">
              @for (task of getPendingTasks(); track task.id) {
                <mat-card>
                  <mat-card-content>
                    <h3 class="text-lg font-semibold mb-2">{{ task.title }}</h3>
                    <p class="text-gray-600">{{ task.description || 'No description' }}</p>
                  </mat-card-content>
                </mat-card>
              }
            </div>
          </div>
        </mat-tab>
        
        <mat-tab label="In Progress ({{ getInProgressTasks().length }})">
          <div class="py-4">
            <div class="grid grid-cols-1 gap-4">
              @for (task of getInProgressTasks(); track task.id) {
                <mat-card>
                  <mat-card-content>
                    <h3 class="text-lg font-semibold mb-2">{{ task.title }}</h3>
                    <p class="text-gray-600">{{ task.description || 'No description' }}</p>
                  </mat-card-content>
                </mat-card>
              }
            </div>
          </div>
        </mat-tab>
        
        <mat-tab label="Completed ({{ getCompletedTasks().length }})">
          <div class="py-4">
            <div class="grid grid-cols-1 gap-4">
              @for (task of getCompletedTasks(); track task.id) {
                <mat-card>
                  <mat-card-content>
                    <h3 class="text-lg font-semibold mb-2">{{ task.title }}</h3>
                    <p class="text-gray-600">{{ task.description || 'No description' }}</p>
                  </mat-card-content>
                </mat-card>
              }
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: calc(100vh - 64px);
      background-color: #f5f5f5;
    }
    
    .status-pending {
      background-color: #ffc107;
      color: #000;
    }
    
    .status-in_progress {
      background-color: #2196f3;
      color: #fff;
    }
    
    .status-completed {
      background-color: #4caf50;
      color: #fff;
    }
    
    .priority-low {
      background-color: #e0e0e0;
      color: #000;
    }
    
    .priority-medium {
      background-color: #ff9800;
      color: #fff;
    }
    
    .priority-high {
      background-color: #f44336;
      color: #fff;
    }
  `]
})
export class TasksComponent implements OnInit {
  tasks = signal<Task[]>([]);
  project = signal<Project | null>(null);
  projectId: number | null = null;

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['projectId']) {
        this.projectId = +params['projectId'];
        this.loadProject();
        this.loadTasks();
      } else {
        this.loadTasks();
      }
    });
  }

  loadProject(): void {
    if (this.projectId) {
      this.projectService.getOne(this.projectId).subscribe({
        next: (project) => this.project.set(project),
        error: () => this.snackBar.open('Failed to load project', 'Close', { duration: 3000 })
      });
    }
  }

  loadTasks(): void {
    this.taskService.getAll(this.projectId || undefined).subscribe({
      next: (tasks) => this.tasks.set(tasks),
      error: () => this.snackBar.open('Failed to load tasks', 'Close', { duration: 3000 })
    });
  }

  getPendingTasks(): Task[] {
    return this.tasks().filter(t => t.status === 'pending');
  }

  getInProgressTasks(): Task[] {
    return this.tasks().filter(t => t.status === 'in_progress');
  }

  getCompletedTasks(): Task[] {
    return this.tasks().filter(t => t.status === 'completed');
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '600px',
      data: { task: null, projectId: this.projectId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTasks();
      }
    });
  }

  openEditDialog(task: Task): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '600px',
      data: { task, projectId: this.projectId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTasks();
      }
    });
  }

  deleteTask(task: Task): void {
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      this.taskService.delete(task.id).subscribe({
        next: () => {
          this.snackBar.open('Task deleted successfully', 'Close', { duration: 3000 });
          this.loadTasks();
        },
        error: () => {
          this.snackBar.open('Failed to delete task', 'Close', { duration: 3000 });
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }
}
