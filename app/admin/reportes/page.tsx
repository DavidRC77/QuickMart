'use client';

import { useState, useEffect, useCallback } from 'react';
import { SaleModel } from '../../../lib/models/saleModel';
import { DailyReport, Sale } from '../../../lib/models/types';
import { TicketModal } from '../../../components/pos/TicketModal';
import { BarChart3, Banknote, QrCode, CreditCard, Calendar, Printer, Eye, DollarSign, ShoppingBag } from 'lucide-react';

export default function AdminReportesPage() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState<DailyReport | null>(null);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [ticketOpen, setTicketOpen] = useState(false);

  const fetchReport = useCallback(async (dateStr: string) => {
    try {
      const data = await SaleModel.getDailyReport(dateStr);
      setReport(data);
    } catch (err) {
      console.error('Error cargando reporte diario:', err);
    }
  }, []);

  useEffect(() => {
    fetchReport(selectedDate);
  }, [selectedDate, fetchReport]);

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Encabezado y Filtro por Fecha */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" /> Reporte Diario y Cierre de Caja
          </h1>
          <p className="text-xs text-gray-400 mt-1">Resumen de ingresos, transacciones y desglose por método de pago</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-gray-950/80 border border-gray-800 focus:border-emerald-500 text-white rounded-2xl pl-10 pr-4 py-2 text-sm outline-none font-bold"
            />
          </div>

          <button
            onClick={handlePrintReport}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold rounded-2xl text-sm border border-gray-700 flex items-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" /> Imprimir Reporte
          </button>
        </div>
      </div>

      {/* Grid de Resumen del Día */}
      {report && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Ingresos */}
          <div className="glass-panel p-5 rounded-3xl border border-emerald-500/30 space-y-1">
            <span className="text-xs font-semibold text-gray-400 uppercase">Total Ingresos</span>
            <div className="text-3xl font-extrabold text-emerald-400">Bs. {report.totalIngresos.toFixed(2)}</div>
            <span className="text-[11px] text-gray-400 block">{report.totalVentas} transacciones en la fecha</span>
          </div>

          {/* Desglose Efectivo */}
          <div className="glass-panel p-5 rounded-3xl border border-emerald-500/20 space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase">
              <Banknote className="w-4 h-4" /> Ingresos en Efectivo
            </div>
            <div className="text-2xl font-extrabold text-white">Bs. {report.efectivoTotal.toFixed(2)}</div>
            <span className="text-[11px] text-gray-400">Arqueo físico de caja</span>
          </div>

          {/* Desglose QR */}
          <div className="glass-panel p-5 rounded-3xl border border-indigo-500/20 space-y-1">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase">
              <QrCode className="w-4 h-4" /> Ingresos por QR
            </div>
            <div className="text-2xl font-extrabold text-white">Bs. {report.qrTotal.toFixed(2)}</div>
            <span className="text-[11px] text-gray-400">Transferencias recibidas</span>
          </div>

          {/* Desglose Tarjeta */}
          <div className="glass-panel p-5 rounded-3xl border border-blue-500/20 space-y-1">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase">
              <CreditCard className="w-4 h-4" /> Ingresos por Tarjeta
            </div>
            <div className="text-2xl font-extrabold text-white">Bs. {report.tarjetaTotal.toFixed(2)}</div>
            <span className="text-[11px] text-gray-400">Pagos pos débito/crédito</span>
          </div>
        </div>
      )}

      {/* Tabla de Ventas Registradas en la Fecha */}
      <div className="glass-panel rounded-3xl border border-gray-800 overflow-hidden shadow-2xl space-y-3 p-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-emerald-400" /> Historial de Transacciones del Día ({report?.ventas.length || 0})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-900/90 text-gray-400 uppercase text-[11px] font-bold border-b border-gray-800 tracking-wider">
              <tr>
                <th className="px-6 py-4">N° Factura</th>
                <th className="px-6 py-4">Hora</th>
                <th className="px-6 py-4">Cliente / Razón Social</th>
                <th className="px-6 py-4">NIT / CI</th>
                <th className="px-6 py-4 text-center">Método Pago</th>
                <th className="px-6 py-4 text-right">Total</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-medium">
              {!report || report.ventas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No se registran ventas para la fecha seleccionada ({selectedDate}).
                  </td>
                </tr>
              ) : (
                report.ventas.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-emerald-400">{sale.numero_factura}</td>
                    <td className="px-6 py-4 text-gray-400">{new Date(sale.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-6 py-4 font-bold text-white uppercase">{sale.razon_social}</td>
                    <td className="px-6 py-4 font-mono text-gray-400">{sale.nit_ci}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-gray-800 text-emerald-300 border border-gray-700">
                        {sale.metodo_pago}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-extrabold text-white">Bs. {sale.total.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedSale(sale);
                          setTicketOpen(true);
                        }}
                        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold inline-flex items-center gap-1 border border-emerald-500/30 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Reimprimir Ticket
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TicketModal
        isOpen={ticketOpen}
        sale={selectedSale}
        onClose={() => setTicketOpen(false)}
      />
    </div>
  );
}
