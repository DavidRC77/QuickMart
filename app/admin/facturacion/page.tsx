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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" /> Registro de Facturación y Ventas
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Historial completo de comprobantes emitidos con filtros y límites de registros</p>
        </div>
      </div>

      {/* Barra de Filtros, Búsqueda y Selector de Límite (10, 50, 100) */}
      <div className="bg-card text-card-foreground p-4 rounded-3xl flex flex-col lg:flex-row gap-3 items-center shadow-sm">
        {/* Buscador por Factura o NIT */}
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 text-muted-foreground absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por N° Factura, NIT/CI o Razón Social..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-background  border-input focus:border-primary focus:ring-1 focus:ring-primary text-foreground rounded-2xl pl-11 pr-4 py-2.5 text-sm outline-none transition-colors"
          />
        </div>

        {/* Filtro por Fecha */}
        <div className="relative w-full lg:w-48 shrink-0">
          <Calendar className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary text-foreground rounded-2xl pl-10 pr-3 py-2.5 text-sm outline-none font-bold"
          />
        </div>

        {/* Límite de Registros por Página (10, 50, 100) */}
        <div className="flex items-center gap-2 shrink-0 w-full lg:w-auto justify-end">
          <span className="text-xs font-semibold text-muted-foreground">Mostrar:</span>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary text-foreground rounded-xl px-3 py-2 text-sm outline-none font-bold"
          >
            <option value={10}>10 registros</option>
            <option value={50}>50 registros</option>
            <option value={100}>100 registros</option>
            <option value={100000}>Todos</option>
          </select>
        </div>
      </div>

      {/* Tabla de Facturas */}
      <div className="bg-card text-card-foreground rounded-3xl overflow-hidden shadow-sm space-y-3">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-muted-foreground uppercase text-[11px] font-bold border-b border-border tracking-wider">
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
            <tbody className="font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    Cargando facturas...
                  </td>
                </tr>
              ) : paginatedSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    No se encontraron registros de facturación con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                paginatedSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-extrabold text-primary">{sale.numero_factura}</td>
                    <td className="px-6 py-4 text-foreground/80">
                      {new Date(sale.fecha).toLocaleDateString()} {new Date(sale.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground uppercase">{sale.razon_social}</td>
                    <td className="px-6 py-4 font-mono text-muted-foreground">{sale.nit_ci}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-muted text-primary border border-border">
                        {sale.metodo_pago}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-extrabold text-foreground">Bs. {sale.total.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedSale(sale);
                          setTicketModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-bold inline-flex items-center gap-1 border border-primary/30 transition-colors"
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
        <div className="p-4 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-xs text-muted-foreground font-medium">
            Mostrando {paginatedSales.length} de {filteredSales.length} comprobantes (Página {currentPage} de {totalPages})
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-2 bg-muted hover:bg-muted/80 disabled:opacity-40 rounded-xl text-foreground transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-foreground px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 bg-muted hover:bg-muted/80 disabled:opacity-40 rounded-xl text-foreground transition-colors"
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
