'use client';

import './globals.css';
import { useState, useEffect } from 'react';
import { Navbar } from '../components/navbar';
import { AuthController } from '../lib/controllers/authController';
import { User } from '../lib/models/types';
import { Inter, IBM_Plex_Sans } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "next-themes";

const ibmPlexSansHeading = IBM_Plex_Sans({subsets:['latin'], variable:'--font-heading', weight: ['400', '500', '600', '700']});

const inter = Inter({subsets:['latin'],variable:'--font-sans'});


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
    <html lang="es" suppressHydrationWarning>
      <head>
        <title>QuickMart - Sistema de Punto de Venta e Inventario</title>
        <meta name="description" content="Sistema de gestión de inventario y punto de venta para micromercados QuickMart" />
      </head>
      <body className={cn("bg-background text-foreground min-h-screen flex flex-col antialiased font-sans", inter.variable, ibmPlexSansHeading.variable)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Navbar user={user} onLogout={handleLogout} />
          <main className="flex-1 flex flex-col">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
