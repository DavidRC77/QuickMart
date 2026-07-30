import { Category, Product, Customer, User, Sale } from '../models/types';

// Initial seed data matching database schema
const INITIAL_CATEGORIES: Category[] = [
  { id: '11111111-1111-1111-1111-111111111111', nombre: 'Bebidas', descripcion: 'Gaseosas, jugos, aguas y energizantes' },
  { id: '22222222-2222-2222-2222-222222222222', nombre: 'Lácteos', descripcion: 'Leche, quesos y yogures' },
  { id: '33333333-3333-3333-3333-333333333333', nombre: 'Abarrotes', descripcion: 'Arroz, fideos, aceites y enlatados' },
  { id: '44444444-4444-4444-4444-444444444444', nombre: 'Snacks y Golosinas', descripcion: 'Papas fritas, galletas y chocolates' },
];

const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', codigo_barras: '7771234567890', nombre: 'Coca Cola 2L', precio_costo: 10.00, precio_venta: 14.50, stock_actual: 45, stock_minimo: 10, categoria_id: '11111111-1111-1111-1111-111111111111' },
  { id: 'p2', codigo_barras: '7771234567891', nombre: 'Leche Entera Pil 1L', precio_costo: 5.50, precio_venta: 7.00, stock_actual: 3, stock_minimo: 10, categoria_id: '22222222-2222-2222-2222-222222222222' },
  { id: 'p3', codigo_barras: '7771234567892', nombre: 'Aceite Fino 1L', precio_costo: 11.00, precio_venta: 15.00, stock_actual: 20, stock_minimo: 5, categoria_id: '33333333-3333-3333-3333-333333333333' },
  { id: 'p4', codigo_barras: '7771234567893', nombre: 'Papas Lays Clásicas 150g', precio_costo: 8.00, precio_venta: 12.00, stock_actual: 2, stock_minimo: 5, categoria_id: '44444444-4444-4444-4444-444444444444' },
  { id: 'p5', codigo_barras: '7771234567894', nombre: 'Agua Mineral Vital 500ml', precio_costo: 2.00, precio_venta: 3.50, stock_actual: 60, stock_minimo: 15, categoria_id: '11111111-1111-1111-1111-111111111111' },
];

const INITIAL_USERS: User[] = [
  { id: 'u1', nombre: 'Administrador', apellido: 'QuickMart', ci: '1234567', telefono: '70000001', email: 'admin@quickmart.com', rol: 'administrador', password: 'admin123' },
  { id: 'u2', nombre: 'Carlos', apellido: 'Cajero', ci: '7654321', telefono: '70000002', email: 'cajero@quickmart.com', rol: 'cajero', password: 'cajero123' },
];

const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'c0', nit_ci: '0', razon_social: 'SIN DATOS / ANÓNIMO', telefono: '00000000', email: 'sin_datos@quickmart.com' },
  { id: 'c1', nit_ci: '1234567019', razon_social: 'Empresa Ejemplo S.R.L.', telefono: '77788990', email: 'contacto@ejemplo.com' },
];

class LocalStore {
  private categories: Category[] = INITIAL_CATEGORIES;
  private products: Product[] = INITIAL_PRODUCTS;
  private users: User[] = INITIAL_USERS;
  private customers: Customer[] = INITIAL_CUSTOMERS;
  private sales: Sale[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromLocalStorage();
    }
  }

  private saveToLocalStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('qm_categories', JSON.stringify(this.categories));
      localStorage.setItem('qm_products', JSON.stringify(this.products));
      localStorage.setItem('qm_users', JSON.stringify(this.users));
      localStorage.setItem('qm_customers', JSON.stringify(this.customers));
      localStorage.setItem('qm_sales', JSON.stringify(this.sales));
    } catch (e) {
      console.error('Error guardando en localStorage:', e);
    }
  }

  private loadFromLocalStorage() {
    try {
      const cats = localStorage.getItem('qm_categories');
      if (cats) this.categories = JSON.parse(cats);
      const prods = localStorage.getItem('qm_products');
      if (prods) this.products = JSON.parse(prods);
      const usrs = localStorage.getItem('qm_users');
      if (usrs) this.users = JSON.parse(usrs);
      const custs = localStorage.getItem('qm_customers');
      if (custs) this.customers = JSON.parse(custs);
      const sls = localStorage.getItem('qm_sales');
      if (sls) this.sales = JSON.parse(sls);
    } catch (e) {
      console.error('Error cargando de localStorage:', e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.saveToLocalStorage();
    this.listeners.forEach((l) => l());
  }

  // --- CATEGORIES ---
  getCategories(): Category[] {
    return [...this.categories];
  }

  addCategory(category: Omit<Category, 'id'>): Category {
    const newCat: Category = {
      ...category,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    this.categories.unshift(newCat);
    this.notify();
    return newCat;
  }

  updateCategory(id: string, category: Partial<Category>): Category | null {
    const idx = this.categories.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.categories[idx] = { ...this.categories[idx], ...category };
    this.notify();
    return this.categories[idx];
  }

  deleteCategory(id: string): boolean {
    this.categories = this.categories.filter((c) => c.id !== id);
    this.notify();
    return true;
  }

  // --- PRODUCTS ---
  getProducts(): Product[] {
    return this.products.map((p) => {
      const cat = this.categories.find((c) => c.id === p.categoria_id);
      return { ...p, categoria_nombre: cat ? cat.nombre : 'Sin categoría' };
    });
  }

  addProduct(product: Omit<Product, 'id'>): Product {
    const newProd: Product = {
      ...product,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    this.products.unshift(newProd);
    this.notify();
    return newProd;
  }

  updateProduct(id: string, product: Partial<Product>): Product | null {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.products[idx] = { ...this.products[idx], ...product };
    this.notify();
    return this.products[idx];
  }

  deleteProduct(id: string): boolean {
    this.products = this.products.filter((p) => p.id !== id);
    this.notify();
    return true;
  }

  // Descuento de stock tipo Trigger
  deductStock(productId: string, quantity: number): void {
    const prod = this.products.find((p) => p.id === productId);
    if (!prod) {
      throw new Error(`El producto no existe.`);
    }
    if (prod.stock_actual < quantity) {
      throw new Error(
        `Stock insuficiente para "${prod.nombre}". Disponible: ${prod.stock_actual}, Solicitado: ${quantity}`
      );
    }
    prod.stock_actual -= quantity;
    this.notify();
  }

  // --- USERS ---
  getUsers(): User[] {
    return [...this.users];
  }

  addUser(user: Omit<User, 'id'>): User {
    const newUser: User = {
      ...user,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    this.users.unshift(newUser);
    this.notify();
    return newUser;
  }

  updateUser(id: string, user: Partial<User>): User | null {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.users[idx] = { ...this.users[idx], ...user };
    this.notify();
    return this.users[idx];
  }

  deleteUser(id: string): boolean {
    this.users = this.users.filter((u) => u.id !== id);
    this.notify();
    return true;
  }

  // --- CUSTOMERS ---
  getCustomers(): Customer[] {
    return [...this.customers];
  }

  findCustomerByNit(nit_ci: string): Customer | null {
    return this.customers.find((c) => c.nit_ci.trim() === nit_ci.trim()) || null;
  }

  addCustomer(customer: Omit<Customer, 'id'>): Customer {
    const existing = this.findCustomerByNit(customer.nit_ci);
    if (existing) return existing;
    const newCust: Customer = {
      ...customer,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    this.customers.unshift(newCust);
    this.notify();
    return newCust;
  }

  // --- SALES ---
  getSales(): Sale[] {
    return [...this.sales];
  }

  createSale(saleData: Omit<Sale, 'id' | 'numero_factura' | 'fecha'>): Sale {
    // 1. Verificar stock para TODOS los ítems antes de procesar la venta
    for (const item of saleData.detalles) {
      const prod = this.products.find((p) => p.id === item.producto_id);
      if (!prod) {
        throw new Error(`Producto no encontrado en inventario.`);
      }
      if (prod.stock_actual < item.cantidad) {
        throw new Error(
          `Stock insuficiente para "${prod.nombre}". Stock disponible: ${prod.stock_actual}, Solicitado: ${item.cantidad}`
        );
      }
    }

    // 2. Descontar stock
    for (const item of saleData.detalles) {
      this.deductStock(item.producto_id, item.cantidad);
    }

    // 3. Crear registro de venta
    const numeroFactura = `FAC-${String(this.sales.length + 1001).padStart(6, '0')}`;
    const newSale: Sale = {
      ...saleData,
      id: crypto.randomUUID(),
      numero_factura: numeroFactura,
      fecha: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    this.sales.unshift(newSale);
    this.notify();
    return newSale;
  }
}

export const mockStore = new LocalStore();
