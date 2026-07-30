'use client';

import { Sale } from '../../lib/models/types';
import { Printer, CheckCircle2, X, ShoppingBag } from 'lucide-react';

interface Props {
  isOpen: boolean;
  sale: Sale | null;
  onClose: () => void;
}

export function TicketModal({ isOpen, sale, onClose }: Props) {
  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 relative border border-emerald-500/30 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Encabezado */}
        <div className="flex justify-between items-start border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Venta Exitosa</h3>
              <p className="text-xs text-gray-400">Comprobante de Venta Emitido</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vista previa del ticket */}
        <div className="overflow-y-auto flex-1 p-1">
          <div
            id="printable-ticket"
            className="bg-white text-slate-900 rounded-2xl p-5 text-xs font-mono shadow-inner border border-gray-200 leading-normal"
          >
            {/* Header del Ticket */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-gray-300">
              <div className="flex items-center justify-center gap-1 text-base font-black tracking-tight text-slate-900 uppercase">
                <ShoppingBag className="w-4 h-4" /> QuickMart
              </div>
              <p className="text-[11px] text-gray-600">Micromercado</p>
              <p className="text-[11px] text-gray-600">NIT: 1029384756 | Tel: 70000000</p>
              <div className="pt-2 font-bold text-sm text-emerald-700">{sale.numero_factura}</div>
              <p className="text-[11px] text-gray-500">{new Date(sale.fecha).toLocaleString()}</p>
            </div>

            {/* Datos del Cliente y Cajero */}
            <div className="py-3 border-b border-dashed border-gray-300 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Cliente:</span>
                <span className="font-bold text-slate-800 uppercase">{sale.razon_social}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">NIT/CI:</span>
                <span className="font-bold text-slate-800">{sale.nit_ci}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cajero:</span>
                <span className="text-slate-700">{sale.usuario_nombre || 'Cajero'}</span>
              </div>
            </div>

            {/* Detalle de Productos */}
            <div className="py-3 border-b border-dashed border-gray-300 space-y-2 text-xs">
              <div className="grid grid-cols-12 font-bold text-[11px] text-gray-500 uppercase pb-1 border-b border-gray-200">
                <span className="col-span-6">Producto</span>
                <span className="col-span-2 text-center">Cant</span>
                <span className="col-span-4 text-right">Subtotal</span>
              </div>
              {sale.detalles.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 text-xs items-center">
                  <span className="col-span-6 truncate font-medium text-slate-900">{item.producto_nombre || 'Producto'}</span>
                  <span className="col-span-2 text-center text-slate-600">{item.cantidad}</span>
                  <span className="col-span-4 text-right font-bold text-slate-900">Bs. {item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Totales y Método de Pago */}
            <div className="pt-3 space-y-1 text-xs">
              <div className="flex justify-between text-sm font-black text-slate-900 pt-1">
                <span>TOTAL A PAGAR:</span>
                <span className="text-emerald-700">Bs. {sale.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Método de Pago:</span>
                <span className="font-bold uppercase">{sale.metodo_pago}</span>
              </div>
              {sale.metodo_pago === 'efectivo' && (
                <>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Monto Recibido:</span>
                    <span>Bs. {sale.monto_recibido.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>Cambio / Vuelto:</span>
                    <span>Bs. {sale.cambio.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Mensaje de agradecimiento */}
            <div className="text-center pt-4 border-t border-dashed border-gray-300 mt-4 text-xs text-gray-500">
              <p className="font-bold">¡Gracias por su compra en QuickMart!</p>
              <p>Conserve este ticket para cualquier reclamo</p>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="w-1/2 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl text-sm transition-colors"
          >
            Nueva Venta
          </button>
          <button
            onClick={handlePrint}
            className="w-1/2 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
          >
            <Printer className="w-5 h-5" /> Imprimir Ticket
          </button>
        </div>
      </div>
    </div>
  );
}
