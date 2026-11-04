import type { ElementType, ReactNode } from 'react';
import { BookOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: ElementType;
  title: string;
  detail: string;
  action?: ReactNode;
}

export function EmptyState({
  icon: Icon = BookOpen,
  title,
  detail,
  action,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon size={22} />
      </span>
      <h3>{title}</h3>
      <p>{detail}</p>
      {action}
    </div>
  );
}
