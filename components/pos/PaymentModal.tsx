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

  const handleExactCash = () => {
    setMontoRecibidoStr(total.toFixed(2));
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-card text-card-foreground w-full max-w-lg rounded-3xl p-6 relative border border-primary/30 shadow-2xl space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Encabezado */}
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Calculator className="w-7 h-7 text-primary" /> Cobro y Procesamiento
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Cliente: <strong className="text-foreground">{customerName}</strong> ({customerNit})
          </p>
        </div>

        {/* Banner de Total */}
        <div className="bg-primary/10 border border-primary/30 rounded-2xl p-5 text-center">
          <span className="text-xs font-semibold text-primary tracking-wider uppercase">Total a Cobrar</span>
          <div className="text-4xl font-extrabold text-foreground mt-1">
            Bs. {total.toFixed(2)}
          </div>
        </div>

        {/* Métodos de Pago */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-wider">
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
                  ? 'bg-primary/20 border-primary text-foreground shadow-lg shadow-primary/10'
                  : 'bg-muted/40 border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
              }`}
            >
              <Banknote className="w-6 h-6 mb-1 text-primary" />
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
                  ? 'bg-indigo-500/20 border-indigo-500 text-foreground shadow-lg shadow-indigo-500/10'
                  : 'bg-muted/40 border-border text-muted-foreground hover:border-indigo-500/50 hover:text-foreground'
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
                  ? 'bg-blue-500/20 border-blue-500 text-foreground shadow-lg shadow-blue-500/10'
                  : 'bg-muted/40 border-border text-muted-foreground hover:border-blue-500/50 hover:text-foreground'
              }`}
            >
              <CreditCard className="w-6 h-6 mb-1 text-blue-400" />
              <span className="text-xs font-bold">Tarjeta</span>
            </button>
          </div>
        </div>

        {/* Sección Específica para Efectivo (Campo + Botón Monto Exacto al lado) */}
        {method === 'efectivo' && (
          <div className="space-y-4 bg-muted/50 rounded-2xl p-4 border border-border">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block font-medium">Monto Recibido (Bs.)</label>
              <div className="flex gap-2.5 items-center">
                <input
                  type="number"
                  step="0.5"
                  min={total}
                  value={montoRecibidoStr}
                  onChange={(e) => {
                    setMontoRecibidoStr(e.target.value);
                    setError(null);
                  }}
                  className="flex-1 bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary text-2xl font-bold text-foreground rounded-xl px-4 py-2 outline-none transition-colors"
                />

                {/* Botón Monto Exacto al lado del campo de texto */}
                <button
                  type="button"
                  onClick={handleExactCash}
                  className="px-4 py-3 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs rounded-xl border border-primary/30 transition-colors shrink-0 whitespace-nowrap"
                >
                  Monto Exacto
                </button>
              </div>
            </div>

            {/* Vuelto / Cambio */}
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="text-sm font-semibold text-foreground/80">Cambio / Vuelto:</span>
              <span
                className={`text-2xl font-extrabold ${
                  insuficiente ? 'text-destructive' : 'text-primary'
                }`}
              >
                Bs. {cambio.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {method === 'qr' && (
          <div className="bg-muted/50 rounded-2xl p-6 border border-border text-center space-y-3">
            <div className="mx-auto w-36 h-36 bg-white p-2 rounded-xl flex items-center justify-center shadow-lg">
              <div className="w-full h-full border-4 border-black p-1 flex flex-col justify-between items-center bg-gray-50">
                <div className="text-[9px] font-black text-black tracking-tight">QUICKMART QR</div>
                <QrCode className="w-20 h-20 text-slate-900" />
                <div className="text-[10px] font-bold text-emerald-600">Bs. {total.toFixed(2)}</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Muestra el código QR al cliente para escanear desde su banca móvil</p>
          </div>
        )}

        {method === 'tarjeta' && (
          <div className="bg-muted/50 rounded-2xl p-6 border border-border text-center space-y-2">
            <CreditCard className="w-12 h-12 text-blue-400 mx-auto animate-pulse" />
            <h4 className="text-sm font-bold text-foreground">Acerque o inserte la tarjeta en el POS físico</h4>
            <p className="text-xs text-muted-foreground">Presione Confirmar Venta una vez autorizada la transacción</p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-1/3 py-3 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-xl text-sm transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleProcess}
            disabled={insuficiente}
            className="w-2/3 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-bold rounded-xl text-sm shadow-md shadow-primary/20 flex items-center justify-center gap-2 transition-all"
          >
            <CheckCircle className="w-5 h-5" /> Confirmar y Emitir Ticket
          </button>
        </div>
      </div>
    </div>
  );
}
