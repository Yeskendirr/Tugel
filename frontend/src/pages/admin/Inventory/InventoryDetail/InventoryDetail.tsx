import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CaretLeft, Printer } from '@phosphor-icons/react';
import AppLayout from '../../../../components/AppLayout/AppLayout';
import StatusBadge from '../../../../components/StatusBadge/StatusBadge';
import EmptyState from '../../../../components/EmptyState/EmptyState';
import { getInventoryById } from '../../../../services/api';
import { InventoryCheckDetail } from '../../../../types';
import './InventoryDetail.css';

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('kk-KZ');
}

export default function InventoryDetail() {
  const { id }         = useParams<{ id: string }>();
  const navigate       = useNavigate();
  const [data, setData] = useState<InventoryCheckDetail | null>(null);

  useEffect(() => {
    if (id) getInventoryById(parseInt(id)).then(r => setData(r.data));
  }, [id]);

  if (!data) return <AppLayout title="Акт"><div className="inv-loading">Жүктелуде...</div></AppLayout>;

  return (
    <AppLayout title={`Акт № ${data.id}`}>
      <div className="inv-detail-page">

        <div className="card inv-detail-info">
          <div className="card-header">
            <div className="inv-detail-header-left">
              <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
                <CaretLeft size={14} /> Артқа
              </button>
              <h2>Түгендеу актісі № {data.id}</h2>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>
              <Printer size={14} /> Басып шығару
            </button>
          </div>
          <div className="card-body">
            <table className="inv-meta-table">
              <tbody>
                <tr><th>Тексеру күні</th><td>{fmtDate(data.check_date)}</td></tr>
                <tr><th>Жүргізуші</th><td>{data.user_name ?? '—'}</td></tr>
                {data.notes && <tr><th>Ескертпе</th><td>{data.notes}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Жабдықтар тізімі</h2>
            <span className="inv-count">{data.equipment.length} жабдық</span>
          </div>
          <div className="table-wrap">
            {data.equipment.length === 0 ? <EmptyState message="Жабдықтар жоқ" /> : (
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Инв. нөмір</th>
                    <th>Атауы</th>
                    <th>Санат</th>
                    <th>Кабинет</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {data.equipment.map((eq, i) => (
                    <tr key={eq.id}>
                      <td className="muted-num">{i + 1}</td>
                      <td className="inv-num">{eq.inventory_number}</td>
                      <td>{eq.name}</td>
                      <td>{eq.category_name ?? '—'}</td>
                      <td>{eq.room_name ?? '—'}</td>
                      <td><StatusBadge status={eq.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
