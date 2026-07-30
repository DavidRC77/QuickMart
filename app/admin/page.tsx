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
        <h1 className="text-2xl font-bold text-white tracking-tight">Panel de Control General</h1>
        <p className="text-xs text-gray-400 mt-1">Resumen del sistema y estado de inventario QuickMart</p>
      </div>

      {/* Grid de Tarjetas de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ingresos Hoy */}
        <div className="glass-panel p-5 rounded-3xl border border-emerald-500/20 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-400 uppercase">Ingresos de Hoy</span>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">Bs. {salesTodayTotal.toFixed(2)}</div>
          <span className="text-[11px] text-emerald-400 font-semibold">{salesTodayCount} ventas realizadas hoy</span>
        </div>

        {/* Alertas de Stock Bajo */}
        <div className="glass-panel p-5 rounded-3xl border border-red-500/20 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-400 uppercase">Alertas Stock Bajo</span>
            <div className="p-2 bg-red-500/10 rounded-xl text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-red-400">{lowStockProducts.length} productos</div>
          <span className="text-[11px] text-gray-400">Stock actual ≤ stock mínimo</span>
        </div>

        {/* Total Productos */}
        <div className="glass-panel p-5 rounded-3xl border border-indigo-500/20 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-400 uppercase">Catálogo Activo</span>
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">{productsCount} productos</div>
          <span className="text-[11px] text-gray-400">{categoriesCount} categorías creadas</span>
        </div>

        {/* Personal Registrado */}
        <div className="glass-panel p-5 rounded-3xl border border-blue-500/20 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-400 uppercase">Personal Activo</span>
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">{usersCount} usuarios</div>
          <span className="text-[11px] text-gray-400">Cajeros y Administradores</span>
        </div>
      </div>

      {/* Alertas Críticas de Productos con Bajo Stock */}
      <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" /> Productos que requieren Reabastecimiento
          </h2>
          <Link href="/admin/productos" className="text-xs text-emerald-400 font-bold hover:underline flex items-center gap-1">
            Ver Todos en Inventario <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {lowStockProducts.length === 0 ? (
          <div className="p-6 text-center text-gray-500 bg-gray-900/40 rounded-2xl border border-gray-800">
            <p className="text-sm font-semibold text-emerald-400">¡Todo en orden! No hay productos con stock crítico en este momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {lowStockProducts.map((prod) => (
              <div key={prod.id} className="p-4 bg-red-950/20 border border-red-500/30 rounded-2xl space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-bold text-white truncate">{prod.nombre}</h4>
                  <span className="bg-red-500/20 text-red-300 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-red-500/40">
                    Bajo Stock
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Stock Actual: <strong className="text-red-400 font-extrabold">{prod.stock_actual}</strong></span>
                  <span>Mínimo: <strong>{prod.stock_minimo}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Acceso Directo a POS */}
      <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 to-teal-950/40 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-white">¿Deseas abrir el Punto de Venta?</h3>
          <p className="text-xs text-gray-400">Ir directamente a la caja para escaneo y registro de ventas</p>
        </div>
        <Link
          href="/pos"
          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-2xl text-sm shadow-xl shadow-emerald-500/20 flex items-center gap-2 transition-all"
        >
          <ShoppingBag className="w-5 h-5" /> Abrir Caja / POS
        </Link>
      </div>
    </div>
  );
}
