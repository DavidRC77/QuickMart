'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Users, UserCheck, FileText, BarChart3, ChevronRight, Menu, X } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Cerrar el drawer móvil al cambiar de ruta
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const links = [
    { href: '/admin', label: 'Panel Principal', icon: LayoutDashboard },
    { href: '/admin/productos', label: 'Inventario', icon: Package },
    { href: '/admin/facturacion', label: 'Facturación', icon: FileText },
    { href: '/admin/clientes', label: 'Clientes', icon: UserCheck },
    { href: '/admin/usuarios', label: 'Usuarios y Personal', icon: Users },
    { href: '/admin/reportes', label: 'Reportes y Cierre', icon: BarChart3 },
  ];

  return (
    <>
      {/* BOTÓN HAMBURGUESA EN MÓVIL (Visibilidad exclusiva para pantallas pequeñas < md) */}
      <div className="md:hidden flex items-center justify-between bg-gray-900/90 border-b border-gray-800 px-4 py-3 sticky top-[65px] z-30 w-full">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl text-xs transition-colors hover:bg-emerald-500/20"
        >
          <Menu className="w-5 h-5 text-emerald-400" />
          <span>Menú de Gestión</span>
        </button>
        <span className="text-xs text-gray-400 font-bold capitalize">
          {links.find((l) => l.href === pathname)?.label || 'Administración'}
        </span>
      </div>

      {/* DRAWER FLOTANTE MÓVIL (Slide-in con Backdrop Blur) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          {/* Backdrop Blur traslúcido */}
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          ></div>

          {/* Panel Lateral Móvil */}
          <div className="relative w-4/5 max-w-xs bg-[#0f172a] border-r border-gray-800 h-full p-5 space-y-4 shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
            <div>
              {/* Encabezado del Drawer */}
              <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-3">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    Quick<span className="text-emerald-400">Mart</span>
                  </h3>
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Módulos de Gestión</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Links de Navegación Móvil */}
              <nav className="space-y-1.5">
                {links.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/60 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-gray-400'}`} />
                        <span>{link.label}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'opacity-40'}`} />
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Pie de Drawer */}
            <div className="pt-4 border-t border-gray-800 text-[10px] text-gray-500 text-center font-medium">
              QuickMart POS & Inventario Mobile
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR FIJO DESKTOP (Pantallas medianas y grandes >= md) */}
      <aside className="w-64 glass-panel border-r border-gray-800 hidden md:flex flex-col min-h-[calc(100vh-65px)] p-4 space-y-2 shrink-0">
        <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-gray-500 uppercase">
          Módulos de Gestión
        </div>
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-gray-400 group-hover:text-gray-200'}`} />
                  <span>{link.label}</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'text-emerald-400 opacity-100' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`} />
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
