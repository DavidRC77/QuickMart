import { useState, useEffect, useCallback } from 'react';
import { Product, CartItem, Customer, Sale, PaymentMethod, User } from '../lib/models/types';
import { ProductModel } from '../lib/models/productModel';
import { POSController } from '../lib/controllers/posController';
import { mockStore } from '../lib/supabase/mockStore';

export function usePosController(currentUser: User | null) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<Customer>({
    id: 'c0',
    nit_ci: '0',
    razon_social: 'SIN DATOS / ANÓNIMO',
  });
  const [customerSearchNit, setCustomerSearchNit] = useState('0');
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const [customerNotFound, setCustomerNotFound] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [cameraScannerOpen, setCameraScannerOpen] = useState(false);

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadProducts = useCallback(async () => {
    try {
      const data = await ProductModel.getAll();
      setProducts(data);
    } catch (e: any) {
      showToast('Error cargando catálogo de productos: ' + e.message, 'error');
    }
  }, []);

  useEffect(() => {
    loadProducts();
    const unsubscribe = mockStore.subscribe(() => {
      loadProducts();
    });
    return () => {
      unsubscribe();
    };
  }, [loadProducts]);

  // Escáner de lector físico USB (Hook de captura de código de barras)
  useEffect(() => {
    let barcodeBuffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = async (e: KeyboardEvent) => {
      const activeElem = document.activeElement;
      if (
        activeElem &&
        (activeElem.tagName === 'INPUT' || activeElem.tagName === 'TEXTAREA') &&
        (activeElem as HTMLElement).id !== 'physical-barcode-listener'
      ) {
        return;
      }

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 100) {
        barcodeBuffer = '';
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (barcodeBuffer.length >= 3) {
          e.preventDefault();
          try {
            const { updatedCart, scannedProduct } = await POSController.scanBarcode(barcodeBuffer, cart);
            setCart(updatedCart);
            showToast(`¡Añadido! ${scannedProduct.nombre}`, 'success');
          } catch (err: any) {
            showToast(err.message, 'error');
          }
          barcodeBuffer = '';
        }
      } else if (e.key.length === 1) {
        barcodeBuffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [cart]);

  // Escanear código mediante la cámara o manual
  const handleBarcodeScanned = async (code: string) => {
    try {
      const { updatedCart, scannedProduct } = await POSController.scanBarcode(code, cart);
      setCart(updatedCart);
      showToast(`¡Añadido! ${scannedProduct.nombre}`, 'success');
      setCameraScannerOpen(false);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Búsqueda de cliente por NIT / CI con Autocompletado
  const handleSearchCustomer = async (nit: string) => {
    setCustomerSearchNit(nit);
    setCustomerNotFound(false);
    if (!nit || nit.trim() === '' || nit.trim() === '0') {
      setCustomer({
        id: 'c0',
        nit_ci: '0',
        razon_social: 'SIN DATOS / ANÓNIMO',
      });
      return;
    }

    setIsSearchingCustomer(true);
    try {
      const found = await POSController.findCustomer(nit);
      if (found) {
        setCustomer(found);
        setCustomerNotFound(false);
      } else {
        setCustomerNotFound(true);
        setCustomer({
          id: 'draft',
          nit_ci: nit,
          razon_social: '',
        });
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSearchingCustomer(false);
    }
  };

  // Registro expres de cliente
  const handleRegisterCustomer = async (razon_social: string, telefono?: string, email?: string) => {
    try {
      const newCust = await POSController.registerCustomer(customerSearchNit, razon_social, telefono, email);
      setCustomer(newCust);
      setCustomerNotFound(false);
      showToast('Cliente registrado con éxito', 'success');
    } catch (err: any) {
      showToast('Error al registrar cliente: ' + err.message, 'error');
    }
  };

  // Modificar cantidad
  const handleUpdateQuantity = (productId: string, quantity: number) => {
    try {
      const updated = POSController.updateItemQuantity(cart, productId, quantity);
      setCart(updated);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Remover del carrito
  const handleRemoveItem = (productId: string) => {
    const updated = POSController.removeItem(cart, productId);
    setCart(updated);
  };

  // Limpiar carrito
  const handleClearCart = () => {
    setCart([]);
  };

  // Finalizar cobro
  const handleFinalizeSale = async (paymentMethod: PaymentMethod, montoRecibido: number) => {
    if (!currentUser) {
      showToast('Debes iniciar sesión para procesar la venta.', 'error');
      return;
    }

    try {
      const sale = await POSController.processSale({
        cart,
        customer,
        user: currentUser,
        paymentMethod,
        montoRecibido,
      });

      setCompletedSale(sale);
      setCart([]);
      setPaymentModalOpen(false);
      setTicketModalOpen(true);
      showToast('¡Venta procesada con éxito!', 'success');
      loadProducts();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const totals = POSController.calculateTotals(cart);

  return {
    products,
    cart,
    customer,
    customerSearchNit,
    isSearchingCustomer,
    customerNotFound,
    paymentModalOpen,
    ticketModalOpen,
    completedSale,
    cameraScannerOpen,
    notification,
    totals,
    setCameraScannerOpen,
    setPaymentModalOpen,
    setTicketModalOpen,
    handleBarcodeScanned,
    handleSearchCustomer,
    handleRegisterCustomer,
    handleUpdateQuantity,
    handleRemoveItem,
    handleClearCart,
    handleFinalizeSale,
  };
}
