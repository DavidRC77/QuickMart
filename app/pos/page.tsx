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
} from 'lucide-react';

export default function POSPage() {
  const { user } = useAuth(); // Accessible for both Cajero and Admin
  const pos = usePosController(user);

  const [manualSearch, setManualSearch] = useState('');
  const [newCustomerRazon, setNewCustomerRazon] = useState('');
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);

  // Filtrado manual de productos
  const searchResults = pos.products.filter(
    (p) =>
      p.nombre.toLowerCase().includes(manualSearch.toLowerCase()) ||
      p.codigo_barras.includes(manualSearch.trim())
  );

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Toast Notification */}
      {pos.notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl border text-sm font-bold flex items-center gap-3 animate-in slide-in-from-bottom duration-200 ${
            pos.notification.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : 'bg-red-950/90 border-red-500/50 text-red-200'
          }`}
        >
          {pos.notification.type === 'success' ? <Check className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
          <span>{pos.notification.message}</span>
        </div>
      )}

      {/* COLUMNA IZQUIERDA: Catálogo, Buscador y Escáner (7 Cols) */}
      <div className="lg:col-span-7 space-y-4 flex flex-col">
        {/* Barra Superior de Búsqueda y Cámara */}
        <div className="glass-panel p-4 rounded-3xl border border-gray-800 flex flex-col sm:flex-row gap-3 items-center">
          {/* Buscador Manual */}
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar producto por nombre o código de barras..."
              value={manualSearch}
              onChange={(e) => setManualSearch(e.target.value)}
              className="w-full bg-gray-950/80 border border-gray-800 focus:border-emerald-500 text-white rounded-2xl pl-11 pr-4 py-2.5 text-sm outline-none transition-colors"
            />
          </div>

          {/* Botón Escáner Cámara */}
          <button
            type="button"
            onClick={() => pos.setCameraScannerOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-2xl text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all shrink-0"
          >
            <Camera className="w-5 h-5" />
            <span>Escanear Cámara</span>
          </button>
        </div>

        {/* Catálogo de Productos con Escaneo Directo */}
        <div className="glass-panel p-5 rounded-3xl border border-gray-800 flex-1 flex flex-col min-h-[500px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Barcode className="w-5 h-5 text-emerald-400" /> Catálogo & Resultados
            </h2>
            <span className="text-xs text-gray-400 font-medium">
              {searchResults.length} productos disponibles
            </span>
          </div>

          {searchResults.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500">
              <Package className="w-12 h-12 mb-2 stroke-1 opacity-50" />
              <p className="text-sm font-medium">No se encontraron productos coincidentes.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-[550px] pr-1">
              {searchResults.map((product) => (
                <div
                  key={product.id}
                  onClick={() => pos.handleBarcodeScanned(product.codigo_barras)}
                  className={`glass-card p-4 rounded-2xl border cursor-pointer flex flex-col justify-between space-y-3 ${
                    product.stock_actual <= 0
                      ? 'opacity-50 border-red-500/20 bg-red-950/10 cursor-not-allowed'
                      : 'hover:border-emerald-500/40'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        {product.categoria_nombre}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          product.stock_actual <= product.stock_minimo
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        Stock: {product.stock_actual} u.
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-2 line-clamp-1">{product.nombre}</h3>
                    <p className="text-[11px] text-gray-400 font-mono">Cód: {product.codigo_barras}</p>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-800/60">
                    <span className="text-lg font-extrabold text-white">Bs. {product.precio_venta.toFixed(2)}</span>
                    <button
                      type="button"
                      disabled={product.stock_actual <= 0}
                      className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors disabled:opacity-30"
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

      {/* COLUMNA DERECHA: Carrito y Cliente (5 Cols) */}
      <div className="lg:col-span-5 space-y-4 flex flex-col">
        {/* Gestión de Cliente / NIT */}
        <div className="glass-panel p-5 rounded-3xl border border-gray-800 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" /> Facturación / Cliente
            </h3>
            <button
              type="button"
              onClick={() => {
                pos.handleSearchCustomer('0');
                setShowNewCustomerForm(false);
              }}
              className="text-[11px] font-semibold text-emerald-400 hover:underline"
            >
              Limpiar
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ingrese NIT o CI..."
              value={pos.customerSearchNit}
              onChange={(e) => pos.handleSearchCustomer(e.target.value)}
              className="flex-1 bg-gray-950/80 border border-gray-800 focus:border-emerald-500 text-white rounded-xl px-3 py-2 text-sm outline-none transition-colors"
            />
          </div>

          {pos.customerNotFound ? (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2">
              <p className="text-xs text-amber-300 font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> NIT/CI no registrado en la BD.
              </p>
              {!showNewCustomerForm ? (
                <button
                  type="button"
                  onClick={() => setShowNewCustomerForm(true)}
                  className="w-full py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-colors"
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
                    className="w-full bg-gray-950 border border-amber-500/40 text-white rounded-xl px-3 py-1.5 text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newCustomerRazon.trim()) {
                        pos.handleRegisterCustomer(newCustomerRazon);
                        setShowNewCustomerForm(false);
                      }
                    }}
                    className="w-full py-1.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                  >
                    Guardar Cliente
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-gray-900/80 border border-gray-800 rounded-2xl flex justify-between items-center">
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-bold block">Razón Social / Nombre</span>
                <span className="text-sm font-bold text-white">{pos.customer.razon_social}</span>
              </div>
              <span className="text-xs text-gray-400 font-mono">NIT: {pos.customer.nit_ci}</span>
            </div>
          )}
        </div>

        {/* Tabla / Lista de Carrito */}
        <div className="glass-panel p-5 rounded-3xl border border-gray-800 flex-1 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-400" /> Carrito de Compras ({pos.totals.itemCount})
            </h3>
            {pos.cart.length > 0 && (
              <button
                type="button"
                onClick={pos.handleClearCart}
                className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Vaciar
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2 pr-1 my-2">
            {pos.cart.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center text-gray-500">
                <ShoppingCart className="w-10 h-10 mb-2 stroke-1 opacity-40" />
                <p className="text-xs">El carrito está vacío. Escanea o selecciona productos.</p>
              </div>
            ) : (
              pos.cart.map((item) => (
                <div
                  key={item.producto.id}
                  className="bg-gray-900/90 border border-gray-800/80 p-3 rounded-2xl flex items-center justify-between gap-2 hover:border-gray-700 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{item.producto.nombre}</h4>
                    <span className="text-[11px] text-gray-400">Bs. {item.producto.precio_venta.toFixed(2)} c/u</span>
                  </div>

                  {/* Controles de Cantidad */}
                  <div className="flex items-center gap-1.5 bg-gray-950 p-1 rounded-xl border border-gray-800">
                    <button
                      type="button"
                      onClick={() => pos.handleUpdateQuantity(item.producto.id, item.cantidad - 1)}
                      className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-white">{item.cantidad}</span>
                    <button
                      type="button"
                      onClick={() => pos.handleUpdateQuantity(item.producto.id, item.cantidad + 1)}
                      className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-sm font-extrabold text-emerald-400 w-20 text-right">
                    Bs. {item.subtotal.toFixed(2)}
                  </span>

                  <button
                    type="button"
                    onClick={() => pos.handleRemoveItem(item.producto.id)}
                    className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Resumen de Total & Botón Procesar Pago */}
          <div className="pt-4 border-t border-gray-800 space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Total a Pagar</span>
                <span className="text-xs text-gray-500 font-medium">{pos.totals.itemCount} unidades en carrito</span>
              </div>
              <span className="text-3xl font-extrabold text-white">Bs. {pos.totals.total.toFixed(2)}</span>
            </div>

            <button
              type="button"
              disabled={pos.cart.length === 0}
              onClick={() => pos.setPaymentModalOpen(true)}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold rounded-2xl text-base shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
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
