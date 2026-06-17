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

export type CheckResult = 'present' | 'damaged' | 'missing';

export interface InventoryCheckItem {
  id: number;
  name: string;
  inventory_number: string;
  status: EquipmentStatus;
  category_name?: string;
  room_name?: string;
  result: CheckResult | null;
  item_notes: string | null;
}

export interface InventoryCheckDetail extends InventoryCheck {
  room_id: number | null;
  room_name?: string;
  equipment: InventoryCheckItem[];
}

export interface StatusLogEntry {
  id: number;
  old_status: EquipmentStatus | null;
  new_status: EquipmentStatus;
  reason: string | null;
  user_name: string | null;
  created_at: string;
}

export interface RoomDetail extends Room {
  equipment: (Pick<Equipment, 'id' | 'name' | 'inventory_number' | 'status' | 'price'> & { category_name?: string })[];
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
