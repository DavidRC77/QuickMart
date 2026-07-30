'use client';

import { useState, useEffect } from 'react';
import { CategoryModel } from '../../../lib/models/categoryModel';
import { Category } from '../../../lib/models/types';
import { Tags, Plus, Edit, Trash2, Check, X } from 'lucide-react';

export default function AdminCategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadCategories = async () => {
    const cats = await CategoryModel.getAll();
    setCategories(cats);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setNombre('');
    setDescripcion('');
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setNombre(cat.nombre);
    setDescripcion(cat.descripcion || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await CategoryModel.update(editingCategory.id, { nombre, descripcion });
        showToast('Categoría actualizada correctamente.');
      } else {
        await CategoryModel.create({ nombre, descripcion });
        showToast('Categoría creada con éxito.');
      }
      setModalOpen(false);
      loadCategories();
    } catch (err: any) {
      showToast('Error: ' + err.message);
    }
  };

  const handleDelete = async (id: string, catNombre: string) => {
    if (confirm(`¿Deseas eliminar la categoría "${catNombre}"?`)) {
      try {
        await CategoryModel.delete(id);
        showToast('Categoría eliminada.');
        loadCategories();
      } catch (err: any) {
        showToast('Error al eliminar: ' + err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-sm font-bold flex items-center gap-3 animate-in slide-in-from-bottom">
          <Check className="w-5 h-5 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Tags className="w-6 h-6 text-emerald-400" /> Gestión de Categorías
          </h1>
          <p className="text-xs text-gray-400 mt-1">Crea y edita las categorías de productos para el micromercado</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-2xl text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-5 h-5" /> Nueva Categoría
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="glass-panel p-5 rounded-3xl border border-gray-800 space-y-3 flex flex-col justify-between hover:border-emerald-500/30 transition-all">
            <div>
              <div className="flex justify-between items-start">
                <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                  <Tags className="w-5 h-5" />
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id, cat.nombre)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mt-3">{cat.nombre}</h3>
              <p className="text-xs text-gray-400 mt-1">{cat.descripcion || 'Sin descripción dada.'}</p>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 relative border border-emerald-500/30 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h3 className="text-xl font-bold text-white">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Nombre de la Categoría</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Bebidas, Lácteos, Abarrotes..."
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 focus:border-emerald-500 text-white rounded-xl px-3 py-2 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Descripción</label>
                <textarea
                  placeholder="Breve detalle de los productos incluidos..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 focus:border-emerald-500 text-white rounded-xl px-3 py-2 text-sm outline-none min-h-[80px]"
                />
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
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
