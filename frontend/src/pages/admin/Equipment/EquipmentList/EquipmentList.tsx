import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, MagnifyingGlass, PencilSimple, Trash } from '@phosphor-icons/react';
import AppLayout from '../../../../components/AppLayout/AppLayout';
import StatusBadge from '../../../../components/StatusBadge/StatusBadge';
import Pagination from '../../../../components/Pagination/Pagination';
import EmptyState from '../../../../components/EmptyState/EmptyState';
import ConfirmDialog from '../../../../components/ConfirmDialog/ConfirmDialog';
import { getEquipment, deleteEquipment, getRooms, getCategories } from '../../../../services/api';
import { Equipment, Room, Category } from '../../../../types';
import { useAuth } from '../../../../context/AuthContext';
import './EquipmentList.css';

const LIMIT = 20;

export default function EquipmentList() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();

  const [items, setItems]     = useState<Equipment[]>([]);
  const [total, setTotal]     = useState(0);
  const [rooms, setRooms]     = useState<Room[]>([]);
  const [cats, setCats]       = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const page     = parseInt(params.get('page') || '1');
  const search   = params.get('search') || '';
  const room     = params.get('room') || '';
  const category = params.get('category') || '';
  const status   = params.get('status') || '';

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  const load = useCallback(() => {
    setLoading(true);
    const p: Record<string, string> = { page: String(page), limit: String(LIMIT) };
    if (search)   p.search   = search;
    if (room)     p.room     = room;
    if (category) p.category = category;
    if (status)   p.status   = status;

    getEquipment(p)
      .then(r => { setItems(r.data.data); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  }, [page, search, room, category, status]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    getRooms().then(r => setRooms(r.data));
    getCategories().then(r => setCats(r.data));
  }, []);

  async function handleDelete() {
    if (!deleteId) return;
    await deleteEquipment(deleteId);
    setDeleteId(null);
    load();
  }

  return (
    <AppLayout title="Жабдықтар">
      <div className="card">
        <div className="card-header">
          <h2>Жабдықтар тізімі</h2>
          {user?.role === 'admin' && (
            <Link to="/equipment/add" className="btn btn-primary btn-sm">
              <Plus size={14} /> Қосу
            </Link>
          )}
        </div>

        <div className="eq-filters">
          <div className="eq-search-wrap">
            <MagnifyingGlass size={15} className="eq-search-icon" />
            <input
              className="form-control eq-search"
              placeholder="Жабдық атауы бойынша іздеу..."
              value={search}
              onChange={e => setParam('search', e.target.value)}
            />
          </div>
          <select className="form-control eq-select" value={room} onChange={e => setParam('room', e.target.value)}>
            <option value="">Барлық кабинеттер</option>
            {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <select className="form-control eq-select" value={category} onChange={e => setParam('category', e.target.value)}>
            <option value="">Барлық санаттар</option>
            {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="form-control eq-select" value={status} onChange={e => setParam('status', e.target.value)}>
            <option value="">Барлық статустар</option>
            <option value="working">Жұмыс істейді</option>
            <option value="repair">Жөндеуде</option>
            <option value="written_off">Есептен шығарылды</option>
          </select>
        </div>

        <div className="table-wrap">
          {loading ? (
            <div className="eq-loading">Жүктелуде...</div>
          ) : items.length === 0 ? (
            <EmptyState />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Инв. нөмір</th>
                  <th>Атауы</th>
                  <th>Санат</th>
                  <th>Кабинет</th>
                  <th>Статус</th>
                  <th>Бағасы</th>
                  {user?.role === 'admin' && <th></th>}
                </tr>
              </thead>
              <tbody>
                {items.map((eq, i) => (
                  <tr key={eq.id}>
                    <td className="eq-num">{(page - 1) * LIMIT + i + 1}</td>
                    <td className="eq-inv">{eq.inventory_number}</td>
                    <td>
                      <Link to={`/equipment/${eq.id}`} className="table-link">{eq.name}</Link>
                    </td>
                    <td>{eq.category_name ?? '—'}</td>
                    <td>{eq.room_name ?? '—'}</td>
                    <td><StatusBadge status={eq.status} /></td>
                    <td>{eq.price ? `${Number(eq.price).toLocaleString()} ₸` : '—'}</td>
                    {user?.role === 'admin' && (
                      <td className="eq-actions">
                        <Link to={`/equipment/${eq.id}/edit`} className="btn btn-ghost btn-sm">
                          <PencilSimple size={13} />
                        </Link>
                        <button className="btn btn-ghost btn-sm eq-del" onClick={() => setDeleteId(eq.id)}>
                          <Trash size={13} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Pagination page={page} total={total} limit={LIMIT} onChange={p => setParam('page', String(p))} />
      </div>

      <ConfirmDialog
        isOpen={deleteId !== null}
        message="Бұл жабдықты шынымен жоясыз ба?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </AppLayout>
  );
}
