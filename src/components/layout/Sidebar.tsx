import { Link, useLocation } from 'react-router-dom';
import {
  Activity, Bell, BookOpen, BookOpenCheck, ChevronDown, ChevronRight,
  Compass, FileText, GraduationCap, House, LogOut, Settings, ShieldCheck, UserRound, Users, X,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import BrandLogo from '../common/BrandLogo';

export interface NavLinkItem {
  name: string;
  to: string;
  icon: typeof House;
  badge?: string;
  subtitle?: string;
  description?: string;
}

export interface NavSection {
  title: string;
  links: NavLinkItem[];
}

export const navigationLinks: NavSection[] = [
  {
    title: 'Overview',
    links: [
      { name: 'Dashboard', to: '/dashboard', icon: House, description: 'Overview of your learning progress and daily tasks' },
      { name: 'My courses', to: '/courses', icon: BookOpen, description: 'Your enrolled courses and study modules' },
    ],
  },
  {
    title: 'Study tools',
    links: [
      {
        name: 'Study briefs',
        to: '/ai',
        icon: FileText,
        subtitle: 'Instant summaries & takeaways',
        description: 'Study briefs: Instant course summaries, key exam concepts & cheat-sheets',
      },
      {
        name: 'Study buddy',
        to: '/study-buddy',
        icon: Users,
        badge: 'NEW',
        subtitle: 'Peer revision & accountability',
        description: 'Study buddy: Quick conversational revision, coursemate discovery & study accountability',
      },
      {
        name: 'Study room',
        to: '/study-room',
        icon: GraduationCap,
        badge: 'LIVE',
        subtitle: 'Deep-dive Q&A with your PDFs',
        description: 'Study room: Deep-dive course Q&A grounded in your uploaded PDFs and lecture notes',
      },
      {
        name: 'Practice quizzes',
        to: '/quizzes',
        icon: BookOpenCheck,
        subtitle: 'Test your exam readiness',
        description: 'Practice quizzes: Practice exam questions generated from your study materials',
      },
    ],
  },
  {
    title: 'Your journey',
    links: [
      { name: 'Progress', to: '/progress', icon: Activity, description: 'Track your XP, study streaks, and quiz milestones' },
      { name: 'Explore', to: '/help', icon: Compass, description: 'Help guides, FAQs, and tips for studying effectively' },
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
              {section.links.map(({ name, to, icon: Icon, badge, subtitle, description }) => {
                const active =
                  pathname === to || (to !== '/dashboard' && pathname.startsWith(`${to}/`));
                return (
                  <Link
                    key={to}
                    to={to}
                    title={description || name}
                    className={`nav-link ${active ? 'nav-active' : ''} ${
                      subtitle ? 'nav-link-with-sub' : ''
                    }`}
                    onClick={onClose}
                  >
                    <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                    <div className="nav-link-content">
                      <div className="nav-link-title-row">
                        <span className="nav-link-name">{name}</span>
                        {badge && <span className="nav-new">{badge}</span>}
                      </div>
                      {subtitle && (
                        <span className="nav-link-subtitle">{subtitle}</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <Link to="/subscription" className="plan-card">
            <div className="plan-icon">
              <ShieldCheck size={16} />
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
            <div className="nav-link-content">
              <div className="nav-link-title-row">
                <span className="nav-link-name">Notifications</span>
                {hasUnreadNotifications && <span className="notification-dot" />}
              </div>
            </div>
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
