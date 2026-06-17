import { useEffect, useState, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CaretLeft } from '@phosphor-icons/react';
import AppLayout from '../../../../components/AppLayout/AppLayout';
import {
  getEquipmentById, createEquipment, updateEquipment,
  getRooms, getCategories,
} from '../../../../services/api';
import { Room, Category } from '../../../../types';
import './EquipmentForm.css';

interface FormData {
  name: string;
  inventory_number: string;
  category_id: string;
  room_id: string;
  status: string;
  purchase_date: string;
  price: string;
  notes: string;
}

const EMPTY: FormData = {
  name: '', inventory_number: '', category_id: '', room_id: '',
  status: 'working', purchase_date: '', price: '', notes: '',
};

export default function EquipmentForm() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit   = Boolean(id);

  const [form, setForm]     = useState<FormData>(EMPTY);
  const [rooms, setRooms]   = useState<Room[]>([]);
  const [cats, setCats]     = useState<Category[]>([]);
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getRooms().then(r => setRooms(r.data));
    getCategories().then(r => setCats(r.data));
    if (isEdit && id) {
      getEquipmentById(parseInt(id)).then(r => {
        const eq = r.data;
        setForm({
          name:             eq.name ?? '',
          inventory_number: eq.inventory_number ?? '',
          category_id:      String(eq.category_id ?? ''),
          room_id:          String(eq.room_id ?? ''),
          status:           eq.status ?? 'working',
          purchase_date:    eq.purchase_date ? eq.purchase_date.slice(0, 10) : '',
          price:            String(eq.price ?? ''),
          notes:            eq.notes ?? '',
        });
      });
    }
  }, [id, isEdit]);

  function set(key: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.name || !form.inventory_number) {
      setError('Атауы мен инвентарлық нөмір міндетті');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name:             form.name,
        inventory_number: form.inventory_number,
        category_id:      form.category_id ? parseInt(form.category_id) : null,
        room_id:          form.room_id ? parseInt(form.room_id) : null,
        status:           form.status,
        purchase_date:    form.purchase_date || null,
        price:            form.price ? parseFloat(form.price) : null,
        notes:            form.notes || null,
      };
      if (isEdit && id) {
        await updateEquipment(parseInt(id), payload);
        navigate(`/equipment/${id}`);
      } else {
        const { data } = await createEquipment(payload);
        navigate(`/equipment/${data.id}`);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Қате орын алды';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  const title = isEdit ? 'Жабдықты өңдеу' : 'Жабдық қосу';

  return (
    <AppLayout title={title}>
      <div className="eq-form-wrap card">
        <div className="card-header">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
            <CaretLeft size={14} /> Артқа
          </button>
          <h2>{title}</h2>
        </div>

        <div className="card-body">
          {error && <div className="eq-form-error">{error}</div>}

          <form onSubmit={handleSubmit} className="eq-form">
            <div className="eq-form-grid">
              <div className="form-group">
                <label className="form-label">Атауы *</label>
                <input className="form-control" value={form.name}
                  onChange={e => set('name', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Инвентарлық нөмір *</label>
                <input className="form-control" value={form.inventory_number}
                  onChange={e => set('inventory_number', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Санат</label>
                <select className="form-control" value={form.category_id}
                  onChange={e => set('category_id', e.target.value)}>
                  <option value="">— Таңдаңыз —</option>
                  {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Кабинет</label>
                <select className="form-control" value={form.room_id}
                  onChange={e => set('room_id', e.target.value)}>
                  <option value="">— Таңдаңыз —</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Статус *</label>
                <select className="form-control" value={form.status}
                  onChange={e => set('status', e.target.value)}>
                  <option value="working">Жұмыс істейді</option>
                  <option value="repair">Жөндеуде</option>
                  <option value="written_off">Есептен шығарылды</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Сатып алу күні</label>
                <input className="form-control" type="date" value={form.purchase_date}
                  onChange={e => set('purchase_date', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Бағасы (₸)</label>
                <input className="form-control" type="number" min="0" step="0.01"
                  value={form.price} onChange={e => set('price', e.target.value)} />
              </div>
              <div className="form-group eq-form-notes">
                <label className="form-label">Ескертпе</label>
                <textarea className="form-control" value={form.notes}
                  onChange={e => set('notes', e.target.value)} rows={3} />
              </div>
            </div>

            <div className="eq-form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
                Болдырмау
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Сақталуда...' : 'Сақтау'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
