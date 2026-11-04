import { type RefObject } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell, ChevronRight, Command, Flame, GraduationCap, LogOut,
  Menu, Moon, Search, Settings, Sun, Trophy, UserRound,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';

interface TopbarProps {
  title: string;
  streak?: string;
  xp?: string;
  dark: boolean;
  setTheme: (theme: string) => void;
  hasUnreadNotifications: boolean;
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  topProfileOpen: boolean;
  setTopProfileOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  topProfileRef: RefObject<HTMLDivElement | null>;
  onLogout: () => void;
}

export function Topbar({
  title,
  streak,
  xp,
  dark,
  setTheme,
  hasUnreadNotifications,
  onOpenMenu,
  onOpenSearch,
  topProfileOpen,
  setTopProfileOpen,
  topProfileRef,
  onLogout,
}: TopbarProps) {
  const user = useAuth((state) => state.user);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="icon-button menu-button"
          onClick={onOpenMenu}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className="breadcrumb">
          <span>Workspace</span>
          <ChevronRight size={14} />
          <b>{title}</b>
        </div>
      </div>

      <div className="topbar-actions">
        <button className="search-trigger" onClick={onOpenSearch}>
          <Search size={16} />
          <span>Search your space…</span>
          <kbd>
            <Command size={11} /> K
          </kbd>
        </button>

        <div className="top-stat streak-stat">
          <span className="top-stat-icon flame-icon">
            <Flame size={16} fill="currentColor" />
          </span>
          <b>{streak ?? '—'}</b>
          <small>day streak</small>
        </div>

        <div className="top-stat xp-stat">
          <span className="top-stat-icon xp-icon">
            <Trophy size={15} />
          </span>
          <b>{xp ?? '—'}</b>
          <small>XP</small>
        </div>

        <button
          className="icon-button theme-toggle"
          onClick={() => {
            const nextTheme = dark ? 'light' : 'dark';
            setTheme(nextTheme);
            window.dispatchEvent(
              new CustomEvent('slotstudy-theme-change', { detail: nextTheme }),
            );
          }}
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <Link
          className="icon-button notification-button"
          to="/notifications"
          aria-label={
            hasUnreadNotifications
              ? 'Notifications, unread items'
              : 'Notifications'
          }
        >
          <Bell size={18} />
          {hasUnreadNotifications && <span className="notification-dot" />}
        </Link>

        {/* Mobile & Desktop Profile Avatar with Accessible Dropdown */}
        <div className="topbar-profile-container" ref={topProfileRef}>
          <button
            className="top-avatar"
            onClick={() => setTopProfileOpen((open) => !open)}
            aria-label="Open profile menu"
            aria-expanded={topProfileOpen}
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user?.name || 'Profile'}
                className="top-avatar-img"
              />
            ) : (
              (user?.name || 'U').slice(0, 1).toUpperCase()
            )}
          </button>

          {topProfileOpen && (
            <div className="topbar-profile-dropdown">
              <div className="topbar-profile-meta">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="topbar-profile-dropdown-img"
                  />
                ) : (
                  <span className="topbar-profile-dropdown-fallback">
                    {(user?.name || 'U').slice(0, 1).toUpperCase()}
                  </span>
                )}
                <div className="topbar-profile-text">
                  <b>{user?.name || 'Student'}</b>
                  <small>{user?.email || ''}</small>
                  {user?.university && (
                    <span className="topbar-profile-uni">
                      <GraduationCap size={11} /> {user.university}
                    </span>
                  )}
                </div>
              </div>

              <div className="dropdown-divider" />

              <Link to="/profile" onClick={() => setTopProfileOpen(false)}>
                <UserRound size={15} /> My profile
              </Link>
              <Link to="/settings" onClick={() => setTopProfileOpen(false)}>
                <Settings size={15} /> Settings
              </Link>

              <div className="dropdown-divider" />

              <button
                className="dropdown-signout"
                onClick={() => {
                  setTopProfileOpen(false);
                  onLogout();
                }}
              >
                <LogOut size={15} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
