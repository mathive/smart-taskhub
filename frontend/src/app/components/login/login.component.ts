import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, AuthResponse, LoginRequest } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ErrorHandlingService } from '../../shared/error-handling.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';
import { LoaderService } from '../../shared/services/loader.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatCheckboxModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private errorHandling: ErrorHandlingService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private loaderService: LoaderService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // Register custom SVG icons
    this.matIconRegistry.addSvgIcon(
      'google',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/google.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'github',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/github.svg')
    );
  }

  async loginWithGoogle(): Promise<void> {
    this.loaderService.show();
    try {
      const response = await this.authService.loginWithGoogle();
      this.errorHandling.showSuccess(`Welcome${response.user?.name ? ' ' + response.user.name : ''}!`);
      if (response?.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      this.router.navigate(['/dashboard']);
    } catch (error) {
      if (error instanceof Error && error.message === 'Authentication cancelled') {
        this.errorHandling.handleError(error, 'Google login was cancelled');
      } else {
        this.errorHandling.handleError(error, 'Could not sign in with Google. Please try again.');
      }
    } finally {
      this.loaderService.hide();
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loaderService.show();
      const loginData: LoginRequest = this.loginForm.value;
      this.authService.login(loginData).subscribe({
        next: (response: AuthResponse) => {
          this.errorHandling.showSuccess('Login successful! Welcome back.');
          // Store user info if available
          if (response?.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
          }
          this.router.navigate(['/dashboard']);
          this.loaderService.hide();
        },
        error: (error: HttpErrorResponse) => {
          let errorMessage = 'Login failed. Please check your credentials.';
          
          if (error.status === 401) {
            errorMessage = 'Invalid email or password. Please try again.';
            this.loginForm.get('password')?.reset();
            this.loginForm.get('password')?.markAsTouched();
          } else if (error.status === 429) {
            errorMessage = 'Too many login attempts. Please try again later.';
            this.loginForm.disable();
            setTimeout(() => {
              this.loginForm.enable();
            }, 30000); // Re-enable form after 30 seconds
          } else if (error.status === 0) {
            errorMessage = 'Unable to connect to the server. Please check your internet connection.';
          }

          this.errorHandling.handleError(error, errorMessage);
          this.loaderService.hide();
        }
      });
    } else {
      // Handle invalid form
      this.loginForm.markAllAsTouched();
      const errors = [];
      
      if (this.loginForm.get('email')?.errors) {
        if (this.loginForm.get('email')?.errors?.['required']) {
          errors.push('Email is required');
        }
        if (this.loginForm.get('email')?.errors?.['email']) {
          errors.push('Please enter a valid email address');
        }
      }
      
      if (this.loginForm.get('password')?.errors?.['required']) {
        errors.push('Password is required');
      }

      if (errors.length > 0) {
        this.errorHandling.handleError(
          new Error(errors.join('\n')),
          'Please correct the following errors:'
        );
      }
    }
  }

  loginWithGithub(): void {
    this.loaderService.show();
    this.authService.githubLogin().subscribe({
      next: (response: AuthResponse) => {
        this.errorHandling.showSuccess(`Welcome${response.user?.name ? ' ' + response.user.name : ''}!`);
        this.router.navigate(['/dashboard']);
        this.loaderService.hide();
      },
      error: (error: HttpErrorResponse | Error) => {
        if (error instanceof Error && error.message === 'Authentication cancelled') {
          this.errorHandling.handleError(error, 'GitHub login was cancelled');
        } else {
          this.errorHandling.handleError(error, 'Could not sign in with GitHub. Please try again.');
        }
        this.loaderService.hide();
      }
    });
  }
}