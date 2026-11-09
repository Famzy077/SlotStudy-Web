import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, ChevronRight, FileText, GraduationCap, Search, Users } from 'lucide-react';
import api, { getErrorMessage, unwrap } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { useClickOutside } from '../../hooks/useClickOutside';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';

function getStat(value: unknown, path: string): string | undefined {
  const result = path.split('.').reduce<unknown>((current, key) => {
    if (!current || typeof current !== 'object') return undefined;
    return (current as Record<string, unknown>)[key];
  }, value);
  return result == null ? undefined : String(result);
}

function getNotifications(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value as Record<string, unknown>[];
  if (value && typeof value === 'object' && Array.isArray((value as { data?: unknown }).data)) {
    return (value as { data: Record<string, unknown>[] }).data;
  }
  return [];
}

export function AppShell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const logout = useAuth((state) => state.logout);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [topProfileOpen, setTopProfileOpen] = useState(false);
  const topProfileRef = useRef<HTMLDivElement>(null);

  const [theme, setTheme] = useState(() => localStorage.getItem('slotstudy-theme') || 'system');
  const dark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [toast, setToast] = useState('');

  const dashboardStats = useQuery({
    queryKey: ['dashboard', undefined],
    queryFn: async () => unwrap<Record<string, unknown>>((await api.get('/dashboard')).data),
  });

  const notificationsQuery = useQuery({
    queryKey: ['notifications', undefined],
    queryFn: async () =>
      unwrap<unknown>((await api.get('/notifications', { params: { limit: 10 } })).data),
  });

  const streak = getStat(dashboardStats.data, 'streak.current');
  const xp = getStat(dashboardStats.data, 'xp.total');
  const notifications = getNotifications(notificationsQuery.data);
  const hasUnreadNotifications = notifications.some(
    (notification) => notification.isRead === false,
  );

  const title =
    pathname === '/dashboard'
      ? 'Dashboard'
      : pathname.startsWith('/courses/')
      ? 'Course space'
      : pathname.startsWith('/summaries/')
      ? 'Study summary'
      : pathname.startsWith('/study-buddy')
      ? 'Study buddy'
      : pathname.startsWith('/study-room')
      ? 'AI study room'
      : pathname.startsWith('/quizzes/')
      ? 'Quiz space'
      : pathname.split('/')[1]?.replaceAll('-', ' ') || 'Dashboard';

  useClickOutside(topProfileRef, () => setTopProfileOpen(false), topProfileOpen);

  useEffect(() => {
    if (dashboardStats.data) {
      const serverUser = (dashboardStats.data.user || {}) as Record<string, unknown>;
      const serverAvatar = (serverUser.avatarUrl || dashboardStats.data.avatarUrl) as
        | string
        | null
        | undefined;
      const serverUniversity = (serverUser.university || dashboardStats.data.university) as
        | string
        | null
        | undefined;
      const serverName = (serverUser.name || dashboardStats.data.name) as
        | string
        | null
        | undefined;

      const current = useAuth.getState().user;
      if (
        current &&
        ((serverAvatar && current.avatarUrl !== serverAvatar) ||
          (serverUniversity && current.university !== serverUniversity) ||
          (serverName && current.name !== serverName))
      ) {
        useAuth.setState((state) => ({
          user: state.user
            ? {
                ...state.user,
                ...(serverAvatar ? { avatarUrl: serverAvatar } : {}),
                ...(serverUniversity ? { university: serverUniversity } : {}),
                ...(serverName ? { name: serverName } : {}),
              }
            : state.user,
        }));
      }
    }
  }, [dashboardStats.data]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('slotstudy-theme', theme);
  }, [dark, theme]);

  useEffect(() => {
    const handleThemeChange = (event: Event) => setTheme((event as CustomEvent<string>).detail);
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'slotstudy-theme' && event.newValue) setTheme(event.newValue);
    };
    window.addEventListener('slotstudy-theme-change', handleThemeChange);
    window.addEventListener('storage', handleStorageChange);
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (theme === 'system') document.documentElement.classList.toggle('dark', media.matches);
    };
    media.addEventListener('change', handleSystemThemeChange);
    return () => {
      window.removeEventListener('slotstudy-theme-change', handleThemeChange);
      window.removeEventListener('storage', handleStorageChange);
      media.removeEventListener('change', handleSystemThemeChange);
    };
  }, [theme]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setSidebarOpen(false);
        setProfileOpen(false);
        setTopProfileOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  async function handleLogout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      setToast(`Signed out locally. ${getErrorMessage(error)}`);
      window.setTimeout(() => setToast(''), 4500);
    } finally {
      logout();
      navigate('/', { replace: true });
    }
  }

  function performSearch(value: string) {
    const query = value.trim();
    if (!query) return;
    navigate(`/courses?search=${encodeURIComponent(query)}`);
    setSearchOpen(false);
    setSearchValue('');
  }

  return (
    <div className="app-shell">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        hasUnreadNotifications={hasUnreadNotifications}
        profileOpen={profileOpen}
        setProfileOpen={setProfileOpen}
        onLogout={handleLogout}
      />

      <div className="main-column">
        <Topbar
          title={title}
          streak={streak}
          xp={xp}
          dark={dark}
          setTheme={setTheme}
          hasUnreadNotifications={hasUnreadNotifications}
          onOpenMenu={() => setSidebarOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          topProfileOpen={topProfileOpen}
          setTopProfileOpen={setTopProfileOpen}
          topProfileRef={topProfileRef}
          onLogout={handleLogout}
        />

        <main className="page-content">
          <Outlet />
        </main>

        <footer className="app-footer">
          <span>Made for your next big idea.</span>
          <span>
            <span className="footer-heart">✳</span> Keep showing up
          </span>
        </footer>
      </div>

      <MobileNav
        onItemClick={() => {
          setTopProfileOpen(false);
          setSidebarOpen(false);
        }}
      />

      {searchOpen && (
        <div
          className="overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSearchOpen(false);
          }}
        >
          <div className="search-dialog">
            <div className="search-dialog-input">
              <Search size={19} />
              <input
                autoFocus
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') performSearch(searchValue);
                }}
                placeholder="Search courses, summaries and materials…"
              />
              <button onClick={() => setSearchOpen(false)}>
                <kbd>ESC</kbd>
              </button>
            </div>
            <div className="search-dialog-hint">
              <span>QUICK LINKS</span>
              <button
                onClick={() => {
                  navigate('/courses');
                  setSearchOpen(false);
                }}
              >
                <BookOpen size={15} /> My courses <ChevronRight size={14} />
              </button>
              <button
                onClick={() => {
                  navigate('/ai');
                  setSearchOpen(false);
                }}
              >
                <FileText size={15} /> Study briefs <ChevronRight size={14} />
              </button>
              <button
                onClick={() => {
                  navigate('/study-buddy');
                  setSearchOpen(false);
                }}
              >
                <Users size={15} /> Study buddy <ChevronRight size={14} />
              </button>
              <button
                onClick={() => {
                  navigate('/study-room');
                  setSearchOpen(false);
                }}
              >
                <GraduationCap size={15} /> Study room <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast-message">{toast}</div>}
    </div>
  );
}
