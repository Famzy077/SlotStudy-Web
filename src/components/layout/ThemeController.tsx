import { useEffect } from 'react';

export function ThemeController() {
  useEffect(() => {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = (theme: string) => {
      localStorage.setItem('slotstudy-theme', theme);
      const dark = theme === 'dark' || (theme === 'system' && systemTheme.matches);
      document.documentElement.classList.toggle('dark', dark);
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#111a29' : '#f8faff');
    };
    const handleThemeChange = (event: Event) => applyTheme((event as CustomEvent<string>).detail);
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'slotstudy-theme' && event.newValue) applyTheme(event.newValue);
    };
    const handleSystemThemeChange = () => {
      if ((localStorage.getItem('slotstudy-theme') || 'system') === 'system') applyTheme('system');
    };
    applyTheme(localStorage.getItem('slotstudy-theme') || 'system');
    window.addEventListener('slotstudy-theme-change', handleThemeChange);
    window.addEventListener('storage', handleStorageChange);
    systemTheme.addEventListener('change', handleSystemThemeChange);
    return () => {
      window.removeEventListener('slotstudy-theme-change', handleThemeChange);
      window.removeEventListener('storage', handleStorageChange);
      systemTheme.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  return null;
}
