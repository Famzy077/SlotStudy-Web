import type { ElementType } from 'react';

interface StatCardProps {
  icon: ElementType;
  label: string;
  value: string;
  note: string;
  color: string;
}

export function StatCard({ icon: Icon, label, value, note, color }: StatCardProps) {
  return (
    <div className="stat-card">
      <span className={`stat-icon ${color}`}>
        <Icon size={18} />
      </span>
      <span className="stat-label">{label}</span>
      <b className={`stat-value ${value.length > 9 ? 'stat-value-long' : ''}`}>
        {value}
      </b>
      <span className="stat-note">{note}</span>
    </div>
  );
}
