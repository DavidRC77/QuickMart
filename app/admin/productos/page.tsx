'use client';

import { useState, useMemo } from 'react';
import { useProductsController } from '../../../hooks/useProductsController';
import { Product, Category } from '../../../lib/models/types';
import { CategoryModel } from '../../../lib/models/categoryModel';
import { BarcodeScannerModal } from '../../../components/pos/BarcodeScannerModal';
import { Package, Plus, Search, Tags, Edit, Trash2, AlertTriangle, Check, X, Camera } from 'lucide-react';

export default function AdminProductosPage() {
  const {
    products,
    categories,
    loading,
    searchQuery,
    selectedCategory,
    toast,
    setSearchQuery,
    setSelectedCategory,
    saveProduct,
    deleteProduct,
    refreshProducts,
  } = useProductsController();

  // Modales
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catNombre, setCatNombre] = useState('');
  const [catDescripcion, setCatDescripcion] = useState('');

  // Escáner Cámara para Formulario de Producto
  const [cameraScannerOpen, setCameraScannerOpen] = useState(false);

  // Formulario Producto
  const [formData, setFormData] = useState({
    codigo_barras: '',
    nombre: '',
    precio_costo: '',
    precio_venta: '',
    stock_actual: '',
    stock_minimo: '5',
    categoria_id: '',
  });

  // Categorías ordenadas alfabéticamente A -> Z
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
  }, [categories]);

  // Manejo de Modal de Producto
  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setFormData({
      codigo_barras: '',
      nombre: '',
      precio_costo: '',
      precio_venta: '',
      stock_actual: '0',
      stock_minimo: '5',
      categoria_id: sortedCategories.length > 0 ? sortedCategories[0].id : '',
    });
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      codigo_barras: prod.codigo_barras,
      nombre: prod.nombre,
      precio_costo: prod.precio_costo.toString(),
      precio_venta: prod.precio_venta.toString(),
      stock_actual: prod.stock_actual.toString(),
      stock_minimo: prod.stock_minimo.toString(),
      categoria_id: prod.categoria_id,
    });
    setProductModalOpen(true);
  };

  const handleBarcodeScanned = (scannedCode: string) => {
    setFormData((prev) => ({ ...prev, codigo_barras: scannedCode }));
    setCameraScannerOpen(false);
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveProduct(
        {
          codigo_barras: formData.codigo_barras.trim(),
          nombre: formData.nombre.trim(),
          precio_costo: parseFloat(formData.precio_costo) || 0,
          precio_venta: parseFloat(formData.precio_venta) || 0,
          stock_actual: parseInt(formData.stock_actual, 10) || 0,
          stock_minimo: parseInt(formData.stock_minimo, 10) || 0,
          categoria_id: formData.categoria_id,
        },
        Boolean(editingProduct),
        editingProduct?.id
      );
      setProductModalOpen(false);
    } catch (err) {}
  };

  // Manejo de Categorías dentro del Modal
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catNombre.trim()) return;

    try {
      if (editingCategory) {
        await CategoryModel.update(editingCategory.id, {
          nombre: catNombre.trim(),
          descripcion: catDescripcion.trim(),
        });
      } else {
        await CategoryModel.create({
          nombre: catNombre.trim(),
          descripcion: catDescripcion.trim(),
        });
      }
      setCatNombre('');
      setCatDescripcion('');
      setEditingCategory(null);
      refreshProducts();
    } catch (err: any) {
      alert('Error al guardar categoría: ' + err.message);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (confirm(`¿Deseas eliminar la categoría "${name}"?`)) {
      try {
        await CategoryModel.delete(id);
        if (selectedCategory === id) {
          setSelectedCategory('all');
        }
        refreshProducts();
      } catch (err: any) {
        alert('Error al eliminar categoría: ' + err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl border text-sm font-bold flex items-center gap-3 ${
            toast.type === 'success' ? 'bg-primary/20 border-primary/50 text-primary' : 'bg-destructive/20 border-destructive/50 text-destructive'
          }`}
        >
          {toast.type === 'success' ? <Check className="w-5 h-5 text-primary" /> : <AlertTriangle className="w-5 h-5 text-destructive" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Encabezado: Solo título y botón Gestionar Categorías */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" /> Inventario
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Gestión de productos, existencias y familias de categorías</p>
        </div>

        {/* Solo Botón Gestionar Categorías arriba */}
        <button
          type="button"
          onClick={() => setCategoriesModalOpen(true)}
          className="px-4 py-2.5 bg-card hover:bg-card/80 text-foreground font-bold rounded-2xl text-sm border border-transparent shadow-sm flex items-center gap-2 transition-colors"
        >
          <Tags className="w-4 h-4 text-primary" />
          <span>Gestionar Categorías</span>
        </button>
      </div>

      {/* Buscador + Botón "Nuevo Producto" al lado del buscador */}
      <div className="bg-card text-card-foreground p-4 rounded-3xl border border-transparent flex flex-col sm:flex-row gap-3 items-center shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 text-muted-foreground absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar producto por nombre o código de barras..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary text-foreground rounded-2xl pl-11 pr-4 py-2.5 text-sm outline-none transition-colors"
          />
        </div>

        <button
          type="button"
          onClick={handleOpenCreateProduct}
          className="w-full sm:w-auto px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl text-sm shadow-md shadow-primary/20 flex items-center justify-center gap-2 transition-all shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* BARRA DE FILTRADO POR CATEGORÍAS (Horizontal Scrollable Buttons) */}
      <div className="w-full space-y-2">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block px-1">
          Filtrar por Categoría (A - Z)
        </span>
        <div className="w-full overflow-x-auto pb-2 scrollbar-none flex items-center gap-2">
          {/* Botón 1: "Todas" (Siempre a la izquierda y seleccionado por defecto) */}
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedCategory === 'all'
                ? 'bg-primary/15 border-transparent text-primary shadow-sm scale-105'
                : 'bg-card border-transparent text-muted-foreground hover:text-foreground shadow-sm'
            }`}
          >
            Todas las Categorías
          </button>

          {/* Botones Dinámicos Ordenados Alfabéticamente A-Z */}
          {sortedCategories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-primary/15 border-transparent text-primary shadow-sm scale-105'
                    : 'bg-card border-transparent text-muted-foreground hover:text-foreground shadow-sm'
                }`}
              >
                {cat.nombre}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="bg-card text-card-foreground rounded-3xl border border-transparent overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-background text-muted-foreground uppercase text-[11px] font-bold border-b border-transparent tracking-wider">
              <tr>
                <th className="px-6 py-4">Código Barras</th>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4 text-right">P. Costo</th>
                <th className="px-6 py-4 text-right">P. Venta</th>
                <th className="px-6 py-4 text-center">Stock Actual</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-background font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    Cargando inventario...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    No se encontraron productos registrados en esta categoría.
                  </td>
                </tr>
              ) : (
                products.map((prod) => {
                  const isLowStock = prod.stock_actual <= prod.stock_minimo;
                  return (
                    <tr key={prod.id} className="hover:bg-background transition-colors">
                      <td className="px-6 py-4 font-mono text-primary font-bold">{prod.codigo_barras}</td>
                      <td className="px-6 py-4 font-bold text-foreground">{prod.nombre}</td>
                      <td className="px-6 py-4 text-muted-foreground">{prod.categoria_nombre}</td>
                      <td className="px-6 py-4 text-right text-muted-foreground">Bs. {prod.precio_costo.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-bold text-foreground">Bs. {prod.precio_venta.toFixed(2)}</td>
                      <td className="px-6 py-4 text-center">
                        {isLowStock ? (
                          <span className="inline-flex items-center gap-1 bg-destructive/20 text-destructive border border-destructive/40 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {prod.stock_actual} (Mín: {prod.stock_minimo})
                          </span>
                        ) : (
                          <span className="inline-flex items-center bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-bold">
                            {prod.stock_actual} u.
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditProduct(prod)}
                            className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-colors"
                            title="Editar Producto"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar producto "${prod.nombre}"?`)) {
                                deleteProduct(prod.id);
                              }
                            }}
                            className="p-2 text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                            title="Eliminar Producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: GESTIONAR CATEGORÍAS */}
      {categoriesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground w-full max-w-xl rounded-3xl p-6 relative border border-transparent shadow-2xl space-y-5 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-transparent pb-3">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Tags className="w-6 h-6 text-primary" /> Gestión de Categorías
              </h3>
              <button onClick={() => setCategoriesModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Formulario Registrar / Editar Categoría */}
            <form onSubmit={handleSaveCategory} className="bg-background p-4 rounded-2xl border border-transparent shadow-sm space-y-3">
              <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                {editingCategory ? 'Editar Categoría' : 'Registrar Nueva Categoría'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Nombre (ej. Bebidas, Lácteos)..."
                  value={catNombre}
                  onChange={(e) => setCatNombre(e.target.value)}
                  className="bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary text-foreground rounded-xl px-3 py-2 text-sm outline-none"
                />
                <input
                  type="text"
                  placeholder="Descripción breve..."
                  value={catDescripcion}
                  onChange={(e) => setCatDescripcion(e.target.value)}
                  className="bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary text-foreground rounded-xl px-3 py-2 text-sm outline-none"
                />
              </div>
              <div className="flex gap-2 justify-end">
                {editingCategory && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(null);
                      setCatNombre('');
                      setCatDescripcion('');
                    }}
                    className="px-3 py-1.5 bg-muted text-muted-foreground font-semibold rounded-xl text-xs hover:bg-muted/80"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-xs shadow-md shadow-primary/20 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> {editingCategory ? 'Guardar Cambios' : 'Registrar Categoría'}
                </button>
              </div>
            </form>

            {/* Lista de Categorías Existentes */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <span className="text-xs font-bold text-muted-foreground block mb-2">Categorías Registradas ({sortedCategories.length})</span>
              {sortedCategories.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No hay categorías agregadas aún.</p>
              ) : (
                sortedCategories.map((c) => (
                  <div
                    key={c.id}
                    className="bg-background border border-transparent shadow-sm p-3 rounded-2xl flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{c.nombre}</h4>
                      <p className="text-xs text-muted-foreground">{c.descripcion || 'Sin descripción'}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(c);
                          setCatNombre(c.nombre);
                          setCatDescripcion(c.descripcion || '');
                        }}
                        className="p-1.5 text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-colors"
                        title="Editar Categoría"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(c.id, c.nombre)}
                        className="p-1.5 text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                        title="Eliminar Categoría"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CREAR / EDITAR PRODUCTO (con escáner de cámara integrado) */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground w-full max-w-lg rounded-3xl p-6 relative border border-transparent shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-transparent pb-3">
              <h3 className="text-xl font-bold text-foreground">
                {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
              </h3>
              <button onClick={() => setProductModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground/80 block mb-1">Código de Barras</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      required
                      placeholder="Escanea o escribe..."
                      value={formData.codigo_barras}
                      onChange={(e) => setFormData({ ...formData, codigo_barras: e.target.value })}
                      className="w-full bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary text-foreground rounded-xl px-3 py-2 text-sm font-mono outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setCameraScannerOpen(true)}
                      title="Escanear con Cámara"
                      className="p-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-xl transition-colors shrink-0"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground/80 block mb-1">Categoría</label>
                  <select
                    required
                    value={formData.categoria_id}
                    onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                    className="w-full bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary text-foreground rounded-xl px-3 py-2 text-sm outline-none font-bold"
                  >
                    <option value="" disabled>Seleccione una categoría</option>
                    {sortedCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground/80 block mb-1">Nombre del Producto</label>
                <input
                  type="text"
                  required
                  placeholder="Nombre comercial del producto..."
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary text-foreground rounded-xl px-3 py-2 text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground/80 block mb-1">Precio Costo (Bs.)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.precio_costo}
                    onChange={(e) => setFormData({ ...formData, precio_costo: e.target.value })}
                    className="w-full bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary text-foreground rounded-xl px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground/80 block mb-1">Precio Venta (Bs.)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.precio_venta}
                    onChange={(e) => setFormData({ ...formData, precio_venta: e.target.value })}
                    className="w-full bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary text-foreground rounded-xl px-3 py-2 text-sm outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground/80 block mb-1">Stock Actual</label>
                  <input
                    type="number"
                    required
                    value={formData.stock_actual}
                    onChange={(e) => setFormData({ ...formData, stock_actual: e.target.value })}
                    className="w-full bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary text-foreground rounded-xl px-3 py-2 text-sm outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground/80 block mb-1">Stock Mínimo (Alerta)</label>
                  <input
                    type="number"
                    required
                    value={formData.stock_minimo}
                    onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })}
                    className="w-full bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary text-foreground rounded-xl px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="w-1/2 py-2.5 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-xl text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-sm shadow-md shadow-primary/20 transition-colors"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Escáner de Cámara para Formulario de Producto */}
      <BarcodeScannerModal
        isOpen={cameraScannerOpen}
        onClose={() => setCameraScannerOpen(false)}
        onScan={handleBarcodeScanned}
      />
    </div>
  );
}
