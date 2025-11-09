import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {
  constructor(private snackBar: MatSnackBar) {}

  handleError(error: any, defaultMessage: string = 'An error occurred'): void {
    let message = defaultMessage;
    
    if (error.error?.message) {
      message = error.error.message;
    } else if (error.message) {
      message = error.message;
    }

    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }
}