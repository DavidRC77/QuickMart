import { Product } from './types';
import { supabase, isSupabaseConfigured } from '../supabase/client';
import { mockStore } from '../supabase/mockStore';

export class ProductModel {
  static async getAll(): Promise<Product[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('productos')
        .select('*, categorias(nombre)')
        .order('nombre', { ascending: true });
      if (error) throw error;
      return (data || []).map((item: any) => ({
        ...item,
        categoria_nombre: item.categorias?.nombre || 'Sin categoría',
      }));
    }
    return mockStore.getProducts();
  }

  static async getByBarcode(barcode: string): Promise<Product | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('productos')
        .select('*, categorias(nombre)')
        .eq('codigo_barras', barcode.trim())
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        ...data,
        categoria_nombre: data.categorias?.nombre || 'Sin categoría',
      };
    }
    const products = mockStore.getProducts();
    return products.find((p) => p.codigo_barras.trim() === barcode.trim()) || null;
  }

  static async create(product: Omit<Product, 'id'>): Promise<Product> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('productos')
        .insert([product])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    return mockStore.addProduct(product);
  }

  static async update(id: string, product: Partial<Product>): Promise<Product | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('productos')
        .update(product)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    return mockStore.updateProduct(id, product);
  }

  static async delete(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('productos').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
    return mockStore.deleteProduct(id);
  }
}
