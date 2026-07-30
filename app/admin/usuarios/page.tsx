'use client';

import { useState, useEffect } from 'react';
import { UserModel } from '../../../lib/models/userModel';
import { User, UserRole } from '../../../lib/models/types';
import { Users, Plus, ShieldCheck, UserCheck, Trash2, Edit, Check, X, Phone, Mail } from 'lucide-react';

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    ci: '',
    telefono: '',
    email: '',
    password: '',
    rol: 'cajero' as UserRole,
  });

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadUsers = async () => {
    const data = await UserModel.getAll();
    setUsers(data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      nombre: '',
      apellido: '',
      ci: '',
      telefono: '',
      email: '',
      password: '',
      rol: 'cajero',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setFormData({
      nombre: u.nombre,
      apellido: u.apellido,
      ci: u.ci,
      telefono: u.telefono || '',
      email: u.email,
      password: u.password || '',
      rol: u.rol,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await UserModel.update(editingUser.id, {
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          ci: formData.ci.trim(),
          telefono: formData.telefono.trim(),
          email: formData.email.trim(),
          rol: formData.rol,
          password: formData.password || undefined,
        });
        showToast('Empleado actualizado exitosamente.');
      } else {
        await UserModel.create({
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          ci: formData.ci.trim(),
          telefono: formData.telefono.trim(),
          email: formData.email.trim(),
          password: formData.password || '123456',
          rol: formData.rol,
        });
        showToast('Empleado registrado exitosamente.');
      }
      setModalOpen(false);
      loadUsers();
    } catch (err: any) {
      showToast('Error: ' + err.message);
    }
  };

  const handleDelete = async (id: string, nombreUser: string) => {
    if (confirm(`¿Deseas dar de baja al usuario "${nombreUser}"?`)) {
      try {
        await UserModel.delete(id);
        showToast('Usuario eliminado.');
        loadUsers();
      } catch (err: any) {
        showToast('Error: ' + err.message);
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
            <Users className="w-6 h-6 text-emerald-400" /> Gestión de Personal y Empleados
          </h1>
          <p className="text-xs text-gray-400 mt-1">Alta, edición y control de Cajeros y Administradores de QuickMart</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-2xl text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-5 h-5" /> Registrar Personal
        </button>
      </div>

      {/* Grid de Usuarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => (
          <div key={u.id} className="glass-panel p-5 rounded-3xl border border-gray-800 space-y-4 hover:border-emerald-500/30 transition-all">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl border ${
                  u.rol === 'administrador'
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {u.rol === 'administrador' ? <ShieldCheck className="w-6 h-6" /> : <UserCheck className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">{u.nombre} {u.apellido}</h3>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md inline-block mt-1 ${
                    u.rol === 'administrador'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {u.rol}
                  </span>
                </div>
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => handleOpenEdit(u)}
                  className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-colors"
                  title="Editar empleado"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(u.id, `${u.nombre} ${u.apellido}`)}
                  className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                  title="Eliminar empleado"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-800 space-y-1.5 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-gray-500" />
                <span>{u.email}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span>CI: <strong className="text-gray-200">{u.ci}</strong></span>
                {u.telefono && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-gray-500" /> {u.telefono}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Crear / Editar Empleado */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 relative border border-emerald-500/30 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h3 className="text-xl font-bold text-white">
                {editingUser ? 'Editar Empleado' : 'Registrar Nuevo Personal'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 focus:border-emerald-500 text-white rounded-xl px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Apellido</label>
                  <input
                    type="text"
                    required
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 focus:border-emerald-500 text-white rounded-xl px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">C.I. (Carnet de Identidad)</label>
                  <input
                    type="text"
                    required
                    value={formData.ci}
                    onChange={(e) => setFormData({ ...formData, ci: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 focus:border-emerald-500 text-white rounded-xl px-3 py-2 text-sm outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Teléfono / Celular</label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 focus:border-emerald-500 text-white rounded-xl px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Correo Electrónico (Login)</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 focus:border-emerald-500 text-white rounded-xl px-3 py-2 text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    {editingUser ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 focus:border-emerald-500 text-white rounded-xl px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Rol Asignado</label>
                  <select
                    value={formData.rol}
                    onChange={(e) => setFormData({ ...formData, rol: e.target.value as UserRole })}
                    className="w-full bg-gray-950 border border-gray-800 focus:border-emerald-500 text-white rounded-xl px-3 py-2 text-sm outline-none font-bold"
                  >
                    <option value="cajero">Cajero</option>
                    <option value="administrador">Administrador</option>
                  </select>
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
                  {editingUser ? 'Guardar Cambios' : 'Registrar Personal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
