'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CategoriasRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // La gestión de categorías está integrada directamente en /admin/productos
    router.replace('/admin/productos');
  }, [router]);

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs text-muted-foreground font-semibold">Redirigiendo a Inventario...</span>
      </div>
    </div>
  );
}
