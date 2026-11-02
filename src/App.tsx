import { useEffect, useState } from 'react';
import { Link, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Activity, Bell, BookOpen, BookOpenCheck, BrainCircuit, ChevronDown, ChevronRight, Command,
  Compass, Flame, House, LogOut, Menu, Moon, Search, Settings, Sparkles, Sun, Trophy, UserRound, X,
} from 'lucide-react';
import { AcademicSetupPage, ForgotPasswordPage, LoginPage, RegisterPage, VerifyOtpPage } from './AuthPages';
import { useAuth } from './lib/auth';
import api, { getErrorMessage, unwrap } from './lib/api';
import { DashboardPage, WorkspacePage } from './WorkspacePages';
import BrandLogo from './BrandLogo';

const links = [
  { title: 'Overview', links: [{ name: 'Dashboard', to: '/dashboard', icon: House }, { name: 'My courses', to: '/courses', icon: BookOpen }] },
  { title: 'Study tools', links: [{ name: 'AI summaries', to: '/ai', icon: Sparkles }, { name: 'Study buddy', to: '/study-room', icon: BrainCircuit }, { name: 'Practice quizzes', to: '/quizzes', icon: BookOpenCheck }] },
  { title: 'Your journey', links: [{ name: 'Progress', to: '/progress', icon: Activity }, { name: 'Explore', to: '/help', icon: Compass }] },
];

function ProtectedRoute() {
  const token = useAuth((state) => state.accessToken);
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

function AppShell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = useAuth((state) => state.user);
  const logout = useAuth((state) => state.logout);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('slotstudy-theme') || 'system');
  const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [toast, setToast] = useState('');
  const dashboardStats = useQuery({
    queryKey: ['dashboard', undefined],
    queryFn: async () => unwrap<Record<string, unknown>>((await api.get('/dashboard')).data),
  });
  const notificationsQuery = useQuery({
    queryKey: ['notifications', undefined],
    queryFn: async () => unwrap<unknown>((await api.get('/notifications', { params: { limit: 10 } })).data),
  });
  const streak = getStat(dashboardStats.data, 'streak.current');
  const xp = getStat(dashboardStats.data, 'xp.total');
  const notifications = getNotifications(notificationsQuery.data);
  const hasUnreadNotifications = notifications.some((notification) => notification.isRead === false);
  const title = pathname === '/dashboard' ? 'Dashboard'
    : pathname.startsWith('/courses/') ? 'Course space'
      : pathname.startsWith('/summaries/') ? 'Study summary'
        : pathname.startsWith('/study-room') ? 'Study buddy'
          : pathname.startsWith('/quizzes/') ? 'Quiz space'
            : pathname.split('/')[1]?.replaceAll('-', ' ') || 'Dashboard';

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
      if (event.key === 'Escape') { setSearchOpen(false); setSidebarOpen(false); setProfileOpen(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  async function handleLogout() {
    try { await api.post('/auth/logout'); }
    catch (error) { setToast(`Signed out locally. ${getErrorMessage(error)}`); window.setTimeout(() => setToast(''), 4500); }
    finally { logout(); navigate('/login', { replace: true }); }
  }
  function performSearch(value: string) {
    const query = value.trim();
    if (!query) return;
    navigate(`/courses?search=${encodeURIComponent(query)}`);
    setSearchOpen(false);
    setSearchValue('');
  }

  return <div className="app-shell">
    {sidebarOpen && <button className="mobile-backdrop" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
    <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-brand">
        <Link to="/dashboard" className="brand-lockup"><BrandLogo /></Link>
        <button className="icon-button mobile-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu"><X size={18} /></button>
      </div>
      <div className="sidebar-label">YOUR WORKSPACE <span className="version-pill">BETA</span></div>
      <nav className="sidebar-nav">
        {links.map((section) => <div className="nav-section" key={section.title}><p>{section.title}</p>{section.links.map(({ name, to, icon: Icon }) => {
          const active = pathname === to || (to !== '/dashboard' && pathname.startsWith(`${to}/`));
          return <Link key={to} to={to} className={`nav-link ${active ? 'nav-active' : ''}`} onClick={() => setSidebarOpen(false)}><Icon size={18} strokeWidth={active ? 2.2 : 1.8} /><span>{name}</span>{name === 'Study buddy' && <span className="nav-new">AI</span>}</Link>;
        })}</div>)}
      </nav>
      <div className="sidebar-bottom">
        <Link to="/subscription" className="plan-card"><div className="plan-icon"><Sparkles size={16} /></div><div><b>Subscription</b><span>View your current plan</span></div><ChevronRight size={15} /></Link>
        <Link to="/notifications" className={`nav-link ${pathname === '/notifications' ? 'nav-active' : ''}`}><Bell size={18} /><span>Notifications</span>{hasUnreadNotifications && <span className="notification-dot" />}</Link>
        <button className="profile-tile" onClick={() => setProfileOpen(!profileOpen)}>
          <span className="avatar">{(user?.name || 'U').slice(0, 1).toUpperCase()}</span><span className="profile-identity"><b>{user?.name || 'Your profile'}</b><small>{user?.email || ''}</small></span><ChevronDown size={16} />
        </button>
        {profileOpen && <div className="profile-menu"><Link to="/profile" onClick={() => setProfileOpen(false)}><UserRound size={16} /> My profile</Link><Link to="/settings" onClick={() => setProfileOpen(false)}><Settings size={16} /> Settings</Link><button onClick={handleLogout}><LogOut size={16} /> Sign out</button></div>}
      </div>
    </aside>
    <div className="main-column">
      <header className="topbar">
        <div className="topbar-left"><button className="icon-button menu-button" onClick={() => setSidebarOpen(true)} aria-label="Open menu"><Menu size={20} /></button><div className="breadcrumb"><span>Workspace</span><ChevronRight size={14} /><b>{title}</b></div></div>
        <div className="topbar-actions">
          <button className="search-trigger" onClick={() => setSearchOpen(true)}><Search size={16} /><span>Search your space…</span><kbd><Command size={11} /> K</kbd></button>
          <div className="top-stat streak-stat"><span className="top-stat-icon flame-icon"><Flame size={16} fill="currentColor" /></span><b>{streak ?? '—'}</b><small>day streak</small></div>
          <div className="top-stat xp-stat"><span className="top-stat-icon xp-icon"><Trophy size={15} /></span><b>{xp ?? '—'}</b><small>XP</small></div>
          <button className="icon-button theme-toggle" onClick={() => { const nextTheme = dark ? 'light' : 'dark'; setTheme(nextTheme); window.dispatchEvent(new CustomEvent('slotstudy-theme-change', { detail: nextTheme })); }} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
          <Link className="icon-button notification-button" to="/notifications" aria-label={hasUnreadNotifications ? 'Notifications, unread items' : 'Notifications'}><Bell size={18} />{hasUnreadNotifications && <span className="notification-dot" />}</Link>
          <button className="top-avatar" onClick={() => setProfileOpen(!profileOpen)} aria-label="Open profile">{(user?.name || 'U').slice(0, 1).toUpperCase()}</button>
        </div>
      </header>
      <main className="page-content"><Outlet /></main>
      <footer className="app-footer"><span>Made for your next big idea.</span><span><span className="footer-heart">✳</span> Keep showing up</span></footer>
    </div>
    <nav className="mobile-nav">
      {[{ name: 'Home', to: '/dashboard', icon: House }, { name: 'Courses', to: '/courses', icon: BookOpen }, { name: 'AI', to: '/ai', icon: Sparkles }, { name: 'Buddy', to: '/study-room', icon: BrainCircuit }, { name: 'Profile', to: '/profile', icon: UserRound }].map(({ name, to, icon: Icon }) => <Link key={to} to={to} className={pathname.startsWith(to) ? 'mobile-nav-active' : ''}><Icon size={19} /><span>{name}</span></Link>)}
    </nav>
    {searchOpen && <div className="overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setSearchOpen(false); }}><div className="search-dialog"><div className="search-dialog-input"><Search size={19} /><input autoFocus value={searchValue} onChange={(event) => setSearchValue(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') performSearch(searchValue); }} placeholder="Search courses, summaries and materials…" /><button onClick={() => setSearchOpen(false)}><kbd>ESC</kbd></button></div><div className="search-dialog-hint"><span>QUICK LINKS</span><button onClick={() => { navigate('/courses'); setSearchOpen(false); }}><BookOpen size={15} /> My courses <ChevronRight size={14} /></button><button onClick={() => { navigate('/ai'); setSearchOpen(false); }}><Sparkles size={15} /> AI summaries <ChevronRight size={14} /></button><button onClick={() => { navigate('/study-room'); setSearchOpen(false); }}><BrainCircuit size={15} /> Study buddy <ChevronRight size={14} /></button></div></div></div>}
    {toast && <div className="toast-message">{toast}</div>}
  </div>;
}

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

function App() {
  return <><ThemeController /><Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/verify-otp" element={<VerifyOtpPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password" element={<ForgotPasswordPage />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/onboarding/academic-setup" element={<AcademicSetupPage />} />
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/courses" element={<WorkspacePage />} />
        <Route path="/courses/:id" element={<WorkspacePage />} />
        <Route path="/materials/upload" element={<WorkspacePage />} />
        <Route path="/ai" element={<WorkspacePage />} />
        <Route path="/summaries/:id" element={<WorkspacePage />} />
        <Route path="/study-room" element={<WorkspacePage />} />
        <Route path="/study-room/:id" element={<WorkspacePage />} />
        <Route path="/quizzes" element={<WorkspacePage />} />
        <Route path="/quizzes/:id" element={<WorkspacePage />} />
        <Route path="/quizzes/:id/result" element={<WorkspacePage />} />
        <Route path="/progress" element={<WorkspacePage />} />
        <Route path="/notifications" element={<WorkspacePage />} />
        <Route path="/profile" element={<WorkspacePage />} />
        <Route path="/settings" element={<WorkspacePage />} />
        <Route path="/subscription" element={<WorkspacePage />} />
        <Route path="/help" element={<WorkspacePage />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes></>;
}

function ThemeController() {
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

export default App;
