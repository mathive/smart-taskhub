import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

export interface Project {
  id: number;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  tasks?: Task[];
  _count?: {
    tasks: number;
  };
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  projectId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  title: string;
  description?: string;
}

export interface UpdateProjectDto {
  title?: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly API_URL = 'http://localhost:3000/projects';
  private projectsSubject = new BehaviorSubject<Project[]>([]);
  public projects$ = this.projectsSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadProjects(): void {
    this.getAll().subscribe(projects => {
      this.projectsSubject.next(projects);
    });
  }

  getAll(): Observable<Project[]> {
    return this.http.get<Project[]>(this.API_URL);
  }

  getOne(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.API_URL}/${id}`);
  }

  create(data: CreateProjectDto): Observable<Project> {
    return this.http.post<Project>(this.API_URL, data).pipe(
      tap(() => this.loadProjects())
    );
  }

  update(id: number, data: UpdateProjectDto): Observable<Project> {
    return this.http.patch<Project>(`${this.API_URL}/${id}`, data).pipe(
      tap(() => this.loadProjects())
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`).pipe(
      tap(() => this.loadProjects())
    );
  }
}
