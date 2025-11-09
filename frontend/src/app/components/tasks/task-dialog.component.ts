import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TaskService, Task } from '../../services/task.service';
import { ProjectService, Project } from '../../services/project.service';

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.task ? 'Edit Task' : 'Create Task' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="taskForm" class="flex flex-col gap-4">
        @if (!data.projectId) {
          <mat-form-field appearance="outline">
            <mat-label>Project</mat-label>
            <mat-select formControlName="projectId" required>
              @for (project of projects(); track project.id) {
                <mat-option [value]="project.id">{{ project.title }}</mat-option>
              }
            </mat-select>
            @if (taskForm.get('projectId')?.hasError('required') && taskForm.get('projectId')?.touched) {
              <mat-error>Project is required</mat-error>
            }
          </mat-form-field>
        }

        <mat-form-field appearance="outline">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" placeholder="Enter task title" required>
          @if (taskForm.get('title')?.hasError('required') && taskForm.get('title')?.touched) {
            <mat-error>Title is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <textarea 
            matInput 
            formControlName="description" 
            placeholder="Enter task description"
            rows="4"
          ></textarea>
        </mat-form-field>

        <div class="grid grid-cols-2 gap-4">
          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option value="pending">Pending</mat-option>
              <mat-option value="in_progress">In Progress</mat-option>
              <mat-option value="completed">Completed</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Priority</mat-label>
            <mat-select formControlName="priority">
              <mat-option value="low">Low</mat-option>
              <mat-option value="medium">Medium</mat-option>
              <mat-option value="high">High</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Due Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="dueDate">
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button 
        mat-raised-button 
        color="primary" 
        (click)="onSubmit()" 
        [disabled]="!taskForm.valid || loading"
      >
        {{ loading ? 'Saving...' : (data.task ? 'Update' : 'Create') }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 500px;
      padding: 20px 24px;
    }
  `]
})
export class TaskDialogComponent implements OnInit {
  taskForm: FormGroup;
  loading = false;
  projects = signal<Project[]>([]);

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private projectService: ProjectService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<TaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { task: Task | null; projectId: number | null }
  ) {
    const task = data.task;
    this.taskForm = this.fb.group({
      title: [task?.title || '', Validators.required],
      description: [task?.description || ''],
      status: [task?.status || 'pending'],
      priority: [task?.priority || 'medium'],
      dueDate: [task?.dueDate ? new Date(task.dueDate) : null],
      projectId: [data.projectId || task?.projectId || '', data.projectId ? [] : Validators.required]
    });
  }

  ngOnInit(): void {
    if (!this.data.projectId) {
      this.loadProjects();
    }
  }

  loadProjects(): void {
    this.projectService.getAll().subscribe({
      next: (projects) => this.projects.set(projects),
      error: () => this.snackBar.open('Failed to load projects', 'Close', { duration: 3000 })
    });
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      this.loading = true;
      const formValue = { ...this.taskForm.value };
      
      // Convert date to ISO string if present
      if (formValue.dueDate) {
        formValue.dueDate = new Date(formValue.dueDate).toISOString();
      }

      const operation = this.data.task
        ? this.taskService.update(this.data.task.id, formValue)
        : this.taskService.create(formValue);

      operation.subscribe({
        next: () => {
          this.snackBar.open(
            `Task ${this.data.task ? 'updated' : 'created'} successfully`,
            'Close',
            { duration: 3000 }
          );
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.snackBar.open(
            `Failed to ${this.data.task ? 'update' : 'create'} task`,
            'Close',
            { duration: 3000 }
          );
          this.loading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
