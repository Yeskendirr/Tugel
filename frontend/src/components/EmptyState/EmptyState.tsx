import './EmptyState.css';

export default function EmptyState({ message = 'Деректер табылмады' }: { message?: string }) {
  return <div className="empty-state">{message}</div>;
}
