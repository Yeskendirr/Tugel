import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const login = (username: string, password: string) =>
  api.post('/api/auth/login', { username, password });

// Equipment
export const getEquipment = (params?: Record<string, string>) =>
  api.get('/api/equipment', { params });
export const getEquipmentById = (id: number) =>
  api.get(`/api/equipment/${id}`);
export const createEquipment = (data: Record<string, unknown>) =>
  api.post('/api/equipment', data);
export const updateEquipment = (id: number, data: Record<string, unknown>) =>
  api.put(`/api/equipment/${id}`, data);
export const deleteEquipment = (id: number) =>
  api.delete(`/api/equipment/${id}`);

// Rooms
export const getRooms = () => api.get('/api/rooms');
export const createRoom = (data: Record<string, unknown>) => api.post('/api/rooms', data);
export const updateRoom = (id: number, data: Record<string, unknown>) => api.put(`/api/rooms/${id}`, data);
export const deleteRoom = (id: number) => api.delete(`/api/rooms/${id}`);

// Categories
export const getCategories = () => api.get('/api/categories');
export const createCategory = (data: Record<string, unknown>) => api.post('/api/categories', data);
export const updateCategory = (id: number, data: Record<string, unknown>) => api.put(`/api/categories/${id}`, data);
export const deleteCategory = (id: number) => api.delete(`/api/categories/${id}`);

// Inventory
export const getInventory = () => api.get('/api/inventory');
export const getInventoryById = (id: number) => api.get(`/api/inventory/${id}`);
export const createInventory = (data: Record<string, unknown>) => api.post('/api/inventory', data);

// Reports
export const getReportSummary  = () => api.get('/api/reports/summary');
export const getRoomReport     = () => api.get('/api/reports/rooms');
export const getCategoryReport = () => api.get('/api/reports/categories');

// Users
export const getUsers    = () => api.get('/api/users');
export const createUser  = (data: Record<string, unknown>) => api.post('/api/users', data);
export const deleteUser  = (id: number) => api.delete(`/api/users/${id}`);

export default api;
