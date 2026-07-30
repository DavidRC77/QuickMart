'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User } from '../lib/models/types';
import { ShoppingBag, LayoutDashboard, LogOut } from 'lucide-react';

interface Props {
  user: User | null;
  onLogout: () => void;
}

export function Navbar({ user, onLogout }: Props) {
  const pathname = usePathname();

  if (pathname === '/login') return null;

  return (
    <header className="glass-panel sticky top-0 z-40 border-b border-gray-800 px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <Link href={user?.rol === 'administrador' ? '/admin' : '/pos'} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-gray-950 rounded-[10px] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1">
              Quick<span className="text-emerald-400">Mart</span>
            </span>
            <span className="text-[10px] text-gray-400 block -mt-1 font-medium">Micromercado</span>
          </div>
        </Link>

        {/* Links principales (Sólo Administración si es Admin) */}
        <nav className="hidden md:flex items-center gap-2">
          {user?.rol === 'administrador' && (
            <Link
              href="/admin"
              className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                pathname.startsWith('/admin')
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Panel de Administración
            </Link>
          )}
        </nav>

        {/* Perfil & Logout */}
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3 bg-gray-900/80 px-3.5 py-1.5 rounded-2xl border border-gray-800">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 font-bold text-xs">
                {user.nombre.charAt(0)}
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-white block leading-tight">
                  Bienvenido(a), <span className="text-emerald-400">{user.nombre}</span>
                </span>
                <span
                  className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded-md inline-block mt-0.5 ${
                    user.rol === 'administrador'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {user.rol}
                </span>
              </div>
            </div>
          )}

          {/* Botón Cerrar Sesión Destacado en Rojo */}
          <button
            onClick={onLogout}
            title="Cerrar Sesión"
            className="p-2.5 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all border border-red-500/30 shadow-lg shadow-red-500/10 flex items-center gap-2 font-bold text-xs"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
}
