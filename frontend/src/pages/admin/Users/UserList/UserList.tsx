import { useEffect, useState } from 'react';
import { Plus, Trash } from '@phosphor-icons/react';
import AppLayout from '../../../../components/AppLayout/AppLayout';
import Modal from '../../../../components/Modal/Modal';
import ConfirmDialog from '../../../../components/ConfirmDialog/ConfirmDialog';
import EmptyState from '../../../../components/EmptyState/EmptyState';
import { getUsers, createUser, deleteUser } from '../../../../services/api';
import { useAuth } from '../../../../context/AuthContext';
import './UserList.css';

interface UserRow {
  id: number;
  full_name: string;
  username: string;
  role: 'admin' | 'staff';
  created_at: string;
}

interface UserForm {
  full_name: string;
  username: string;
  password: string;
  role: string;
}

const EMPTY_FORM: UserForm = { full_name: '', username: '', password: '', role: 'staff' };

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('kk-KZ');
}

export default function UserList() {
  const { user: me } = useAuth();
  const [users, setUsers]       = useState<UserRow[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm]           = useState<UserForm>(EMPTY_FORM);
  const [deleteId, setDeleteId]   = useState<number | null>(null);
  const [error, setError]         = useState('');
  const [saving, setSaving]       = useState(false);

  const load = () => getUsers().then(r => setUsers(r.data));
  useEffect(() => { load(); }, []);

  function openAdd() { setForm(EMPTY_FORM); setError(''); setModalOpen(true); }

  async function handleSave() {
    if (!form.full_name || !form.username || !form.password) {
      setError('Барлық міндетті өрістерді толтырыңыз');
      return;
    }
    setSaving(true);
    try {
      await createUser({
        full_name: form.full_name,
        username:  form.username,
        password:  form.password,
        role:      form.role,
      });
      setModalOpen(false);
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Қате орын алды';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    await deleteUser(deleteId);
    setDeleteId(null);
    load();
  }

  const ROLE_LABELS: Record<string, string> = {
    admin: 'Әкімші',
    staff: 'Қызметкер',
  };

  return (
    <AppLayout title="Пайдаланушылар">
      <div className="card">
        <div className="card-header">
          <h2>Пайдаланушылар тізімі</h2>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>
            <Plus size={14} /> Қосу
          </button>
        </div>

        <div className="table-wrap">
          {users.length === 0 ? <EmptyState /> : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Аты-жөні</th>
                  <th>Логин</th>
                  <th>Рол</th>
                  <th>Тіркелген күні</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id}>
                    <td className="muted-num">{i + 1}</td>
                    <td>
                      {u.full_name}
                      {u.id === me?.id && <span className="user-me-badge">мен</span>}
                    </td>
                    <td className="user-login">{u.username}</td>
                    <td>
                      <span className={`role-badge role-${u.role}`}>
                        {ROLE_LABELS[u.role]}
                      </span>
                    </td>
                    <td>{fmtDate(u.created_at)}</td>
                    <td>
                      {u.id !== me?.id && (
                        <button className="btn btn-ghost btn-sm del-btn" onClick={() => setDeleteId(u.id)}>
                          <Trash size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Жаңа пайдаланушы">
        {error && <div className="modal-error">{error}</div>}
        <div className="modal-form">
          <div className="form-group">
            <label className="form-label">Аты-жөні *</label>
            <input className="form-control" value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Логин *</label>
            <input className="form-control" value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Пароль * (кемінде 6 символ)</label>
            <input className="form-control" type="password" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Рол</label>
            <select className="form-control" value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              <option value="staff">Қызметкер</option>
              <option value="admin">Әкімші</option>
            </select>
          </div>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Болдырмау</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Қосылуда...' : 'Қосу'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteId !== null}
        message="Бұл пайдаланушыны шынымен жоясыз ба?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </AppLayout>
  );
}
