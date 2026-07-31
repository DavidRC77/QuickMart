'use client';

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ShoppingBag, Lock, Mail, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Lado izquierdo: Imagen (oculto en móviles, ocupa aprox 70-75% en desktop) */}
      <div className="hidden lg:flex lg:w-[65%] xl:w-[75%] relative bg-muted">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10 pointer-events-none"></div>
        <Image 
          src="/woman-with-shopping-cart-buying-food-supermarket.jpg" 
          alt="QuickMart Supermarket"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Lado derecho: Formulario de Login (ocupa aprox 25-35% en desktop) */}
      <div className="w-full lg:w-[35%] xl:w-[25%] flex items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-background">
        
        {/* Glow ambient background para el lado derecho */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="w-full max-w-sm space-y-8 relative z-10">
          {/* Brand Header */}
          <div className="text-left space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-primary to-primary/80 shadow-xl shadow-primary/20 mb-4">
              <ShoppingBag className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
              Micro<span className="text-primary">mercado</span>
            </h1>
            <p className="text-sm font-medium text-muted-foreground">Ingresa tus credenciales para continuar</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="text-xs font-semibold text-foreground/80 block mb-1.5">Correo Electrónico</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-muted-foreground absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="usuario@quickmart.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary text-foreground rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-foreground/80 block">Contraseña</label>
                <a href="#" className="text-[10px] text-primary font-bold hover:underline">¿Olvidaste tu contraseña?</a>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-muted-foreground absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary text-foreground rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-xs font-semibold text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-4"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
          
          <div className="text-center text-[10px] text-muted-foreground pt-8">
            <p>&copy; 2026 QuickMart LLC. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
