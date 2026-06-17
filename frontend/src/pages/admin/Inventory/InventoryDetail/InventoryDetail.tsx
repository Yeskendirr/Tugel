import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CaretLeft, Printer, CheckCircle, Warning, XCircle } from '@phosphor-icons/react';
import AppLayout from '../../../../components/AppLayout/AppLayout';
import StatusBadge from '../../../../components/StatusBadge/StatusBadge';
import EmptyState from '../../../../components/EmptyState/EmptyState';
import { getInventoryById, setInventoryItem } from '../../../../services/api';
import { InventoryCheckDetail, InventoryCheckItem, CheckResult } from '../../../../types';
import './InventoryDetail.css';

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('kk-KZ');
}

const RESULT_LABELS: Record<CheckResult, string> = {
  present: 'Орнында',
  damaged: 'Бүлінген',
  missing: 'Жоқ',
};

function ResultBtn({ value, active, onClick }: { value: CheckResult; active: boolean; onClick: () => void }) {
  return (
    <button
      className={`result-btn result-btn--${value}${active ? ' result-btn--active' : ''}`}
      onClick={onClick}
      title={RESULT_LABELS[value]}
    >
      {value === 'present' && <CheckCircle size={16} weight={active ? 'fill' : 'regular'} />}
      {value === 'damaged' && <Warning      size={16} weight={active ? 'fill' : 'regular'} />}
      {value === 'missing' && <XCircle      size={16} weight={active ? 'fill' : 'regular'} />}
      <span>{RESULT_LABELS[value]}</span>
    </button>
  );
}

export default function InventoryDetail() {
  const { id }         = useParams<{ id: string }>();
  const navigate       = useNavigate();
  const [data, setData] = useState<InventoryCheckDetail | null>(null);
  const [saving, setSaving] = useState<number | null>(null);

  const load = useCallback(() => {
    if (id) getInventoryById(parseInt(id)).then(r => setData(r.data));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleResult(eq: InventoryCheckItem, result: CheckResult) {
    if (!id) return;
    setSaving(eq.id);
    try {
      await setInventoryItem(parseInt(id), eq.id, result);
      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          equipment: prev.equipment.map(e =>
            e.id === eq.id ? { ...e, result } : e
          ),
        };
      });
    } finally {
      setSaving(null);
    }
  }

  if (!data) return <AppLayout title="Акт"><div className="inv-loading">Жүктелуде...</div></AppLayout>;

  const stats = {
    present: data.equipment.filter(e => e.result === 'present').length,
    damaged: data.equipment.filter(e => e.result === 'damaged').length,
    missing: data.equipment.filter(e => e.result === 'missing').length,
    unchecked: data.equipment.filter(e => !e.result).length,
  };

  return (
    <AppLayout title={`Акт № ${data.id}`}>
      <div className="inv-detail-page">

        {/* Хедер */}
        <div className="card inv-detail-info">
          <div className="card-header">
            <div className="inv-detail-header-left">
              <button className="btn btn-ghost btn-sm no-print" onClick={() => navigate(-1)}>
                <CaretLeft size={14} /> Артқа
              </button>
              <h2>Түгендеу актісі № {data.id}</h2>
            </div>
            <button className="btn btn-ghost btn-sm no-print" onClick={() => window.print()}>
              <Printer size={14} /> Басып шығару
            </button>
          </div>
          <div className="card-body">
            <table className="inv-meta-table">
              <tbody>
                <tr><th>Тексеру күні</th><td>{fmtDate(data.check_date)}</td></tr>
                <tr><th>Жүргізуші</th><td>{data.user_name ?? '—'}</td></tr>
                {data.room_name && <tr><th>Кабинет</th><td>{data.room_name}</td></tr>}
                {data.notes && <tr><th>Ескертпе</th><td>{data.notes}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Нәтиже статистикасы */}
        <div className="inv-stats no-print">
          <div className="inv-stat inv-stat--present">
            <CheckCircle size={18} weight="fill" />
            <span>{stats.present} Орнында</span>
          </div>
          <div className="inv-stat inv-stat--damaged">
            <Warning size={18} weight="fill" />
            <span>{stats.damaged} Бүлінген</span>
          </div>
          <div className="inv-stat inv-stat--missing">
            <XCircle size={18} weight="fill" />
            <span>{stats.missing} Жоқ</span>
          </div>
          {stats.unchecked > 0 && (
            <div className="inv-stat inv-stat--unchecked">
              <span>{stats.unchecked} Тексерілмеген</span>
            </div>
          )}
        </div>

        {/* Жабдықтар кестесі */}
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
                    <th>Статус</th>
                    <th className="no-print">Тексеру нәтижесі</th>
                    <th className="print-only">Нәтиже</th>
                  </tr>
                </thead>
                <tbody>
                  {data.equipment.map((eq, i) => (
                    <tr key={eq.id} className={eq.result ? `row-${eq.result}` : ''}>
                      <td className="muted-num">{i + 1}</td>
                      <td className="inv-num">{eq.inventory_number}</td>
                      <td>{eq.name}</td>
                      <td>{eq.category_name ?? '—'}</td>
                      <td><StatusBadge status={eq.status} /></td>
                      <td className="no-print result-cell">
                        {saving === eq.id ? (
                          <span className="inv-saving">Сақталуда...</span>
                        ) : (
                          <div className="result-btns">
                            <ResultBtn value="present" active={eq.result === 'present'} onClick={() => handleResult(eq, 'present')} />
                            <ResultBtn value="damaged" active={eq.result === 'damaged'} onClick={() => handleResult(eq, 'damaged')} />
                            <ResultBtn value="missing" active={eq.result === 'missing'} onClick={() => handleResult(eq, 'missing')} />
                          </div>
                        )}
                      </td>
                      <td className="print-only">
                        {eq.result ? RESULT_LABELS[eq.result] : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Баспа: қол қою */}
        <div className="print-signatures print-only">
          <div className="print-sig">
            <p>Тексерген:</p>
            <div className="print-sig-line"></div>
            <p>{data.user_name ?? '_____________'}</p>
          </div>
          <div className="print-sig">
            <p>Қабылдаған:</p>
            <div className="print-sig-line"></div>
            <p>_____________</p>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
