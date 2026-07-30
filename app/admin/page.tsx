'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProductModel } from '../../lib/models/productModel';
import { CategoryModel } from '../../lib/models/categoryModel';
import { SaleModel } from '../../lib/models/saleModel';
import { UserModel } from '../../lib/models/userModel';
import { Product } from '../../lib/models/types';
import { Package, AlertTriangle, DollarSign, ShoppingBag, ArrowRight, ShieldCheck, Tags } from 'lucide-react';

export default function AdminDashboardPage() {
  const [productsCount, setProductsCount] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [salesTodayTotal, setSalesTodayTotal] = useState(0);
  const [salesTodayCount, setSalesTodayCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const [prods, cats, usrs, report] = await Promise.all([
          ProductModel.getAll(),
          CategoryModel.getAll(),
          UserModel.getAll(),
          SaleModel.getDailyReport(),
        ]);
        setProductsCount(prods.length);
        const lowStock = prods.filter((p) => p.stock_actual <= p.stock_minimo);
        setLowStockProducts(lowStock);
        setCategoriesCount(cats.length);
        setUsersCount(usrs.length);
        setSalesTodayTotal(report.totalIngresos);
        setSalesTodayCount(report.totalVentas);
      } catch (err) {
        console.error('Error cargando métricas:', err);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Panel de Control General</h1>
        <p className="text-xs text-muted-foreground mt-1">Resumen del sistema y estado de inventario QuickMart</p>
      </div>

      {/* Grid de Tarjetas de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ingresos Hoy */}
        <div className="bg-card text-card-foreground p-5 rounded-3xl border border-transparent space-y-2 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Ingresos de Hoy</span>
            <div className="p-2 bg-primary/10 rounded-xl text-primary shadow-sm">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-foreground">Bs. {salesTodayTotal.toFixed(2)}</div>
          <span className="text-[11px] text-primary font-semibold">{salesTodayCount} ventas realizadas hoy</span>
        </div>

        {/* Alertas de Stock Bajo */}
        <div className="bg-card text-card-foreground p-5 rounded-3xl border border-transparent space-y-2 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Alertas Stock Bajo</span>
            <div className="p-2 bg-destructive/10 rounded-xl text-destructive shadow-sm">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-destructive">{lowStockProducts.length} productos</div>
          <span className="text-[11px] text-muted-foreground">Stock actual ≤ stock mínimo</span>
        </div>

        {/* Total Productos */}
        <div className="bg-card text-card-foreground p-5 rounded-3xl border border-transparent space-y-2 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Catálogo Activo</span>
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 shadow-sm">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-foreground">{productsCount} productos</div>
          <span className="text-[11px] text-muted-foreground">{categoriesCount} categorías creadas</span>
        </div>

        {/* Personal Registrado */}
        <div className="bg-card text-card-foreground p-5 rounded-3xl border border-transparent space-y-2 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Personal Activo</span>
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-foreground">{usersCount} usuarios</div>
          <span className="text-[11px] text-muted-foreground">Cajeros y Administradores</span>
        </div>
      </div>

      {/* Alertas Críticas de Productos con Bajo Stock */}
      <div className="bg-card text-card-foreground p-6 rounded-3xl border border-transparent space-y-4 shadow-sm">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" /> Productos que requieren Reabastecimiento
          </h2>
          <Link href="/admin/productos" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
            Ver Todos en Inventario <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {lowStockProducts.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground bg-background rounded-2xl border border-transparent shadow-sm">
            <p className="text-sm font-semibold text-primary">¡Todo en orden! No hay productos con stock crítico en este momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {lowStockProducts.map((prod) => (
              <div key={prod.id} className="p-4 bg-background border border-transparent rounded-2xl space-y-2 shadow-sm">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-bold text-foreground truncate">{prod.nombre}</h4>
                  <span className="bg-destructive/10 text-destructive text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-transparent shadow-sm">
                    Bajo Stock
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Stock Actual: <strong className="text-destructive font-extrabold">{prod.stock_actual}</strong></span>
                  <span>Mínimo: <strong>{prod.stock_minimo}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Acceso Directo a POS */}
      <div className="bg-card p-6 rounded-3xl border border-transparent flex justify-between items-center shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-foreground">¿Deseas abrir el Punto de Venta?</h3>
          <p className="text-xs text-muted-foreground">Ir directamente a la caja para escaneo y registro de ventas</p>
        </div>
        <Link
          href="/pos"
          className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl text-sm shadow-md shadow-primary/20 flex items-center gap-2 transition-all"
        >
          <ShoppingBag className="w-5 h-5" /> Abrir Caja / POS
        </Link>
      </div>
    </div>
  );
}
