
import { Category, Product, Customer, Salesman } from './types';

export const MOCK_PRODUCTS: Product[] = [
  { id: '1', orderId: 'PO-2024-001', name: 'Organic Bananas', price: 180, costPrice: 120, category: Category.PRODUCE, unit: 'kg', stock: 120 },
  { id: '2', orderId: 'PO-2024-002', name: 'Fresh Milk (1L)', price: 450, costPrice: 380, category: Category.DAIRY, unit: 'ea', stock: 45 },
  { id: '3', orderId: 'PO-2024-003', name: 'Roast Paan', price: 90, costPrice: 60, category: Category.BAKERY, unit: 'ea', stock: 15 },
  { id: '4', orderId: 'PO-2024-004', name: 'Chicken Breast', price: 1450, costPrice: 1100, category: Category.MEAT, unit: 'kg', stock: 30 },
  { id: '5', orderId: 'PO-2024-001', name: 'Avocado', price: 250, costPrice: 180, category: Category.PRODUCE, unit: 'ea', stock: 60 },
  { id: '6', orderId: 'PO-2024-005', name: 'Curd Pot', price: 550, costPrice: 420, category: Category.DAIRY, unit: 'ea', stock: 80 },
  { id: '7', orderId: 'PO-2024-006', name: 'Coconut Oil', price: 850, costPrice: 700, category: Category.PANTRY, unit: 'ea', stock: 25 },
  { id: '8', orderId: 'PO-2024-007', name: 'Ginger Beer', price: 150, costPrice: 110, category: Category.BEVERAGES, unit: 'ea', stock: 100 },
];

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Anura Kumara', phone: '0771234567', points: 450 },
  { id: 'c2', name: 'Sajith Premadasa', phone: '0719876543', points: 120 },
  { id: 'c3', name: 'Ranil Wickramasinghe', phone: '0755554444', points: 890 },
];

export const MOCK_SALESMEN: Salesman[] = [
  { id: 's1', name: 'Kamal Perera', code: 'EMP001' },
  { id: 's2', name: 'Sunil Silva', code: 'EMP002' },
  { id: 's3', name: 'Nimal Fernando', code: 'EMP003' },
];
