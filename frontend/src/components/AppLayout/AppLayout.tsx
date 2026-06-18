import { NavLink, useNavigate } from 'react-router-dom';
import { ReactNode } from 'react';
import {
  House, Package, Buildings, Tag, ClipboardText,
  ChartBar, Users, SignOut,
} from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContext';
import './AppLayout.css';

interface Props {
  children: ReactNode;
  title: string;
}

export default function AppLayout({ children, title }: Props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const initials = user?.fullName
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('') ?? '';

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="sidebar-logo-name">ТҮГЕЛ</span>
          <span className="sidebar-logo-sub">Жабдықтар есебі</span>
        </div>

        <nav className="sidebar-nav">
          {user?.role === 'admin' && (
            <NavLink to="/dashboard" className="sidebar-link">
              <House size={18} weight="duotone" />
              Негізгі тақтайша
            </NavLink>
          )}
          <NavLink to="/equipment" className="sidebar-link">
            <Package size={18} weight="duotone" />
            Жабдықтар
          </NavLink>
          <NavLink to="/rooms" className="sidebar-link">
            <Buildings size={18} weight="duotone" />
            Кабинеттер
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/categories" className="sidebar-link">
              <Tag size={18} weight="duotone" />
              Санаттар
            </NavLink>
          )}
          <NavLink to="/inventory" className="sidebar-link">
            <ClipboardText size={18} weight="duotone" />
            Түгендеу актілері
          </NavLink>
          {user?.role === 'admin' && (
            <>
              <NavLink to="/reports" className="sidebar-link">
                <ChartBar size={18} weight="duotone" />
                Есептер
              </NavLink>
              <NavLink to="/users" className="sidebar-link">
                <Users size={18} weight="duotone" />
                Пайдаланушылар
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            <SignOut size={18} />
            Шығу
          </button>
        </div>
      </aside>

      <div className="layout-main">
        <header className="layout-header">
          <h1 className="layout-title">{title}</h1>
          <div className="header-user">
            <div className="header-avatar">{initials}</div>
            <span className="header-name">{user?.fullName}</span>
          </div>
        </header>

        <main className="layout-content">{children}</main>
      </div>
    </div>
  );
}
