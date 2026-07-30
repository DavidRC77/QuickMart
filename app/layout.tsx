'use client';

import './globals.css';
import { useState, useEffect } from 'react';
import { Navbar } from '../components/navbar';
import { AuthController } from '../lib/controllers/authController';
import { User } from '../lib/models/types';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(AuthController.getSessionUser());
    const handleStorageChange = () => {
      setUser(AuthController.getSessionUser());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    AuthController.logout();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <html lang="es" className="dark">
      <head>
        <title>QuickMart - Sistema de Punto de Venta e Inventario</title>
        <meta name="description" content="Sistema de gestión de inventario y punto de venta para micromercados QuickMart" />
      </head>
      <body className="bg-[#0b0f17] text-gray-100 min-h-screen flex flex-col antialiased">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
