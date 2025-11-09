import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoaderService } from '../services/loader.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    @if (loading$ | async) {
      <div class="loader-overlay">
        <mat-spinner diameter="48"></mat-spinner>
      </div>
    }
  `,
  styles: [`
    .loader-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }

    :host ::ng-deep mat-spinner circle {
      stroke: #fff;
    }
  `]
})
export class LoaderComponent {
  loading$: typeof this.loaderService.loading$;

  constructor(private loaderService: LoaderService) {
    this.loading$ = this.loaderService.loading$;
  }
}