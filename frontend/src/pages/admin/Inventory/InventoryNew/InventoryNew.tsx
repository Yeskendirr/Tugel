import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CaretLeft } from '@phosphor-icons/react';
import AppLayout from '../../../../components/AppLayout/AppLayout';
import { createInventory } from '../../../../services/api';
import './InventoryNew.css';

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function InventoryNew() {
  const navigate = useNavigate();
  const [date, setDate]     = useState(today());
  const [notes, setNotes]   = useState('');
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!date) { setError('Күнді енгізіңіз'); return; }
    setSaving(true);
    try {
      const { data } = await createInventory({ check_date: date, notes: notes || null });
      navigate(`/inventory/${data.id}`);
    } catch {
      setError('Акт жасалмады');
      setSaving(false);
    }
  }

  return (
    <AppLayout title="Жаңа түгендеу актісі">
      <div className="inv-new-wrap card">
        <div className="card-header">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
            <CaretLeft size={14} /> Артқа
          </button>
          <h2>Жаңа акт</h2>
        </div>
        <div className="card-body">
          {error && <div className="inv-error">{error}</div>}
          <form onSubmit={handleSubmit} className="inv-new-form">
            <div className="form-group">
              <label className="form-label">Тексеру күні *</label>
              <input className="form-control" type="date" value={date}
                onChange={e => setDate(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Ескертпе</label>
              <textarea className="form-control" rows={4} value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Акт туралы қосымша ақпарат..." />
            </div>
            <div className="inv-new-actions">
              <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
                Болдырмау
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Жасалуда...' : 'Жасау'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
