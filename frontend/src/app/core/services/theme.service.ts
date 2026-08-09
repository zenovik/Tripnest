import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  isDarkMode = signal<boolean>(false);

  constructor() {
    const saved = localStorage.getItem('wanderlust_theme');
    const isDark = saved ? saved === 'dark' : false;
    this.setTheme(isDark);
  }

  toggleTheme() {
    this.setTheme(!this.isDarkMode());
  }

  setTheme(isDark: boolean) {
    this.isDarkMode.set(isDark);
    localStorage.setItem('wanderlust_theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
    } else {
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
    }
  }
}
