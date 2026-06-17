import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CaretLeft, PencilSimple, Printer } from '@phosphor-icons/react';
import { QRCodeSVG } from 'qrcode.react';
import AppLayout from '../../../../components/AppLayout/AppLayout';
import StatusBadge from '../../../../components/StatusBadge/StatusBadge';
import { getEquipmentById } from '../../../../services/api';
import { Equipment } from '../../../../types';
import { useAuth } from '../../../../context/AuthContext';
import './EquipmentDetail.css';

function fmt(date: string | null) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('kk-KZ');
}

export default function EquipmentDetail() {
  const { id }      = useParams<{ id: string }>();
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [eq, setEq] = useState<Equipment | null>(null);

  useEffect(() => {
    if (id) getEquipmentById(parseInt(id)).then(r => setEq(r.data));
  }, [id]);

  if (!eq) return <AppLayout title="Жабдық"><div className="detail-loading">Жүктелуде...</div></AppLayout>;

  return (
    <AppLayout title={eq.name}>
      <div className="detail-page">

        <div className="detail-main card">
          <div className="card-header">
            <div className="detail-title-row">
              <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
                <CaretLeft size={14} /> Артқа
              </button>
              <h2>{eq.name}</h2>
              <StatusBadge status={eq.status} />
            </div>
            {user?.role === 'admin' && (
              <Link to={`/equipment/${eq.id}/edit`} className="btn btn-ghost btn-sm">
                <PencilSimple size={14} /> Өңдеу
              </Link>
            )}
          </div>

          <div className="card-body">
            <table className="detail-table">
              <tbody>
                <tr>
                  <th>Инвентарлық нөмір</th>
                  <td><code>{eq.inventory_number}</code></td>
                </tr>
                <tr>
                  <th>Санат</th>
                  <td>{(eq as Equipment & { category_name?: string }).category_name ?? '—'}</td>
                </tr>
                <tr>
                  <th>Кабинет</th>
                  <td>{(eq as Equipment & { room_name?: string }).room_name ?? '—'}</td>
                </tr>
                <tr>
                  <th>Сатып алу күні</th>
                  <td>{fmt(eq.purchase_date)}</td>
                </tr>
                <tr>
                  <th>Бағасы</th>
                  <td>{eq.price ? `${Number(eq.price).toLocaleString()} ₸` : '—'}</td>
                </tr>
                {eq.notes && (
                  <tr>
                    <th>Ескертпе</th>
                    <td className="detail-notes">{eq.notes}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="detail-sidebar card">
          <div className="card-header"><h2>QR-код</h2></div>
          <div className="card-body detail-qr-body">
            <QRCodeSVG value={eq.inventory_number} size={160} />
            <p className="detail-qr-num">{eq.inventory_number}</p>
            <p className="detail-qr-name">{eq.name}</p>
            <button
              className="btn btn-ghost btn-sm detail-print-btn"
              onClick={() => window.print()}
            >
              <Printer size={14} /> Басып шығару
            </button>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
