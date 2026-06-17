// Жобаның негізгі типтері

export type Role = 'admin' | 'staff';

export interface User {
  id: number;
  fullName: string;
  username: string;
  role: Role;
}

export type EquipmentStatus = 'working' | 'repair' | 'written_off';

export interface Equipment {
  id: number;
  name: string;
  inventoryNumber: string;
  categoryId: number | null;
  roomId: number | null;
  status: EquipmentStatus;
  purchaseDate: string | null;
  price: number | null;
  notes: string | null;
}

export interface Category {
  id: number;
  name: string;
}

export interface Room {
  id: number;
  name: string;
  building: string | null;
}
