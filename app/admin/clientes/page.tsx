'use client';

import { useState, useEffect, useMemo } from 'react';
import { CustomerModel } from '../../../lib/models/customerModel';
import { SaleModel } from '../../../lib/models/saleModel';
import { Customer, Sale } from '../../../lib/models/types';
import { TicketModal } from '../../../components/pos/TicketModal';
import { UserCheck, Plus, Search, Edit, Trash2, Check, X, Phone, Mail, ChevronDown, ChevronUp, ShoppingBag, Calendar, Eye } from 'lucide-react';

export default function AdminClientesPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    nit_ci: '',
    razon_social: '',
    telefono: '',
    email: '',
  });

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    try {
      const [custs, sls] = await Promise.all([CustomerModel.getAll(), SaleModel.getAll()]);
      setCustomers(custs);
      setSales(sls);
    } catch (err) {
      console.error('Error cargando clientes/ventas:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setFormData({
      nit_ci: '',
      razon_social: '',
      telefono: '',
      email: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (c: Customer, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCustomer(c);
    setFormData({
      nit_ci: c.nit_ci,
      razon_social: c.razon_social,
      telefono: c.telefono || '',
      email: c.email || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await CustomerModel.update(editingCustomer.id, {
          nit_ci: formData.nit_ci.trim(),
          razon_social: formData.razon_social.trim(),
          telefono: formData.telefono.trim(),
          email: formData.email.trim(),
        });
        showToast('Cliente actualizado correctamente.');
      } else {
        await CustomerModel.create({
          nit_ci: formData.nit_ci.trim(),
          razon_social: formData.razon_social.trim(),
          telefono: formData.telefono.trim(),
          email: formData.email.trim(),
        });
        showToast('Cliente registrado exitosamente.');
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast('Error: ' + err.message);
    }
  };

  const handleDelete = async (id: string, razon: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`¿Deseas eliminar al cliente "${razon}"?`)) {
      try {
        await CustomerModel.delete(id);
        showToast('Cliente eliminado.');
        loadData();
      } catch (err: any) {
        showToast('Error al eliminar: ' + err.message);
      }
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (c) =>
        c.razon_social.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.nit_ci.includes(searchQuery.trim())
    );
  }, [customers, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedCustomerId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-sm font-bold flex items-center gap-3 animate-in slide-in-from-bottom">
          <Check className="w-5 h-5 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-400" /> Directorio de Clientes & Historial
          </h1>
          <p className="text-xs text-gray-400 mt-1">Directorio de tarjetas interactivas con expansión de facturas e historial de compras</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-2xl text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-5 h-5" /> Registrar Cliente
        </button>
      </div>

      {/* Buscador */}
      <div className="glass-panel p-4 rounded-3xl border border-gray-800">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar cliente por Razón Social o NIT/CI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-950/80 border border-gray-800 focus:border-emerald-500 text-white rounded-2xl pl-11 pr-4 py-2.5 text-sm outline-none transition-colors"
          />
        </div>
      </div>

      {/* LISTA DE CLIENTES EN TARJETAS EXPANDIBLES */}
      <div className="space-y-3">
        {filteredCustomers.length === 0 ? (
          <div className="glass-panel p-8 rounded-3xl border border-gray-800 text-center text-gray-500">
            No se encontraron clientes registrados.
          </div>
        ) : (
          filteredCustomers.map((c) => {
            const isExpanded = expandedCustomerId === c.id;
            // Ventas correspondientes a este cliente (por NIT/CI)
            const customerSales = sales.filter((s) => s.nit_ci === c.nit_ci);
            const totalGasto = customerSales.reduce((acc, s) => acc + s.total, 0);

            return (
              <div
                key={c.id}
                className={`glass-panel rounded-3xl border transition-all overflow-hidden ${
                  isExpanded ? 'border-emerald-500/40 bg-gray-900/60' : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                {/* Cabecera de la Tarjeta (Click para expandir) */}
                <div
                  onClick={() => toggleExpand(c.id)}
                  className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black text-lg border border-emerald-500/20 shrink-0">
                      {c.razon_social.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white uppercase tracking-tight flex items-center gap-2">
                        {c.razon_social}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                        <span className="font-mono text-emerald-400 font-bold">NIT/CI: {c.nit_ci}</span>
                        {c.telefono && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-500" /> {c.telefono}
                          </span>
                        )}
                        {c.email && (
                          <span className="hidden md:flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-500" /> {c.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-800">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-bold text-gray-500 uppercase block">Total Compras</span>
                      <span className="text-sm font-extrabold text-white">Bs. {totalGasto.toFixed(2)} ({customerSales.length} facturas)</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleOpenEdit(c, e)}
                        className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-colors"
                        title="Editar cliente"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {c.nit_ci !== '0' && (
                        <button
                          onClick={(e) => handleDelete(c.id, c.razon_social, e)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                          title="Eliminar cliente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <div className="p-2 text-gray-400 bg-gray-800/80 rounded-xl">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* HISTORIAL DE FACTURAS EXPANDIBLE */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-3 border-t border-gray-800/80 bg-gray-950/60 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <ShoppingBag className="w-4 h-4" /> Historial de Facturas Emitidas ({customerSales.length})
                      </span>
                      <span className="text-[11px] text-gray-500 font-medium">Toca cualquier factura para ver o imprimir el ticket</span>
                    </div>

                    {customerSales.length === 0 ? (
                      <p className="text-xs text-gray-500 py-3 italic">Este cliente aún no registra compras facturadas.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {customerSales.map((sale) => (
                          <div
                            key={sale.id}
                            onClick={() => {
                              setSelectedSale(sale);
                              setTicketModalOpen(true);
                            }}
                            className="bg-gray-900 border border-gray-800 hover:border-emerald-500/40 p-3.5 rounded-2xl cursor-pointer transition-all space-y-2 group"
                          >
                            <div className="flex justify-between items-start">
                              <span className="font-mono text-xs font-extrabold text-emerald-400">{sale.numero_factura}</span>
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-gray-800 text-gray-300">
                                {sale.metodo_pago}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-gray-500" />
                                {new Date(sale.fecha).toLocaleDateString()}
                              </span>
                              <span className="text-sm font-extrabold text-white">Bs. {sale.total.toFixed(2)}</span>
                            </div>
                            <div className="pt-1 border-t border-gray-800/60 flex justify-end">
                              <span className="text-[10px] font-bold text-emerald-400 group-hover:underline flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" /> Ver Comprobante
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Crear/Editar Cliente */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 relative border border-emerald-500/30 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h3 className="text-xl font-bold text-white">
                {editingCustomer ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">NIT / C.I.</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 1234567019"
                  value={formData.nit_ci}
                  onChange={(e) => setFormData({ ...formData, nit_ci: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 focus:border-emerald-500 text-white rounded-xl px-3 py-2 text-sm outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Razón Social / Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Empresa Ejemplo S.R.L."
                  value={formData.razon_social}
                  onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 focus:border-emerald-500 text-white rounded-xl px-3 py-2 text-sm outline-none uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Teléfono</label>
                  <input
                    type="text"
                    placeholder="70000000"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 focus:border-emerald-500 text-white rounded-xl px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="cliente@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 focus:border-emerald-500 text-white rounded-xl px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-1/2 py-2.5 bg-gray-800 text-gray-300 font-semibold rounded-xl text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/20"
                >
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ticket de Factura */}
      <TicketModal
        isOpen={ticketModalOpen}
        sale={selectedSale}
        onClose={() => setTicketModalOpen(false)}
      />
    </div>
  );
}
