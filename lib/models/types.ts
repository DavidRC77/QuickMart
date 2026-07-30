export type UserRole = 'administrador' | 'cajero';

export type PaymentMethod = 'efectivo' | 'qr' | 'tarjeta';

export interface User {
  id: string;
  nombre: string;
  apellido: string;
  ci: string;
  telefono: string;
  email: string;
  rol: UserRole;
  created_at?: string;
  password?: string;
}

export interface Category {
  id: string;
  nombre: string;
  descripcion?: string;
  created_at?: string;
}

export interface Product {
  id: string;
  codigo_barras: string;
  nombre: string;
  precio_costo: number;
  precio_venta: number;
  stock_actual: number;
  stock_minimo: number;
  categoria_id: string;
  categoria_nombre?: string;
  created_at?: string;
}

export interface Customer {
  id: string;
  nit_ci: string;
  razon_social: string;
  telefono?: string;
  email?: string;
  created_at?: string;
}

export interface CartItem {
  producto: Product;
  cantidad: number;
  subtotal: number;
}

export interface SaleDetail {
  id?: string;
  venta_id?: string;
  producto_id: string;
  producto_nombre?: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  numero_factura: string;
  fecha: string;
  cliente_id?: string;
  nit_ci: string;
  razon_social: string;
  usuario_id: string;
  usuario_nombre?: string;
  metodo_pago: PaymentMethod;
  monto_recibido: number;
  cambio: number;
  total: number;
  detalles: SaleDetail[];
  created_at?: string;
}

export interface DailyReport {
  fecha: string;
  totalIngresos: number;
  totalVentas: number;
  efectivoTotal: number;
  qrTotal: number;
  tarjetaTotal: number;
  ventas: Sale[];
}
