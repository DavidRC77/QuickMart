import { Product, CartItem, Customer, Sale, PaymentMethod, User } from '../models/types';
import { ProductModel } from '../models/productModel';
import { CustomerModel } from '../models/customerModel';
import { SaleModel } from '../models/saleModel';

export class POSController {
  // Buscar producto por código de barras para el escáner
  static async scanBarcode(barcode: string, currentCart: CartItem[]): Promise<{ updatedCart: CartItem[]; scannedProduct: Product }> {
    const product = await ProductModel.getByBarcode(barcode);
    if (!product) {
      throw new Error(`Producto con código "${barcode}" no encontrado.`);
    }

    if (product.stock_actual <= 0) {
      throw new Error(`El producto "${product.nombre}" no tiene stock disponible.`);
    }

    const updatedCart = [...currentCart];
    const existingIndex = updatedCart.findIndex((item) => item.producto.id === product.id);

    if (existingIndex > -1) {
      const currentQty = updatedCart[existingIndex].cantidad;
      if (currentQty + 1 > product.stock_actual) {
        throw new Error(`No puedes agregar más de ${product.stock_actual} unidades de "${product.nombre}".`);
      }
      updatedCart[existingIndex] = {
        ...updatedCart[existingIndex],
        cantidad: currentQty + 1,
        subtotal: (currentQty + 1) * product.precio_venta,
      };
    } else {
      updatedCart.push({
        producto: product,
        cantidad: 1,
        subtotal: product.precio_venta,
      });
    }

    return { updatedCart, scannedProduct: product };
  }

  // Actualizar cantidad de un ítem en el carrito
  static updateItemQuantity(cart: CartItem[], productId: string, newQuantity: number): CartItem[] {
    if (newQuantity <= 0) {
      return cart.filter((item) => item.producto.id !== productId);
    }
    return cart.map((item) => {
      if (item.producto.id === productId) {
        if (newQuantity > item.producto.stock_actual) {
          throw new Error(
            `Stock insuficiente. El producto "${item.producto.nombre}" solo cuenta con ${item.producto.stock_actual} unidades.`
          );
        }
        return {
          ...item,
          cantidad: newQuantity,
          subtotal: newQuantity * item.producto.precio_venta,
        };
      }
      return item;
    });
  }

  // Eliminar producto del carrito
  static removeItem(cart: CartItem[], productId: string): CartItem[] {
    return cart.filter((item) => item.producto.id !== productId);
  }

  // Buscar cliente por NIT / CI para autocompletar Razón Social
  static async findCustomer(nit_ci: string): Promise<Customer | null> {
    if (!nit_ci || nit_ci.trim() === '' || nit_ci === '0') {
      return {
        id: 'c0',
        nit_ci: '0',
        razon_social: 'SIN DATOS / ANÓNIMO',
      };
    }
    return await CustomerModel.findByNitCi(nit_ci.trim());
  }

  // Registrar cliente express
  static async registerCustomer(nit_ci: string, razon_social: string, telefono?: string, email?: string): Promise<Customer> {
    return await CustomerModel.create({
      nit_ci: nit_ci.trim(),
      razon_social: razon_social.trim(),
      telefono: telefono?.trim(),
      email: email?.trim(),
    });
  }

  // Calcular totales
  static calculateTotals(cart: CartItem[]): { total: number; itemCount: number } {
    const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const itemCount = cart.reduce((sum, item) => sum + item.cantidad, 0);
    return { total: Math.round(total * 100) / 100, itemCount };
  }

  // Procesar y confirmar la venta
  static async processSale({
    cart,
    customer,
    user,
    paymentMethod,
    montoRecibido,
  }: {
    cart: CartItem[];
    customer: { nit_ci: string; razon_social: string; id?: string };
    user: User;
    paymentMethod: PaymentMethod;
    montoRecibido: number;
  }): Promise<Sale> {
    if (cart.length === 0) {
      throw new Error('El carrito de compras está vacío.');
    }

    const { total } = this.calculateTotals(cart);

    let cambio = 0;
    if (paymentMethod === 'efectivo') {
      if (montoRecibido < total) {
        throw new Error(
          `Monto recibido insuficiente. El total a pagar es Bs. ${total.toFixed(2)} y se ingresó Bs. ${montoRecibido.toFixed(2)}.`
        );
      }
      cambio = Math.round((montoRecibido - total) * 100) / 100;
    } else {
      montoRecibido = total;
      cambio = 0;
    }

    const salePayload = {
      cliente_id: customer.id,
      nit_ci: customer.nit_ci,
      razon_social: customer.razon_social,
      usuario_id: user.id,
      usuario_nombre: `${user.nombre} ${user.apellido}`,
      metodo_pago: paymentMethod,
      monto_recibido: montoRecibido,
      cambio,
      total,
      detalles: cart.map((item) => ({
        producto_id: item.producto.id,
        producto_nombre: item.producto.nombre,
        cantidad: item.cantidad,
        precio_unitario: item.producto.precio_venta,
        subtotal: item.subtotal,
      })),
    };

    return await SaleModel.createSale(salePayload);
  }
}
