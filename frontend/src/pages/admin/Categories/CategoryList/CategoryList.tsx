import { useEffect, useState } from 'react';
import { Plus, PencilSimple, Trash } from '@phosphor-icons/react';
import AppLayout from '../../../../components/AppLayout/AppLayout';
import Modal from '../../../../components/Modal/Modal';
import ConfirmDialog from '../../../../components/ConfirmDialog/ConfirmDialog';
import EmptyState from '../../../../components/EmptyState/EmptyState';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../../../services/api';
import { Category } from '../../../../types';
import './CategoryList.css';

export default function CategoryList() {
  const [items, setItems]       = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem]   = useState<Category | null>(null);
  const [name, setName]           = useState('');
  const [deleteId, setDeleteId]   = useState<number | null>(null);
  const [error, setError]         = useState('');
  const [saving, setSaving]       = useState(false);

  const load = () => getCategories().then(r => setItems(r.data));
  useEffect(() => { load(); }, []);

  function openAdd() { setEditItem(null); setName(''); setError(''); setModalOpen(true); }
  function openEdit(c: Category) { setEditItem(c); setName(c.name); setError(''); setModalOpen(true); }

  async function handleSave() {
    if (!name.trim()) { setError('Атауы міндетті'); return; }
    setSaving(true);
    try {
      if (editItem) await updateCategory(editItem.id, { name });
      else          await createCategory({ name });
      setModalOpen(false);
      load();
    } catch {
      setError('Сақтау мүмкін болмады');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    await deleteCategory(deleteId);
    setDeleteId(null);
    load();
  }

  return (
    <AppLayout title="Санаттар">
      <div className="card">
        <div className="card-header">
          <h2>Санаттар тізімі</h2>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>
            <Plus size={14} /> Қосу
          </button>
        </div>

        <div className="table-wrap">
          {items.length === 0 ? <EmptyState /> : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Санат атауы</th>
                  <th>Жабдық саны</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((c, i) => (
                  <tr key={c.id}>
                    <td className="muted-num">{i + 1}</td>
                    <td>{c.name}</td>
                    <td><span className="count-badge">{c.equipment_count ?? 0}</span></td>
                    <td className="row-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>
                        <PencilSimple size={13} />
                      </button>
                      <button className="btn btn-ghost btn-sm del-btn" onClick={() => setDeleteId(c.id)}>
                        <Trash size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editItem ? 'Санатты өңдеу' : 'Жаңа санат'}>
        {error && <div className="modal-error">{error}</div>}
        <div className="modal-form">
          <div className="form-group">
            <label className="form-label">Санат атауы *</label>
            <input className="form-control" value={name}
              onChange={e => setName(e.target.value)} autoFocus />
          </div>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Болдырмау</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Сақталуда...' : 'Сақтау'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteId !== null}
        message="Бұл санатты шынымен жоясыз ба?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </AppLayout>
  );
}
