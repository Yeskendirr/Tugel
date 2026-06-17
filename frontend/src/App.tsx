import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ReactNode } from 'react';

import Login          from './pages/auth/Login/Login';
import Dashboard      from './pages/admin/Dashboard/Dashboard';
import EquipmentList  from './pages/admin/Equipment/EquipmentList/EquipmentList';
import EquipmentDetail from './pages/admin/Equipment/EquipmentDetail/EquipmentDetail';
import EquipmentForm  from './pages/admin/Equipment/EquipmentForm/EquipmentForm';
import RoomList       from './pages/admin/Rooms/RoomList/RoomList';
import RoomDetail     from './pages/admin/Rooms/RoomDetail/RoomDetail';
import CategoryList   from './pages/admin/Categories/CategoryList/CategoryList';
import InventoryList  from './pages/admin/Inventory/InventoryList/InventoryList';
import InventoryNew   from './pages/admin/Inventory/InventoryNew/InventoryNew';
import InventoryDetail from './pages/admin/Inventory/InventoryDetail/InventoryDetail';
import Reports        from './pages/admin/Reports/Reports';
import UserList       from './pages/admin/Users/UserList/UserList';

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/equipment" replace />;
  return <>{children}</>;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/dashboard' : '/equipment'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />

          <Route path="/dashboard"   element={<RequireAdmin><Dashboard /></RequireAdmin>} />

          <Route path="/equipment"   element={<RequireAuth><EquipmentList /></RequireAuth>} />
          <Route path="/equipment/add"      element={<RequireAdmin><EquipmentForm /></RequireAdmin>} />
          <Route path="/equipment/:id"      element={<RequireAuth><EquipmentDetail /></RequireAuth>} />
          <Route path="/equipment/:id/edit" element={<RequireAdmin><EquipmentForm /></RequireAdmin>} />

          <Route path="/rooms"       element={<RequireAuth><RoomList /></RequireAuth>} />
          <Route path="/rooms/:id"   element={<RequireAuth><RoomDetail /></RequireAuth>} />
          <Route path="/categories"  element={<RequireAdmin><CategoryList /></RequireAdmin>} />

          <Route path="/inventory"        element={<RequireAuth><InventoryList /></RequireAuth>} />
          <Route path="/inventory/new"    element={<RequireAuth><InventoryNew /></RequireAuth>} />
          <Route path="/inventory/:id"    element={<RequireAuth><InventoryDetail /></RequireAuth>} />

          <Route path="/reports"     element={<RequireAdmin><Reports /></RequireAdmin>} />
          <Route path="/users"       element={<RequireAdmin><UserList /></RequireAdmin>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
