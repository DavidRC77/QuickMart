'use client';

import { useAuth } from '../../hooks/useAuth';
import { Sidebar } from '../../components/sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Proteger acceso exclusivo para rol 'administrador'
  const { user, loading } = useAuth('administrador');

  if (loading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-muted-foreground">Verificando permisos de Administrador...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
      <Sidebar />
      <main className="flex-1 p-4 lg:p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
