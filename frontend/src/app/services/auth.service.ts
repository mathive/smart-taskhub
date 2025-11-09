import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface AuthResponse {
  token: string;
  user?: {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
    provider?: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000/auth';
  private readonly TOKEN_KEY = 'auth_token';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) {}

  private setSession(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.isAuthenticatedSubject.next(true);
  }

  get isAuthenticated$(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  get token(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  loginWithGoogle() {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(
      `${this.API_URL}/google`,
      'GoogleLogin',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    return new Promise<AuthResponse>((resolve, reject) => {
      window.addEventListener('message', (event) => {
        if (event.origin !== this.API_URL.replace('/auth', '') || !event.data?.type) {
          return;
        }

        if (event.data.type === 'oauth_response') {
          if (event.data.success) {
            const { token, user } = event.data.response;
            this.setSession(token);
            resolve({ token, user });
          } else {
            reject(new Error('Google authentication failed'));
          }
        }
      });
    });
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, data).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, data).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  googleLogin(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.API_URL}/google`).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  githubLogin(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.API_URL}/github`).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.isAuthenticatedSubject.next(false);
  }

  private handleAuthResponse(response: AuthResponse): void {
    if (response.token) {
      localStorage.setItem(this.TOKEN_KEY, response.token);
      this.isAuthenticatedSubject.next(true);
    }
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }
}