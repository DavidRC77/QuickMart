import { Customer } from './types';
import { supabase, isSupabaseConfigured } from '../supabase/client';
import { mockStore } from '../supabase/mockStore';

export class CustomerModel {
  static async getAll(): Promise<Customer[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('clientes').select('*').order('razon_social', { ascending: true });
      if (error) throw error;
      return data || [];
    }
    return mockStore.getCustomers();
  }

  static async findByNitCi(nit_ci: string): Promise<Customer | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('nit_ci', nit_ci.trim())
        .maybeSingle();
      if (error) throw error;
      return data || null;
    }
    return mockStore.findCustomerByNit(nit_ci);
  }

  static async create(customer: Omit<Customer, 'id'>): Promise<Customer> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('clientes')
        .insert([customer])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    return mockStore.addCustomer(customer);
  }

  static async update(id: string, customer: Partial<Customer>): Promise<Customer | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('clientes')
        .update(customer)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    // Update local store customer
    const customers = mockStore.getCustomers();
    const idx = customers.findIndex((c) => c.id === id);
    if (idx !== -1) {
      Object.assign(customers[idx], customer);
    }
    return customers[idx] || null;
  }

  static async delete(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('clientes').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
    return true;
  }
}
