'use client';

import { useState, useEffect, useCallback } from 'react';
import { SaleModel } from '../../../lib/models/saleModel';
import { DailyReport, Sale } from '../../../lib/models/types';
import { TicketModal } from '../../../components/pos/TicketModal';
import { BarChart3, Banknote, QrCode, CreditCard, Calendar, Printer, Eye, ShoppingBag } from 'lucide-react';

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
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado y Filtro por Fecha (Solo pantalla) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" /> Reporte Diario y Cierre de Caja
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Resumen de ingresos, transacciones y desglose por método de pago</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary text-foreground rounded-2xl pl-10 pr-4 py-2 text-sm outline-none font-bold"
            />
          </div>

          <button
            onClick={handlePrintReport}
            className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-2xl text-sm border border-transparent flex items-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" /> Imprimir Reporte
          </button>
        </div>
      </div>

      {/* REPORTE IMPRIMIBLE (#printable-report) */}
      <div id="printable-report" className="space-y-6">
        {/* Encabezado Formal Exclusivo de Impresión */}
        <div className="hidden print:block border-b-2 border-black pb-3 mb-4 text-slate-900">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">QUICKMART - MICROMERCADO</h1>
              <p className="text-xs font-semibold">Reporte Oficial de Cierre Diario de Caja</p>
            </div>
            <div className="text-right text-xs">
              <p className="font-bold">Fecha del Reporte: {selectedDate}</p>
              <p className="text-gray-600">Emitido: {new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Grid de Resumen del Día */}
        {report && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4 gap-4">
            {/* Total Ingresos */}
            <div className="bg-card text-card-foreground shadow-sm p-5 rounded-3xl border border-primary/30 space-y-1">
              <span className="text-xs font-semibold text-muted-foreground print:text-slate-700 uppercase">Total Ingresos</span>
              <div className="text-3xl font-extrabold text-primary print:text-black">Bs. {report.totalIngresos.toFixed(2)}</div>
              <span className="text-[11px] text-muted-foreground print:text-slate-600 block">{report.totalVentas} transacciones en la fecha</span>
            </div>

            {/* Desglose Efectivo */}
            <div className="bg-card text-card-foreground shadow-sm p-5 rounded-3xl border border-primary/20 space-y-1">
              <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase print:text-black">
                <Banknote className="w-4 h-4" /> Ingresos en Efectivo
              </div>
              <div className="text-2xl font-extrabold text-foreground print:text-black">Bs. {report.efectivoTotal.toFixed(2)}</div>
              <span className="text-[11px] text-muted-foreground print:text-slate-600">Arqueo físico de caja</span>
            </div>

            {/* Desglose QR */}
            <div className="bg-card text-card-foreground shadow-sm p-5 rounded-3xl border border-indigo-500/20 space-y-1">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase print:text-black">
                <QrCode className="w-4 h-4" /> Ingresos por QR
              </div>
              <div className="text-2xl font-extrabold text-foreground print:text-black">Bs. {report.qrTotal.toFixed(2)}</div>
              <span className="text-[11px] text-muted-foreground print:text-slate-600">Transferencias recibidas</span>
            </div>

            {/* Desglose Tarjeta */}
            <div className="bg-card text-card-foreground shadow-sm p-5 rounded-3xl border border-blue-500/20 space-y-1">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase print:text-black">
                <CreditCard className="w-4 h-4" /> Ingresos por Tarjeta
              </div>
              <div className="text-2xl font-extrabold text-foreground print:text-black">Bs. {report.tarjetaTotal.toFixed(2)}</div>
              <span className="text-[11px] text-muted-foreground print:text-slate-600">Pagos pos débito/crédito</span>
            </div>
          </div>
        )}

        {/* Tabla de Ventas Registradas en la Fecha */}
        <div className="bg-card text-card-foreground shadow-sm rounded-3xl border border-transparent overflow-hidden space-y-3 p-6">
          <h2 className="text-lg font-bold text-foreground print:text-black flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary print:text-black" /> Historial de Transacciones del Día ({report?.ventas.length || 0})
          </h2>

          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-left text-sm print:text-xs">
              <thead className="bg-background text-muted-foreground uppercase text-[11px] font-bold border-b border-transparent tracking-wider print:bg-gray-100 print:text-black">
                <tr>
                  <th className="px-6 py-4">N° Factura</th>
                  <th className="px-6 py-4">Hora</th>
                  <th className="px-6 py-4">Cliente / Razón Social</th>
                  <th className="px-6 py-4">NIT / CI</th>
                  <th className="px-6 py-4 text-center">Método Pago</th>
                  <th className="px-6 py-4 text-right">Total</th>
                  <th className="px-6 py-4 text-center print:hidden">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-background font-medium print:divide-gray-300">
                {!report || report.ventas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                      No se registran ventas para la fecha seleccionada ({selectedDate}).
                    </td>
                  </tr>
                ) : (
                  report.ventas.map((sale) => (
                    <tr key={sale.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-primary print:text-black">{sale.numero_factura}</td>
                      <td className="px-6 py-4 text-muted-foreground print:text-black">{new Date(sale.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-6 py-4 font-bold text-foreground print:text-black uppercase">{sale.razon_social}</td>
                      <td className="px-6 py-4 font-mono text-muted-foreground print:text-black">{sale.nit_ci}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-muted text-primary border border-transparent print:bg-transparent print:text-black">
                          {sale.metodo_pago}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-extrabold text-foreground print:text-black">Bs. {sale.total.toFixed(2)}</td>
                      <td className="px-6 py-4 text-center print:hidden">
                        <button
                          onClick={() => {
                            setSelectedSale(sale);
                            setTicketOpen(true);
                          }}
                          className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-bold inline-flex items-center gap-1 border border-primary/30 transition-colors"
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
      </div>

      <TicketModal
        isOpen={ticketOpen}
        sale={selectedSale}
        onClose={() => setTicketOpen(false)}
      />
    </div>
  );
}
