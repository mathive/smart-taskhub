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
import { MatNativeDateModule } from '@angular/material/core';
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
    MatNativeDateModule,
  ],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
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
