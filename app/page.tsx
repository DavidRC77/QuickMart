'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthController } from '../lib/controllers/authController';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const user = AuthController.getSessionUser();
    if (!user) {
      router.push('/login');
    } else if (user.rol === 'cajero') {
      router.push('/pos');
    } else {
      router.push('/admin');
    }
  }, [router]);

  return (
    <div className="flex-1 flex items-center justify-center bg-[#0b0f17]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm font-semibold text-gray-400">Cargando QuickMart...</span>
      </div>
    </div>
  );
}
