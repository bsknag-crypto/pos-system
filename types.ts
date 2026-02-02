
export enum Category {
  PRODUCE = 'Produce',
  DAIRY = 'Dairy',
  BAKERY = 'Bakery',
  MEAT = 'Meat',
  PANTRY = 'Pantry',
  BEVERAGES = 'Beverages',
  FROZEN = 'Frozen',
  SNACKS = 'Snacks'
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  points: number;
}

export interface Salesman {
  id: string;
  name: string;
  code: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  costPrice: number;
  category: Category;
  stock: number;
  unit: string;
  orderId: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Sale {
  id: string;
  timestamp: number;
  items: CartItem[];
  total: number;
  amountGiven: number;
  changeDue: number;
  profit: number;
  customerId?: string;
  salesmanId: string;
  paymentMethod: 'Cash' | 'Card' | 'Digital';
}

export interface LogEntry {
  id: string;
  timestamp: number;
  type: 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO';
  action: string;
  message: string;
  user: string;
}

export interface ShopSettings {
  name: string;
  address: string;
  phone: string;
  website: string;
  receiptFooter: string;
}

export enum View {
  LOGIN = 'Login',
  TERMINAL = 'Terminal',
  INVENTORY = 'Inventory',
  ANALYTICS = 'Analytics',
  STAFF = 'Staff Management',
  SETTINGS = 'Settings'
}

export type AuthUser = {
  role: 'ADMIN' | 'SALESMAN';
  profile?: Salesman;
}
