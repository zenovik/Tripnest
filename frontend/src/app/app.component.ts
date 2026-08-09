import { Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './shared/components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  template: `
    <app-header *ngIf="showHeader()"></app-header>
    <main [class.auth-layout]="!showHeader()">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    main {
      min-height: calc(100vh - 74px);
    }
    main.auth-layout {
      min-height: 100vh;
    }
  `]
})
export class AppComponent {
  private router = inject(Router);

  showHeader(): boolean {
    const url = this.router.url;
    return !url.includes('/login') && !url.includes('/register');
  }
}
