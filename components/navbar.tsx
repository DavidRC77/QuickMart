'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User } from '../lib/models/types';
import { ShoppingBag, LayoutDashboard, LogOut, Sun, Moon } from 'lucide-react';

interface Props {
  user: User | null;
  onLogout: () => void;
}

import { useTheme } from 'next-themes';

export function Navbar({ user, onLogout }: Props) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  if (pathname === '/login') return null;

  return (
    <header className="bg-card text-card-foreground sticky top-0 z-40 px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <Link href={user?.rol === 'administrador' ? '/admin' : '/pos'} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-primary p-0.5 shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-background rounded-[10px] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-1">
              Quick<span className="text-primary">Mart</span>
            </span>
            <span className="text-[10px] text-muted-foreground block -mt-1 font-medium">Micromercado</span>
          </div>
        </Link>

        {/* Links principales (Sólo Administración si es Admin) */}
        <nav className="hidden md:flex items-center gap-2">
          {user?.rol === 'administrador' && (
            <Link
              href="/admin"
              className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm border border-transparent ${
                pathname.startsWith('/admin')
                  ? 'bg-card text-primary'
                  : 'bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Panel de Administración
            </Link>
          )}
        </nav>

        {/* Perfil & Logout */}
        <div className="flex items-center gap-4">
          {/* Botón de Cambio de Tema */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Cambiar Tema"
            className="relative p-2.5 text-muted-foreground hover:text-foreground bg-card rounded-xl transition-all border border-transparent shadow-sm flex items-center justify-center overflow-hidden"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </button>

          {user && (
            <div className="flex items-center gap-3 bg-card px-3.5 py-1.5 rounded-2xl shadow-sm border border-transparent">
              <div className="w-8 h-8 rounded-xl bg-background text-primary flex items-center justify-center border border-transparent shadow-sm font-bold text-xs">
                {user.nombre.charAt(0)}
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-foreground block leading-tight">
                  Bienvenido(a), <span className="text-primary">{user.nombre}</span>
                </span>
                <span
                  className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded-md inline-block mt-0.5 ${
                    user.rol === 'administrador'
                      ? 'bg-background text-indigo-400 border border-transparent shadow-sm'
                      : 'bg-background text-primary border border-transparent shadow-sm'
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
            className="p-2.5 text-destructive bg-card hover:bg-destructive hover:text-destructive-foreground rounded-xl transition-all border border-transparent shadow-sm flex items-center gap-2 font-bold text-xs group"
          >
            <LogOut className="w-4 h-4 text-destructive group-hover:text-destructive-foreground" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
}
