import { useEffect, useState } from 'react';
import { DownloadSimple } from '@phosphor-icons/react';
import AppLayout from '../../../components/AppLayout/AppLayout';
import { getReportSummary, getRoomReport, getCategoryReport } from '../../../services/api';
import { ReportSummary, RoomReport, CategoryReport } from '../../../types';
import './Reports.css';

export default function Reports() {
  const [summary, setSummary]     = useState<ReportSummary | null>(null);
  const [roomData, setRoomData]   = useState<RoomReport[]>([]);
  const [catData, setCatData]     = useState<CategoryReport[]>([]);

  useEffect(() => {
    getReportSummary().then(r => setSummary(r.data));
    getRoomReport().then(r => setRoomData(r.data));
    getCategoryReport().then(r => setCatData(r.data));
  }, []);

  function downloadCSV(path: string, filename: string) {
    const token = localStorage.getItem('token');
    const base  = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    const url   = `${base}${path}`;

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.blob())
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
      });
  }

  return (
    <AppLayout title="Есептер">
      <div className="reports-page">

        <div className="card">
          <div className="card-header"><h2>Жалпы статистика</h2></div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Статус</th>
                  <th>Саны</th>
                  <th>Үлес</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Барлық жабдық',      val: summary?.total,       pct: 100 },
                  { label: 'Жұмыс істейді',       val: summary?.working,     pct: summary && summary.total ? Math.round(summary.working / summary.total * 100) : 0 },
                  { label: 'Жөндеуде',            val: summary?.repair,      pct: summary && summary.total ? Math.round(summary.repair / summary.total * 100) : 0 },
                  { label: 'Есептен шығарылды',   val: summary?.written_off, pct: summary && summary.total ? Math.round(summary.written_off / summary.total * 100) : 0 },
                ].map(row => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    <td><strong>{row.val ?? '—'}</strong></td>
                    <td>
                      <div className="pct-bar-wrap">
                        <div className="pct-bar" style={{ width: `${row.pct}%` }} />
                        <span className="pct-num">{row.pct}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Кабинеттер бойынша</h2>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => downloadCSV('/api/reports/rooms/export', 'rooms_report.csv')}
            >
              <DownloadSimple size={14} /> CSV жүктеу
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Кабинет</th>
                  <th>Жабдық саны</th>
                  <th>Жалпы баға</th>
                </tr>
              </thead>
              <tbody>
                {roomData.map((r, i) => (
                  <tr key={r.room_name}>
                    <td className="muted-num">{i + 1}</td>
                    <td>{r.room_name}</td>
                    <td>{r.equipment_count}</td>
                    <td>{Number(r.total_price).toLocaleString()} ₸</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Санаттар бойынша</h2>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => downloadCSV('/api/reports/categories/export', 'categories_report.csv')}
            >
              <DownloadSimple size={14} /> CSV жүктеу
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Санат</th>
                  <th>Жабдық саны</th>
                </tr>
              </thead>
              <tbody>
                {catData.map((c, i) => (
                  <tr key={c.category_name}>
                    <td className="muted-num">{i + 1}</td>
                    <td>{c.category_name}</td>
                    <td>{c.equipment_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
