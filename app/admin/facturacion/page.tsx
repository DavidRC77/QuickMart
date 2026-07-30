'use client';

import { useState, useEffect, useMemo } from 'react';
import { SaleModel } from '../../../lib/models/saleModel';
import { Sale } from '../../../lib/models/types';
import { TicketModal } from '../../../components/pos/TicketModal';
import { FileText, Search, Calendar, Eye, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

export default function AdminFacturacionPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);

  const loadSales = async () => {
    setLoading(true);
    try {
      const data = await SaleModel.getAll();
      setSales(data);
    } catch (err) {
      console.error('Error cargando ventas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  // Filtrar por búsqueda (n° factura, NIT, cliente) y fecha
  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const matchesSearch =
        s.numero_factura.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nit_ci.includes(searchQuery.trim()) ||
        s.razon_social.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDate = !filterDate || new Date(s.fecha).toISOString().split('T')[0] === filterDate;

      return matchesSearch && matchesDate;
    });
  }, [sales, searchQuery, filterDate]);

  // Paginación
  const totalPages = Math.ceil(filteredSales.length / pageSize) || 1;
  const paginatedSales = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSales.slice(start, start + pageSize);
  }, [filteredSales, currentPage, pageSize]);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-400" /> Registro de Facturación y Ventas
          </h1>
          <p className="text-xs text-gray-400 mt-1">Historial completo de comprobantes emitidos con filtros y límites de registros</p>
        </div>
      </div>

      {/* Barra de Filtros, Búsqueda y Selector de Límite (10, 50, 100) */}
      <div className="glass-panel p-4 rounded-3xl border border-gray-800 flex flex-col lg:flex-row gap-3 items-center">
        {/* Buscador por Factura o NIT */}
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por N° Factura, NIT/CI o Razón Social..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-gray-950/80 border border-gray-800 focus:border-emerald-500 text-white rounded-2xl pl-11 pr-4 py-2.5 text-sm outline-none transition-colors"
          />
        </div>

        {/* Filtro por Fecha */}
        <div className="relative w-full lg:w-48 shrink-0">
          <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-gray-950/80 border border-gray-800 focus:border-emerald-500 text-white rounded-2xl pl-10 pr-3 py-2.5 text-sm outline-none font-bold"
          />
        </div>

        {/* Límite de Registros por Página (10, 50, 100) */}
        <div className="flex items-center gap-2 shrink-0 w-full lg:w-auto justify-end">
          <span className="text-xs font-semibold text-gray-400">Mostrar:</span>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="bg-gray-950/80 border border-gray-800 focus:border-emerald-500 text-white rounded-xl px-3 py-2 text-sm outline-none font-bold"
          >
            <option value={10}>10 registros</option>
            <option value={50}>50 registros</option>
            <option value={100}>100 registros</option>
            <option value={100000}>Todos</option>
          </select>
        </div>
      </div>

      {/* Tabla de Facturas */}
      <div className="glass-panel rounded-3xl border border-gray-800 overflow-hidden shadow-2xl space-y-3">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-900/90 text-gray-400 uppercase text-[11px] font-bold border-b border-gray-800 tracking-wider">
              <tr>
                <th className="px-6 py-4">N° Factura</th>
                <th className="px-6 py-4">Fecha y Hora</th>
                <th className="px-6 py-4">Cliente / Razón Social</th>
                <th className="px-6 py-4">NIT / CI</th>
                <th className="px-6 py-4 text-center">Método Pago</th>
                <th className="px-6 py-4 text-right">Total (Bs.)</th>
                <th className="px-6 py-4 text-center">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Cargando facturas...
                  </td>
                </tr>
              ) : paginatedSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No se encontraron registros de facturación con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                paginatedSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-extrabold text-emerald-400">{sale.numero_factura}</td>
                    <td className="px-6 py-4 text-gray-300">
                      {new Date(sale.fecha).toLocaleDateString()} {new Date(sale.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
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
                          setTicketModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold inline-flex items-center gap-1 border border-emerald-500/30 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Ver Comprobante
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="p-4 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-xs text-gray-400 font-medium">
            Mostrando {paginatedSales.length} de {filteredSales.length} comprobantes (Página {currentPage} de {totalPages})
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 rounded-xl text-gray-300 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-white px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 rounded-xl text-gray-300 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <TicketModal
        isOpen={ticketModalOpen}
        sale={selectedSale}
        onClose={() => setTicketModalOpen(false)}
      />
    </div>
  );
}
