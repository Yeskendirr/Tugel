import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from '@phosphor-icons/react';
import AppLayout from '../../../../components/AppLayout/AppLayout';
import EmptyState from '../../../../components/EmptyState/EmptyState';
import { getInventory } from '../../../../services/api';
import { InventoryCheck } from '../../../../types';
import './InventoryList.css';

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('kk-KZ');
}

export default function InventoryList() {
  const [items, setItems] = useState<InventoryCheck[]>([]);

  useEffect(() => { getInventory().then(r => setItems(r.data)); }, []);

  return (
    <AppLayout title="Түгендеу актілері">
      <div className="card">
        <div className="card-header">
          <h2>Түгендеу актілері</h2>
          <Link to="/inventory/new" className="btn btn-primary btn-sm">
            <Plus size={14} /> Жаңа акт
          </Link>
        </div>

        <div className="table-wrap">
          {items.length === 0 ? <EmptyState message="Актілер жоқ" /> : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Тексеру күні</th>
                  <th>Жүргізуші</th>
                  <th>Ескертпе</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.id}>
                    <td className="muted-num">{i + 1}</td>
                    <td>{fmtDate(item.check_date)}</td>
                    <td>{item.user_name ?? '—'}</td>
                    <td className="inv-notes">{item.notes ?? '—'}</td>
                    <td>
                      <Link to={`/inventory/${item.id}`} className="btn btn-ghost btn-sm">
                        Қарау
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
