'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Users, UserCheck, FileText, BarChart3, ChevronRight } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/admin', label: 'Panel Principal', icon: LayoutDashboard },
    { href: '/admin/productos', label: 'Inventario', icon: Package },
    { href: '/admin/facturacion', label: 'Facturación', icon: FileText },
    { href: '/admin/clientes', label: 'Clientes', icon: UserCheck },
    { href: '/admin/usuarios', label: 'Personal', icon: Users },
    { href: '/admin/reportes', label: 'Reportes', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-gray-800 hidden md:flex flex-col min-h-[calc(100vh-65px)] p-4 space-y-2">
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
  );
}
