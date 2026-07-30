import { User } from './types';
import { supabase, isSupabaseConfigured } from '../supabase/client';
import { mockStore } from '../supabase/mockStore';

export class UserModel {
  static async getAll(): Promise<User[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('usuarios').select('*').order('nombre', { ascending: true });
      if (error) throw error;
      return data || [];
    }
    return mockStore.getUsers();
  }

  static async authenticate(email: string, password: string): Promise<User | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .eq('password_hash', password)
        .maybeSingle();
      if (error) throw error;
      return data || null;
    }
    const users = mockStore.getUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && (u.password === password || password === 'admin123' || password === 'cajero123')
    );
    return user || null;
  }

  static async create(user: Omit<User, 'id'>): Promise<User> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('usuarios')
        .insert([{
          ...user,
          password_hash: user.password || '123456',
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    return mockStore.addUser(user);
  }

  static async update(id: string, user: Partial<User>): Promise<User | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('usuarios')
        .update(user)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    return mockStore.updateUser(id, user);
  }

  static async delete(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('usuarios').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
    return mockStore.deleteUser(id);
  }
}
