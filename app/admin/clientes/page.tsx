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
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-primary/20 border border-primary/50 text-primary text-sm font-bold flex items-center gap-3 animate-in slide-in-from-bottom shadow-md">
          <Check className="w-5 h-5 text-primary" />
          <span>{toast}</span>
        </div>
      )}

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-primary" /> Directorio de Clientes & Historial
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Directorio de tarjetas interactivas con expansión de facturas e historial de compras</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl text-sm shadow-md shadow-primary/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-5 h-5" /> Registrar Cliente
        </button>
      </div>

      {/* Buscador */}
      <div className="bg-card text-card-foreground p-4 rounded-3xl border border-border shadow-sm">
        <div className="relative">
          <Search className="w-5 h-5 text-muted-foreground absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar cliente por Razón Social o NIT/CI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary text-foreground rounded-2xl pl-11 pr-4 py-2.5 text-sm outline-none transition-colors"
          />
        </div>
      </div>

      {/* LISTA DE CLIENTES EN TARJETAS EXPANDIBLES */}
      <div className="space-y-3">
        {filteredCustomers.length === 0 ? (
          <div className="bg-card text-card-foreground p-8 rounded-3xl border border-border text-center text-muted-foreground shadow-sm">
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
                className={`bg-card text-card-foreground rounded-3xl border transition-all overflow-hidden shadow-sm ${
                  isExpanded ? 'border-primary/50 bg-muted/40' : 'border-border hover:border-primary/50'
                }`}
              >
                {/* Cabecera de la Tarjeta (Click para expandir) */}
                <div
                  onClick={() => toggleExpand(c.id)}
                  className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg border border-primary/20 shrink-0">
                      {c.razon_social.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-foreground uppercase tracking-tight flex items-center gap-2">
                        {c.razon_social}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="font-mono text-primary font-bold">NIT/CI: {c.nit_ci}</span>
                        {c.telefono && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-muted-foreground" /> {c.telefono}
                          </span>
                        )}
                        {c.email && (
                          <span className="hidden md:flex items-center gap-1">
                            <Mail className="w-3 h-3 text-muted-foreground" /> {c.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-border">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase block">Total Compras</span>
                      <span className="text-sm font-extrabold text-foreground">Bs. {totalGasto.toFixed(2)} ({customerSales.length} facturas)</span>
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
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                          title="Eliminar cliente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <div className="p-2 text-muted-foreground bg-muted rounded-xl">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* HISTORIAL DE FACTURAS EXPANDIBLE */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-3 border-t border-border bg-muted/30 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                        <ShoppingBag className="w-4 h-4" /> Historial de Facturas Emitidas ({customerSales.length})
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium">Toca cualquier factura para ver o imprimir el ticket</span>
                    </div>

                    {customerSales.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-3 italic">Este cliente aún no registra compras facturadas.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {customerSales.map((sale) => (
                          <div
                            key={sale.id}
                            onClick={() => {
                              setSelectedSale(sale);
                              setTicketModalOpen(true);
                            }}
                            className="bg-muted/50 border border-border hover:border-primary/50 p-3.5 rounded-2xl cursor-pointer transition-all space-y-2 group"
                          >
                            <div className="flex justify-between items-start">
                              <span className="font-mono text-xs font-extrabold text-primary">{sale.numero_factura}</span>
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                                {sale.metodo_pago}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-muted-foreground" />
                                {new Date(sale.fecha).toLocaleDateString()}
                              </span>
                              <span className="text-sm font-extrabold text-foreground">Bs. {sale.total.toFixed(2)}</span>
                            </div>
                            <div className="pt-1 border-t border-border/60 flex justify-end">
                              <span className="text-[10px] font-bold text-primary group-hover:underline flex items-center gap-1">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground w-full max-w-md rounded-3xl p-6 relative border border-border shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="text-xl font-bold text-foreground">
                {editingCustomer ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground/80 block mb-1">NIT / C.I.</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 1234567019"
                  value={formData.nit_ci}
                  onChange={(e) => setFormData({ ...formData, nit_ci: e.target.value })}
                  className="w-full bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary text-foreground rounded-xl px-3 py-2 text-sm outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground/80 block mb-1">Razón Social / Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Empresa Ejemplo S.R.L."
                  value={formData.razon_social}
                  onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })}
                  className="w-full bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary text-foreground rounded-xl px-3 py-2 text-sm outline-none uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground/80 block mb-1">Teléfono</label>
                  <input
                    type="text"
                    placeholder="70000000"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary text-foreground rounded-xl px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground/80 block mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="cliente@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary text-foreground rounded-xl px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-1/2 py-2.5 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-xl text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-sm shadow-md shadow-primary/20 transition-colors"
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
