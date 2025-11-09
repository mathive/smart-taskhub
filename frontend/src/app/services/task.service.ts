import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

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
  project?: {
    id: number;
    title: string;
  };
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  projectId: number;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly API_URL = 'http://localhost:3000/tasks';
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadTasks(projectId?: number): void {
    this.getAll(projectId).subscribe(tasks => {
      this.tasksSubject.next(tasks);
    });
  }

  getAll(projectId?: number): Observable<Task[]> {
    const url = projectId ? `${this.API_URL}?projectId=${projectId}` : this.API_URL;
    return this.http.get<Task[]>(url);
  }

  getOne(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.API_URL}/${id}`);
  }

  getStats(projectId?: number): Observable<TaskStats> {
    const url = projectId ? `${this.API_URL}/stats?projectId=${projectId}` : `${this.API_URL}/stats`;
    return this.http.get<TaskStats>(url);
  }

  create(data: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(this.API_URL, data).pipe(
      tap(() => this.loadTasks())
    );
  }

  update(id: number, data: UpdateTaskDto): Observable<Task> {
    return this.http.patch<Task>(`${this.API_URL}/${id}`, data).pipe(
      tap(() => this.loadTasks())
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`).pipe(
      tap(() => this.loadTasks())
    );
  }
}
