import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from "./components/navbar/navbar";
import { LoaderComponent } from './shared/components/loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    Navbar,
    LoaderComponent
],
  styleUrls: ['./app.scss'],
  templateUrl: './app.html',
  styles: [`
    .flex-1 { flex: 1; }
  `]
})
export class App {
  constructor() {}
}
