'use client';

import { useState } from 'react';
import { PaymentMethod } from '../../lib/models/types';
import { Banknote, QrCode, CreditCard, X, CheckCircle, Calculator } from 'lucide-react';

interface Props {
  isOpen: boolean;
  total: number;
  customerName: string;
  customerNit: string;
  onClose: () => void;
  onConfirm: (method: PaymentMethod, montoRecibido: number) => void;
}

export function PaymentModal({ isOpen, total, customerName, customerNit, onClose, onConfirm }: Props) {
  const [method, setMethod] = useState<PaymentMethod>('efectivo');
  const [montoRecibidoStr, setMontoRecibidoStr] = useState<string>(total.toFixed(2));
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const montoRecibido = parseFloat(montoRecibidoStr) || 0;
  const cambio = method === 'efectivo' ? Math.max(0, montoRecibido - total) : 0;
  const insuficiente = method === 'efectivo' && montoRecibido < total;

  const handleProcess = () => {
    if (method === 'efectivo' && montoRecibido < total) {
      setError(`Monto recibido insuficiente. Faltan Bs. ${(total - montoRecibido).toFixed(2)}`);
      return;
    }
    setError(null);
    onConfirm(method, method === 'efectivo' ? montoRecibido : total);
  };

  const handlePresetCash = (amount: number) => {
    setMontoRecibidoStr(amount.toString());
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 relative border border-emerald-500/30 shadow-2xl space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Encabezado */}
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calculator className="w-7 h-7 text-emerald-400" /> Cobro y Procesamiento
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Cliente: <strong className="text-gray-200">{customerName}</strong> ({customerNit})
          </p>
        </div>

        {/* Banner de Total */}
        <div className="bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border border-emerald-500/30 rounded-2xl p-5 text-center">
          <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">Total a Cobrar</span>
          <div className="text-4xl font-extrabold text-white mt-1">
            Bs. {total.toFixed(2)}
          </div>
        </div>

        {/* Métodos de Pago */}
        <div>
          <label className="text-xs font-semibold text-gray-400 block mb-2 uppercase tracking-wider">
            Método de Pago
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => {
                setMethod('efectivo');
                setMontoRecibidoStr(total.toFixed(2));
                setError(null);
              }}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                method === 'efectivo'
                  ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                  : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200'
              }`}
            >
              <Banknote className="w-6 h-6 mb-1 text-emerald-400" />
              <span className="text-xs font-bold">Efectivo</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMethod('qr');
                setError(null);
              }}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                method === 'qr'
                  ? 'bg-indigo-500/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                  : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200'
              }`}
            >
              <QrCode className="w-6 h-6 mb-1 text-indigo-400" />
              <span className="text-xs font-bold">Pago QR</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMethod('tarjeta');
                setError(null);
              }}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                method === 'tarjeta'
                  ? 'bg-blue-500/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                  : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200'
              }`}
            >
              <CreditCard className="w-6 h-6 mb-1 text-blue-400" />
              <span className="text-xs font-bold">Tarjeta</span>
            </button>
          </div>
        </div>

        {/* Sección Específica según Método */}
        {method === 'efectivo' && (
          <div className="space-y-4 bg-gray-900/80 rounded-2xl p-4 border border-gray-800">
            <div>
              <label className="text-xs text-gray-400 mb-1 block font-medium">Monto Recibido (Bs.)</label>
              <input
                type="number"
                step="0.5"
                min={total}
                value={montoRecibidoStr}
                onChange={(e) => {
                  setMontoRecibidoStr(e.target.value);
                  setError(null);
                }}
                className="w-full bg-gray-950 border border-gray-700 focus:border-emerald-500 text-2xl font-bold text-white rounded-xl px-4 py-2 outline-none transition-colors"
              />
            </div>

            {/* Presets de Efectivo rápido */}
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handlePresetCash(total)}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-emerald-400 text-xs font-bold rounded-lg border border-gray-700"
              >
                Exacto (Bs. {total.toFixed(2)})
              </button>
              {[20, 50, 100, 200].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetCash(preset)}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-lg border border-gray-700"
                >
                  Bs. {preset}
                </button>
              ))}
            </div>

            {/* Vuelto / Cambio */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-800">
              <span className="text-sm font-semibold text-gray-300">Cambio / Vuelto:</span>
              <span
                className={`text-2xl font-extrabold ${
                  insuficiente ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                Bs. {cambio.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {method === 'qr' && (
          <div className="bg-gray-900/80 rounded-2xl p-6 border border-gray-800 text-center space-y-3">
            <div className="mx-auto w-36 h-36 bg-white p-2 rounded-xl flex items-center justify-center shadow-lg">
              {/* Código QR generado visualmente */}
              <div className="w-full h-full border-4 border-black p-1 flex flex-col justify-between items-center bg-gray-50">
                <div className="text-[9px] font-black text-black tracking-tight">QUICKMART QR</div>
                <QrCode className="w-20 h-20 text-slate-900" />
                <div className="text-[10px] font-bold text-emerald-600">Bs. {total.toFixed(2)}</div>
              </div>
            </div>
            <p className="text-xs text-gray-400">Muestra el código QR al cliente para escanear desde su banca móvil</p>
          </div>
        )}

        {method === 'tarjeta' && (
          <div className="bg-gray-900/80 rounded-2xl p-6 border border-gray-800 text-center space-y-2">
            <CreditCard className="w-12 h-12 text-blue-400 mx-auto animate-pulse" />
            <h4 className="text-sm font-bold text-white">Acerque o inserte la tarjeta en el POS físico</h4>
            <p className="text-xs text-gray-400">Presione Confirmar Venta una vez autorizada la transacción</p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-1/3 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl text-sm transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleProcess}
            disabled={insuficiente}
            className="w-2/3 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
          >
            <CheckCircle className="w-5 h-5" /> Confirmar y Emitir Ticket
          </button>
        </div>
      </div>
    </div>
  );
}
