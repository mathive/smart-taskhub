import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProjectService, Project } from '../../services/project.service';

@Component({
  selector: 'app-project-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Edit Project' : 'Create Project' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="projectForm" class="flex flex-col gap-4">
        <mat-form-field appearance="outline">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" placeholder="Enter project title" required>
          @if (projectForm.get('title')?.hasError('required') && projectForm.get('title')?.touched) {
            <mat-error>Title is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <textarea 
            matInput 
            formControlName="description" 
            placeholder="Enter project description"
            rows="4"
          ></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button 
        mat-raised-button 
        color="primary" 
        (click)="onSubmit()" 
        [disabled]="!projectForm.valid || loading"
      >
        {{ loading ? 'Saving...' : (data ? 'Update' : 'Create') }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 400px;
      padding: 20px 24px;
    }
  `]
})
export class ProjectDialogComponent {
  projectForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<ProjectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Project | null
  ) {
    this.projectForm = this.fb.group({
      title: [data?.title || '', Validators.required],
      description: [data?.description || '']
    });
  }

  onSubmit(): void {
    if (this.projectForm.valid) {
      this.loading = true;
      const formValue = this.projectForm.value;

      const operation = this.data
        ? this.projectService.update(this.data.id, formValue)
        : this.projectService.create(formValue);

      operation.subscribe({
        next: () => {
          this.snackBar.open(
            `Project ${this.data ? 'updated' : 'created'} successfully`,
            'Close',
            { duration: 3000 }
          );
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.snackBar.open(
            `Failed to ${this.data ? 'update' : 'create'} project`,
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
