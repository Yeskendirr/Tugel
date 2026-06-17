import { EquipmentStatus } from '../../types';
import './StatusBadge.css';

const LABELS: Record<EquipmentStatus, string> = {
  working:     'Жұмыс істейді',
  repair:      'Жөндеуде',
  written_off: 'Есептен шығарылды',
};

export default function StatusBadge({ status }: { status: EquipmentStatus }) {
  return <span className={`status-badge status-${status}`}>{LABELS[status]}</span>;
}
