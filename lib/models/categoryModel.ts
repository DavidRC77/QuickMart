import { Category } from './types';
import { supabase, isSupabaseConfigured } from '../supabase/client';
import { mockStore } from '../supabase/mockStore';

export class CategoryModel {
  static async getAll(): Promise<Category[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('nombre', { ascending: true });
      if (error) throw error;
      return data || [];
    }
    return mockStore.getCategories();
  }

  static async create(category: Omit<Category, 'id'>): Promise<Category> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('categorias')
        .insert([category])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    return mockStore.addCategory(category);
  }

  static async update(id: string, category: Partial<Category>): Promise<Category | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('categorias')
        .update(category)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    return mockStore.updateCategory(id, category);
  }

  static async delete(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('categorias').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
    return mockStore.deleteCategory(id);
  }
}
