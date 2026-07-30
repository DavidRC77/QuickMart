'use client';

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { usePosController } from '../../hooks/usePosController';
import { BarcodeScannerModal } from '../../components/pos/BarcodeScannerModal';
import { PaymentModal } from '../../components/pos/PaymentModal';
import { TicketModal } from '../../components/pos/TicketModal';
import {
  Camera,
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  UserPlus,
  User,
  CreditCard,
  Barcode,
  Check,
  AlertCircle,
  Package,
  RotateCcw,
} from 'lucide-react';

export default function POSPage() {
  const { user, loading } = useAuth(); // Requiere autenticación activa
  const pos = usePosController(user);

  const [manualSearch, setManualSearch] = useState('');
  const [newCustomerRazon, setNewCustomerRazon] = useState('');
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);

  if (loading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0b0f17]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-gray-400">Verificando sesión...</span>
        </div>
      </div>
    );
  }

  // Filtrado reactivo de productos SOLO cuando el usuario escribe en el buscador
  const isSearching = manualSearch.trim().length > 0;
  const searchResults = isSearching
    ? pos.products.filter(
        (p) =>
          p.nombre.toLowerCase().includes(manualSearch.toLowerCase()) ||
          p.codigo_barras.includes(manualSearch.trim())
      )
    : [];

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Toast Notification */}
      {pos.notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl border text-sm font-bold flex items-center gap-3 animate-in slide-in-from-bottom duration-200 ${
            pos.notification.type === 'success'
              ? 'bg-primary/20 border-primary/50 text-primary'
              : 'bg-destructive/20 border-destructive/50 text-destructive'
          }`}
        >
          {pos.notification.type === 'success' ? <Check className="w-5 h-5 text-primary" /> : <AlertCircle className="w-5 h-5 text-destructive" />}
          <span>{pos.notification.message}</span>
        </div>
      )}

      {/* COLUMNA IZQUIERDA: Cliente primero, luego Buscador/Cámara y Resultados (7 Cols) */}
      <div className="lg:col-span-7 space-y-4 flex flex-col">
        {/* 1. SECCIÓN SUPERIOR: Datos de Facturación / Cliente */}
        <div className="bg-card text-card-foreground p-5 rounded-3xl border border-border space-y-3 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Facturación / Datos del Cliente
            </h3>
            {/* Botón Limpiar NIT */}
            <button
              type="button"
              onClick={() => {
                pos.handleResetCustomer();
                setShowNewCustomerForm(false);
              }}
              className="text-xs text-primary hover:text-primary/80 font-bold flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-xl border border-primary/20 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Limpiar
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ingrese NIT o CI del cliente..."
              value={pos.customerSearchNit}
              onChange={(e) => pos.handleSearchCustomer(e.target.value)}
              className="flex-1 bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary text-foreground rounded-xl px-3 py-2 text-sm outline-none font-mono transition-colors"
            />
          </div>

          {pos.customerNotFound ? (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2">
              <p className="text-xs text-amber-500 font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> NIT/CI no registrado en la base de datos.
              </p>
              {!showNewCustomerForm ? (
                <button
                  type="button"
                  onClick={() => setShowNewCustomerForm(true)}
                  className="w-full py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Registrar Cliente Ahora
                </button>
              ) : (
                <div className="space-y-2 pt-1">
                  <input
                    type="text"
                    placeholder="Razón Social / Nombre Completo"
                    value={newCustomerRazon}
                    onChange={(e) => setNewCustomerRazon(e.target.value)}
                    className="w-full bg-background border border-amber-500/40 text-foreground rounded-xl px-3 py-1.5 text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newCustomerRazon.trim()) {
                        pos.handleRegisterCustomer(newCustomerRazon);
                        setShowNewCustomerForm(false);
                      }
                    }}
                    className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold rounded-xl text-xs transition-colors"
                  >
                    Guardar Cliente
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-muted border border-border rounded-2xl flex justify-between items-center">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Razón Social / Nombre</span>
                <span className="text-sm font-bold text-foreground uppercase">{pos.customer.razon_social}</span>
              </div>
              <span className="text-xs text-primary font-mono font-bold">NIT: {pos.customer.nit_ci}</span>
            </div>
          )}
        </div>

        {/* 2. BARRA DE BÚSQUEDA MANUAL & ESCÁNER DE CÁMARA */}
        <div className="bg-card text-card-foreground p-4 rounded-3xl border border-border flex flex-col sm:flex-row gap-3 items-center shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-muted-foreground absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar producto por nombre o código de barras..."
              value={manualSearch}
              onChange={(e) => setManualSearch(e.target.value)}
              className="w-full bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary text-foreground rounded-2xl pl-11 pr-4 py-2.5 text-sm outline-none transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={() => pos.setCameraScannerOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl text-sm shadow-md shadow-primary/20 flex items-center justify-center gap-2 transition-all shrink-0"
          >
            <Camera className="w-5 h-5" />
            <span>Escanear Cámara</span>
          </button>
        </div>

        {/* 3. RESULTADOS DE LA BÚSQUEDA */}
        <div className="bg-card text-card-foreground p-5 rounded-3xl border border-border flex-1 flex flex-col min-h-[300px] shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Barcode className="w-4 h-4 text-primary" /> Resultados de Búsqueda
            </h2>
            {isSearching && (
              <span className="text-xs text-primary font-medium">
                {searchResults.length} coincidencias encontradas
              </span>
            )}
          </div>

          {!isSearching ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground space-y-2">
              <Barcode className="w-12 h-12 stroke-1 opacity-40 text-primary" />
              <p className="text-sm font-medium text-foreground">Listo para escanear productos</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                Usa la pistola lectora USB, activa la cámara o escribe el nombre/código de barras arriba para agregar ítems.
              </p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
              <Package className="w-10 h-10 mb-2 stroke-1 opacity-40" />
              <p className="text-sm font-medium">No se encontraron productos con "{manualSearch}".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-[400px] pr-1">
              {searchResults.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    pos.handleBarcodeScanned(product.codigo_barras);
                    setManualSearch('');
                  }}
                  className={`bg-background p-4 rounded-2xl border border-border cursor-pointer flex flex-col justify-between space-y-3 ${
                    product.stock_actual <= 0
                      ? 'opacity-50 border-destructive/20 bg-destructive/10 cursor-not-allowed'
                      : 'hover:border-primary/40 hover:shadow-md transition-all'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                        {product.categoria_nombre}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          product.stock_actual <= product.stock_minimo
                            ? 'bg-destructive/20 text-destructive border border-destructive/30'
                            : 'bg-muted text-muted-foreground border border-border'
                        }`}
                      >
                        Stock: {product.stock_actual} u.
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-foreground mt-2 line-clamp-1">{product.nombre}</h3>
                    <p className="text-[11px] text-muted-foreground font-mono">Cód: {product.codigo_barras}</p>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <span className="text-lg font-extrabold text-foreground">Bs. {product.precio_venta.toFixed(2)}</span>
                    <button
                      type="button"
                      disabled={product.stock_actual <= 0}
                      className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl text-xs flex items-center gap-1 transition-colors disabled:opacity-30"
                    >
                      <Plus className="w-3.5 h-3.5" /> Agregar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* COLUMNA DERECHA: Carrito de Compras y Procesamiento de Pago (5 Cols) */}
      <div className="lg:col-span-5 space-y-4 flex flex-col">
        <div className="bg-card text-card-foreground p-5 rounded-3xl border border-border flex-1 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-primary" /> Carrito de Compras ({pos.totals.itemCount})
            </h3>
            {pos.cart.length > 0 && (
              <button
                type="button"
                onClick={pos.handleClearCart}
                className="text-xs text-destructive hover:text-destructive/80 font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Vaciar
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto max-h-[380px] space-y-2 pr-1 my-2">
            {pos.cart.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center text-muted-foreground">
                <ShoppingCart className="w-10 h-10 mb-2 stroke-1 opacity-40" />
                <p className="text-xs">El carrito está vacío. Escanea o busca productos arriba.</p>
              </div>
            ) : (
              pos.cart.map((item) => (
                <div
                  key={item.producto.id}
                  className="bg-background border border-border p-3 rounded-2xl flex items-center justify-between gap-2 hover:border-primary/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-foreground truncate">{item.producto.nombre}</h4>
                    <span className="text-[11px] text-muted-foreground">Bs. {item.producto.precio_venta.toFixed(2)} c/u</span>
                  </div>

                  {/* Controles de Cantidad */}
                  <div className="flex items-center gap-1.5 bg-muted p-1 rounded-xl border border-border">
                    <button
                      type="button"
                      onClick={() => pos.handleUpdateQuantity(item.producto.id, item.cantidad - 1)}
                      className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-background transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-foreground">{item.cantidad}</span>
                    <button
                      type="button"
                      onClick={() => pos.handleUpdateQuantity(item.producto.id, item.cantidad + 1)}
                      className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-background transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-sm font-extrabold text-primary w-20 text-right">
                    Bs. {item.subtotal.toFixed(2)}
                  </span>

                  <button
                    type="button"
                    onClick={() => pos.handleRemoveItem(item.producto.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Resumen de Total & Botón Procesar Pago */}
          <div className="pt-4 border-t border-border space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Total a Pagar</span>
                <span className="text-xs text-muted-foreground font-medium">{pos.totals.itemCount} unidades en carrito</span>
              </div>
              <span className="text-3xl font-extrabold text-foreground">Bs. {pos.totals.total.toFixed(2)}</span>
            </div>

            <button
              type="button"
              disabled={pos.cart.length === 0}
              onClick={() => pos.setPaymentModalOpen(true)}
              className="w-full py-4 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-extrabold rounded-2xl text-base shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all"
            >
              <CreditCard className="w-5 h-5" /> Cobrar y Procesar Pago
            </button>
          </div>
        </div>
      </div>

      {/* Modales de Escáner, Pago y Comprobante */}
      <BarcodeScannerModal
        isOpen={pos.cameraScannerOpen}
        onClose={() => pos.setCameraScannerOpen(false)}
        onScan={pos.handleBarcodeScanned}
      />

      <PaymentModal
        isOpen={pos.paymentModalOpen}
        total={pos.totals.total}
        customerName={pos.customer.razon_social}
        customerNit={pos.customer.nit_ci}
        onClose={() => pos.setPaymentModalOpen(false)}
        onConfirm={pos.handleFinalizeSale}
      />

      <TicketModal
        isOpen={pos.ticketModalOpen}
        sale={pos.completedSale}
        onClose={() => pos.setTicketModalOpen(false)}
      />
    </div>
  );
}
