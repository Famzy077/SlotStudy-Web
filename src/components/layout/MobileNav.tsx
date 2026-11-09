import { Link, useLocation } from 'react-router-dom';
import { BookOpen, FileText, House, UserRound, Users } from 'lucide-react';
import { useAuth } from '../../lib/auth';

interface MobileNavProps {
  onItemClick?: () => void;
}

export function MobileNav({ onItemClick }: MobileNavProps) {
  const { pathname } = useLocation();
  const user = useAuth((state) => state.user);

  const items = [
    { name: 'Home', to: '/dashboard', icon: House },
    { name: 'Courses', to: '/courses', icon: BookOpen },
    { name: 'Briefs', to: '/ai', icon: FileText },
    { name: 'Buddy', to: '/study-buddy', icon: Users },
    { name: 'Profile', to: '/profile', icon: UserRound },
  ];

  return (
    <nav className="mobile-nav">
      {items.map(({ name, to, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          className={pathname.startsWith(to) ? 'mobile-nav-active' : ''}
          onClick={onItemClick}
        >
          {name === 'Profile' ? (
            <span
              className={`mobile-nav-avatar-wrap ${
                pathname.startsWith('/profile') ? 'mobile-nav-avatar-active' : ''
              }`}
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Profile"
                  className="mobile-nav-avatar-img"
                />
              ) : (
                <span className="mobile-nav-avatar-initial">
                  {(user?.name || 'U').slice(0, 1).toUpperCase()}
                </span>
              )}
            </span>
          ) : (
            <Icon size={19} />
          )}
          <span>{name}</span>
        </Link>
      ))}
    </nav>
  );
}
