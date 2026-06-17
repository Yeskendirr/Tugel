export type Role = 'admin' | 'staff';

export interface User {
  id: number;
  fullName: string;
  role: Role;
}

export type EquipmentStatus = 'working' | 'repair' | 'written_off';

export interface Equipment {
  id: number;
  name: string;
  inventory_number: string;
  category_id: number | null;
  room_id: number | null;
  status: EquipmentStatus;
  purchase_date: string | null;
  price: number | null;
  notes: string | null;
  created_at: string;
  category_name?: string;
  room_name?: string;
}

export interface Category {
  id: number;
  name: string;
  equipment_count?: number;
}

export interface Room {
  id: number;
  name: string;
  building: string | null;
  equipment_count?: number;
}

export interface InventoryCheck {
  id: number;
  user_id: number | null;
  check_date: string;
  notes: string | null;
  created_at: string;
  user_name?: string;
}

export interface InventoryCheckDetail extends InventoryCheck {
  equipment: Pick<Equipment, 'id' | 'name' | 'inventory_number' | 'status' | 'category_name' | 'room_name'>[];
}

export interface ReportSummary {
  total: number;
  working: number;
  repair: number;
  written_off: number;
}

export interface RoomReport {
  room_name: string;
  equipment_count: number;
  total_price: number;
}

export interface CategoryReport {
  category_name: string;
  equipment_count: number;
}
