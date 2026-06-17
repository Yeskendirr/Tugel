import { ReactNode } from 'react';
import './StatCard.css';

interface Props {
  label: string;
  value: number;
  icon: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export default function StatCard({ label, value, icon, variant = 'default' }: Props) {
  return (
    <div className={`stat-card stat-card--${variant}`}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-body">
        <span className="stat-card-value">{value}</span>
        <span className="stat-card-label">{label}</span>
      </div>
    </div>
  );
}
