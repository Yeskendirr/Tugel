import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, CheckCircle, Wrench, Trash, Buildings,
} from '@phosphor-icons/react';
import AppLayout from '../../../components/AppLayout/AppLayout';
import StatCard from './components/StatCard/StatCard';
import StatusBadge from '../../../components/StatusBadge/StatusBadge';
import { getReportSummary, getEquipment, getRooms } from '../../../services/api';
import { ReportSummary, Equipment, Room } from '../../../types';
import './Dashboard.css';

export default function Dashboard() {
  const [summary, setSummary]   = useState<ReportSummary | null>(null);
  const [recent, setRecent]     = useState<Equipment[]>([]);
  const [rooms, setRooms]       = useState<Room[]>([]);

  useEffect(() => {
    getReportSummary().then(r => setSummary(r.data));
    getEquipment({ limit: '5', page: '1' }).then(r => setRecent(r.data.data));
    getRooms().then(r => setRooms(r.data));
  }, []);

  return (
    <AppLayout title="Негізгі тақтайша">
      <div className="dashboard">

        <div className="dashboard-stats">
          <StatCard label="Барлық жабдық"       value={summary?.total      ?? 0} icon={<Package size={22} />}      variant="default" />
          <StatCard label="Жұмыс істейді"        value={summary?.working    ?? 0} icon={<CheckCircle size={22} />}  variant="success" />
          <StatCard label="Жөндеуде"             value={summary?.repair     ?? 0} icon={<Wrench size={22} />}       variant="warning" />
          <StatCard label="Есептен шығарылды"    value={summary?.written_off ?? 0} icon={<Trash size={22} />}      variant="danger"  />
        </div>

        <div className="dashboard-body">
          <div className="card dashboard-recent">
            <div className="card-header">
              <h2>Соңғы қосылған жабдықтар</h2>
              <Link to="/equipment" className="btn btn-ghost btn-sm">Барлығын қарау</Link>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Атауы</th>
                    <th>Санат</th>
                    <th>Кабинет</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map(eq => (
                    <tr key={eq.id}>
                      <td>
                        <Link to={`/equipment/${eq.id}`} className="table-link">
                          {eq.name}
                        </Link>
                      </td>
                      <td>{eq.category_name ?? '—'}</td>
                      <td>{eq.room_name ?? '—'}</td>
                      <td><StatusBadge status={eq.status} /></td>
                    </tr>
                  ))}
                  {recent.length === 0 && (
                    <tr><td colSpan={4} className="empty-cell">Жабдықтар жоқ</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card dashboard-rooms">
            <div className="card-header">
              <h2>Кабинеттер</h2>
              <Buildings size={18} color="var(--color-text-muted)" />
            </div>
            <div className="card-body">
              <ul className="rooms-list">
                {rooms.map(room => (
                  <li key={room.id} className="rooms-list-item">
                    <span className="rooms-list-name">{room.name}</span>
                    <span className="rooms-list-count">{room.equipment_count ?? 0}</span>
                  </li>
                ))}
                {rooms.length === 0 && (
                  <li className="rooms-list-empty">Кабинеттер жоқ</li>
                )}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
