import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, PencilSimple, Trash, Buildings } from '@phosphor-icons/react';
import AppLayout from '../../../../components/AppLayout/AppLayout';
import Modal from '../../../../components/Modal/Modal';
import ConfirmDialog from '../../../../components/ConfirmDialog/ConfirmDialog';
import EmptyState from '../../../../components/EmptyState/EmptyState';
import { getRooms, createRoom, updateRoom, deleteRoom } from '../../../../services/api';
import { Room } from '../../../../types';
import { useAuth } from '../../../../context/AuthContext';
import './RoomList.css';

interface RoomForm { name: string; building: string; }

export default function RoomList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms]         = useState<Room[]>([]);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editRoom, setEditRoom]     = useState<Room | null>(null);
  const [deleteId, setDeleteId]     = useState<number | null>(null);
  const [form, setForm]             = useState<RoomForm>({ name: '', building: '' });
  const [error, setError]           = useState('');
  const [saving, setSaving]         = useState(false);

  const load = () => getRooms().then(r => setRooms(r.data));
  useEffect(() => { load(); }, []);

  function openAdd() {
    setEditRoom(null);
    setForm({ name: '', building: '' });
    setError('');
    setModalOpen(true);
  }

  function openEdit(e: React.MouseEvent, room: Room) {
    e.stopPropagation();
    setEditRoom(room);
    setForm({ name: room.name, building: room.building ?? '' });
    setError('');
    setModalOpen(true);
  }

  function confirmDelete(e: React.MouseEvent, id: number) {
    e.stopPropagation();
    setDeleteId(id);
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Атауы міндетті'); return; }
    setSaving(true);
    try {
      const payload = { name: form.name, building: form.building || null };
      if (editRoom) await updateRoom(editRoom.id, payload);
      else          await createRoom(payload);
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
    await deleteRoom(deleteId);
    setDeleteId(null);
    load();
  }

  return (
    <AppLayout title="Кабинеттер">
      <div className="card">
        <div className="card-header">
          <h2>Кабинеттер тізімі</h2>
          {user?.role === 'admin' && (
            <button className="btn btn-primary btn-sm" onClick={openAdd}>
              <Plus size={14} /> Қосу
            </button>
          )}
        </div>

        {rooms.length === 0 ? (
          <div style={{ padding: '24px' }}><EmptyState /></div>
        ) : (
          <div className="room-grid">
            {rooms.map(room => (
              <div
                key={room.id}
                className="room-card"
                onClick={() => navigate(`/rooms/${room.id}`)}
              >
                <div className="room-card-icon">
                  <Buildings size={28} weight="duotone" />
                </div>
                <div className="room-card-body">
                  <div className="room-card-name">{room.name}</div>
                  {room.building && (
                    <div className="room-card-building">{room.building}</div>
                  )}
                  <div className="room-card-count">
                    {room.equipment_count ?? 0} жабдық
                  </div>
                </div>
                {user?.role === 'admin' && (
                  <div className="room-card-actions">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={e => openEdit(e, room)}
                    >
                      <PencilSimple size={13} />
                    </button>
                    <button
                      className="btn btn-ghost btn-sm del-btn"
                      onClick={e => confirmDelete(e, room.id)}
                    >
                      <Trash size={13} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editRoom ? 'Кабинетті өңдеу' : 'Жаңа кабинет'}
      >
        {error && <div className="modal-error">{error}</div>}
        <div className="modal-form">
          <div className="form-group">
            <label className="form-label">Кабинет атауы *</label>
            <input className="form-control" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Ғимарат</label>
            <input className="form-control" value={form.building}
              onChange={e => setForm(f => ({ ...f, building: e.target.value }))} />
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
        message="Бұл кабинетті шынымен жоясыз ба?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </AppLayout>
  );
}
