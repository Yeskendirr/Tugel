import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CaretLeft, Printer } from '@phosphor-icons/react';
import AppLayout from '../../../../components/AppLayout/AppLayout';
import StatusBadge from '../../../../components/StatusBadge/StatusBadge';
import EmptyState from '../../../../components/EmptyState/EmptyState';
import { getRoomById } from '../../../../services/api';
import { RoomDetail as RoomDetailType } from '../../../../types';
import './RoomDetail.css';

export default function RoomDetail() {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const [room, setRoom] = useState<RoomDetailType | null>(null);

  useEffect(() => {
    if (id) getRoomById(parseInt(id)).then(r => setRoom(r.data));
  }, [id]);

  if (!room) return <AppLayout title="Кабинет"><div className="rd-loading">Жүктелуде...</div></AppLayout>;

  const totalPrice = room.equipment.reduce((s, e) => s + (Number(e.price) || 0), 0);

  return (
    <AppLayout title={room.name}>
      <div className="rd-page">

        <div className="card">
          <div className="card-header">
            <div className="rd-header-left">
              <button className="btn btn-ghost btn-sm no-print" onClick={() => navigate(-1)}>
                <CaretLeft size={14} /> Артқа
              </button>
              <div>
                <h2>{room.name}</h2>
                {room.building && <p className="rd-building">{room.building}</p>}
              </div>
            </div>
            <button className="btn btn-ghost btn-sm no-print" onClick={() => window.print()}>
              <Printer size={14} /> Баспаға шығару
            </button>
          </div>
          <div className="card-body rd-summary">
            <div className="rd-stat">
              <span className="rd-stat-val">{room.equipment.length}</span>
              <span className="rd-stat-label">Жабдық</span>
            </div>
            <div className="rd-stat">
              <span className="rd-stat-val">{totalPrice.toLocaleString()} ₸</span>
              <span className="rd-stat-label">Жалпы баға</span>
            </div>
            <div className="rd-stat">
              <span className="rd-stat-val">
                {room.equipment.filter(e => e.status === 'working').length}
              </span>
              <span className="rd-stat-label">Жұмыс істейді</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Жабдықтар тізімі</h2>
          </div>
          <div className="table-wrap">
            {room.equipment.length === 0 ? (
              <EmptyState message="Бұл кабинетте жабдық жоқ" />
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Инв. нөмір</th>
                    <th>Атауы</th>
                    <th>Санат</th>
                    <th>Статус</th>
                    <th>Бағасы</th>
                  </tr>
                </thead>
                <tbody>
                  {room.equipment.map((eq, i) => (
                    <tr key={eq.id}>
                      <td className="rd-num">{i + 1}</td>
                      <td className="rd-inv">{eq.inventory_number}</td>
                      <td>
                        <Link to={`/equipment/${eq.id}`} className="table-link no-print">
                          {eq.name}
                        </Link>
                        <span className="print-only">{eq.name}</span>
                      </td>
                      <td>{eq.category_name ?? '—'}</td>
                      <td><StatusBadge status={eq.status} /></td>
                      <td>{eq.price ? `${Number(eq.price).toLocaleString()} ₸` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Баспа қол қою */}
        <div className="rd-print-footer print-only">
          <p>Материалдық жауапты тұлға: ____________________________</p>
          <p>Күні: _________________</p>
        </div>

      </div>
    </AppLayout>
  );
}
