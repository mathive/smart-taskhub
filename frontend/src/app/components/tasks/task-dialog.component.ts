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
  templateUrl: './task-dialog.component.html',
  styleUrl: './task-dialog.component.scss'
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
