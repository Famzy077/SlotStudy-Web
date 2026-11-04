import { Link, useLocation } from 'react-router-dom';
import {
  Activity, Bell, BookOpen, BookOpenCheck, BrainCircuit, ChevronDown, ChevronRight,
  Compass, House, LogOut, Settings, Sparkles, UserRound, X,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import BrandLogo from '../common/BrandLogo';

export const navigationLinks = [
  {
    title: 'Overview',
    links: [
      { name: 'Dashboard', to: '/dashboard', icon: House },
      { name: 'My courses', to: '/courses', icon: BookOpen },
    ],
  },
  {
    title: 'Study tools',
    links: [
      { name: 'AI summaries', to: '/ai', icon: Sparkles },
      { name: 'Study buddy', to: '/study-room', icon: BrainCircuit },
      { name: 'Practice quizzes', to: '/quizzes', icon: BookOpenCheck },
    ],
  },
  {
    title: 'Your journey',
    links: [
      { name: 'Progress', to: '/progress', icon: Activity },
      { name: 'Explore', to: '/help', icon: Compass },
    ],
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  hasUnreadNotifications: boolean;
  profileOpen: boolean;
  setProfileOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  onLogout: () => void;
}

export function Sidebar({
  open,
  onClose,
  hasUnreadNotifications,
  profileOpen,
  setProfileOpen,
  onLogout,
}: SidebarProps) {
  const { pathname } = useLocation();
  const user = useAuth((state) => state.user);

  return (
    <>
      {open && (
        <button
          className="mobile-backdrop"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <Link to="/dashboard" className="brand-lockup">
            <BrandLogo />
          </Link>
          <button
            className="icon-button mobile-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-label">
          YOUR WORKSPACE <span className="version-pill">BETA</span>
        </div>

        <nav className="sidebar-nav">
          {navigationLinks.map((section) => (
            <div className="nav-section" key={section.title}>
              <p>{section.title}</p>
              {section.links.map(({ name, to, icon: Icon }) => {
                const active =
                  pathname === to || (to !== '/dashboard' && pathname.startsWith(`${to}/`));
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`nav-link ${active ? 'nav-active' : ''}`}
                    onClick={onClose}
                  >
                    <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                    <span>{name}</span>
                    {name === 'Study buddy' && <span className="nav-new">AI</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <Link to="/subscription" className="plan-card">
            <div className="plan-icon">
              <Sparkles size={16} />
            </div>
            <div>
              <b>Subscription</b>
              <span>View your current plan</span>
            </div>
            <ChevronRight size={15} />
          </Link>

          <Link
            to="/notifications"
            className={`nav-link ${pathname === '/notifications' ? 'nav-active' : ''}`}
            onClick={onClose}
          >
            <Bell size={18} />
            <span>Notifications</span>
            {hasUnreadNotifications && <span className="notification-dot" />}
          </Link>

          <button
            className="profile-tile"
            onClick={() => setProfileOpen((prev) => !prev)}
          >
            <span className="avatar">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="avatar-img" />
              ) : (
                (user?.name || 'U').slice(0, 1).toUpperCase()
              )}
            </span>
            <span className="profile-identity">
              <b>{user?.name || 'Your profile'}</b>
              <small>{user?.email || ''}</small>
            </span>
            <ChevronDown size={16} />
          </button>

          {profileOpen && (
            <div className="profile-menu">
              <Link to="/profile" onClick={() => { setProfileOpen(false); onClose(); }}>
                <UserRound size={16} /> My profile
              </Link>
              <Link to="/settings" onClick={() => { setProfileOpen(false); onClose(); }}>
                <Settings size={16} /> Settings
              </Link>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  onLogout();
                }}
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
