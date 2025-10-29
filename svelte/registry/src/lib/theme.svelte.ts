import { browser } from '$app/environment';

class ThemeManager {
  isDark = $state(false);

  constructor() {
    if (browser) {
      this.initialize();
    }
  }

  private initialize() {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') {
      this.isDark = true;
      document.documentElement.classList.add('dark');
    } else if (stored === 'light') {
      this.isDark = false;
      document.documentElement.classList.remove('dark');
    } else {
      this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (this.isDark) {
        document.documentElement.classList.add('dark');
      }
    }
  }

  toggle() {
    this.isDark = !this.isDark;
    if (this.isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
}

export const themeManager = new ThemeManager();
