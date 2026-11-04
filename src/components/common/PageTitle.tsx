import type { ReactNode } from 'react';

interface PageTitleProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageTitle({ eyebrow, title, subtitle, action }: PageTitleProps) {
  return (
    <div className="page-title-row">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && <div className="page-title-action">{action}</div>}
    </div>
  );
}
