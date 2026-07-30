import { Sale, DailyReport } from './types';
import { supabase, isSupabaseConfigured } from '../supabase/client';
import { mockStore } from '../supabase/mockStore';

export class SaleModel {
  static async getAll(): Promise<Sale[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('ventas')
        .select('*, detalle_ventas(*)')
        .order('fecha', { ascending: false });
      if (error) throw error;
      return (data || []).map((v: any) => ({
        ...v,
        detalles: v.detalle_ventas || [],
      }));
    }
    return mockStore.getSales();
  }

  static async createSale(saleData: Omit<Sale, 'id' | 'numero_factura' | 'fecha'>): Promise<Sale> {
    if (isSupabaseConfigured && supabase) {
      // Generar número de factura secuencial
      const { count } = await supabase.from('ventas').select('*', { count: 'exact', head: true });
      const numeroFactura = `FAC-${String((count || 0) + 1001).padStart(6, '0')}`;

      // 1. Insertar venta
      const { data: venta, error: ventaError } = await supabase
        .from('ventas')
        .insert([
          {
            numero_factura: numeroFactura,
            cliente_id: saleData.cliente_id || null,
            nit_ci: saleData.nit_ci,
            razon_social: saleData.razon_social,
            usuario_id: saleData.usuario_id,
            metodo_pago: saleData.metodo_pago,
            monto_recibido: saleData.monto_recibido,
            cambio: saleData.cambio,
            total: saleData.total,
          },
        ])
        .select()
        .single();

      if (ventaError) throw ventaError;

      // 2. Insertar detalles (Aquí se dispara automáticamente el Trigger descontar_stock_y_validar en Postgres!)
      const detallesPayload = saleData.detalles.map((d) => ({
        venta_id: venta.id,
        producto_id: d.producto_id,
        cantidad: d.cantidad,
        precio_unitario: d.precio_unitario,
        subtotal: d.subtotal,
      }));

      const { error: detallesError } = await supabase.from('detalle_ventas').insert(detallesPayload);
      if (detallesError) {
        // En caso de fallo por stock u otro error, se cancela la venta registrada
        await supabase.from('ventas').delete().eq('id', venta.id);
        throw detallesError;
      }

      return {
        ...venta,
        detalles: saleData.detalles,
      };
    }

    // Fallback MockStore local con simulación de Trigger
    return mockStore.createSale(saleData);
  }

  static async getDailyReport(targetDateStr?: string): Promise<DailyReport> {
    const targetDate = targetDateStr ? new Date(targetDateStr) : new Date();
    const targetDateFormatted = targetDate.toISOString().split('T')[0];

    const allSales = await this.getAll();
    const dailySales = allSales.filter((s) => {
      const saleDateStr = new Date(s.fecha).toISOString().split('T')[0];
      return saleDateStr === targetDateFormatted;
    });

    const totalIngresos = dailySales.reduce((acc, s) => acc + s.total, 0);
    const efectivoTotal = dailySales
      .filter((s) => s.metodo_pago === 'efectivo')
      .reduce((acc, s) => acc + s.total, 0);
    const qrTotal = dailySales
      .filter((s) => s.metodo_pago === 'qr')
      .reduce((acc, s) => acc + s.total, 0);
    const tarjetaTotal = dailySales
      .filter((s) => s.metodo_pago === 'tarjeta')
      .reduce((acc, s) => acc + s.total, 0);

    return {
      fecha: targetDateFormatted,
      totalIngresos,
      totalVentas: dailySales.length,
      efectivoTotal,
      qrTotal,
      tarjetaTotal,
      ventas: dailySales,
    };
  }
}
