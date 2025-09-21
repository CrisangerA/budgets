import { supabase } from '../lib/supabase';
import type { Provider, CreateProviderData, UpdateProviderData, ProviderWithStats } from '../types';

/**
 * Servicio para gestionar las operaciones CRUD de proveedores
 * Proporciona funciones para crear, leer, actualizar y eliminar proveedores
 */
export class ProvidersService {
  /**
   * Obtiene todos los proveedores ordenados por nombre
   * @returns Promise con la lista de proveedores
   */
  static async getAll(): Promise<Provider[]> {
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .order('name');

    if (error) {
      throw new Error(`Error al obtener proveedores: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Obtiene un proveedor por su ID
   * @param id - ID del proveedor
   * @returns Promise con el proveedor encontrado
   */
  static async getById(id: string): Promise<Provider | null> {
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No encontrado
      }
      throw new Error(`Error al obtener proveedor: ${error.message}`);
    }

    return data;
  }

  /**
   * Obtiene proveedores con estadísticas de pagos
   * @returns Promise con los proveedores y sus estadísticas
   */
  static async getWithStats(): Promise<ProviderWithStats[]> {
    const { data, error } = await supabase
      .from('providers')
      .select(`
        *,
        payments:payments(
          id,
          amount,
          payment_date
        )
      `)
      .order('name');

    if (error) {
      throw new Error(`Error al obtener proveedores con estadísticas: ${error.message}`);
    }

    return (data || []).map(provider => ({
      provider: {
        id: provider.id,
        name: provider.name,
        description: provider.description,
        contact_info: provider.contact_info,
        is_active: provider.is_active,
        created_at: provider.created_at,
        updated_at: provider.updated_at
      },
      total_payments: provider.payments?.reduce((sum: number, payment: any) => sum + payment.amount, 0) || 0,
      payments_count: provider.payments?.length || 0,
      last_payment_date: provider.payments && provider.payments.length > 0 
        ? provider.payments.sort((a: any, b: any) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())[0].payment_date
        : null,
      average_payment: provider.payments && provider.payments.length > 0
        ? provider.payments.reduce((sum: number, payment: any) => sum + payment.amount, 0) / provider.payments.length
        : 0
    }));
  }

  /**
   * Crea un nuevo proveedor
   * @param providerData - Datos del proveedor a crear
   * @returns Promise con el proveedor creado
   */
  static async create(providerData: CreateProviderData): Promise<Provider> {
    const { data, error } = await supabase
      .from('providers')
      .insert([providerData])
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear proveedor: ${error.message}`);
    }

    return data;
  }

  /**
   * Actualiza un proveedor existente
   * @param id - ID del proveedor a actualizar
   * @param providerData - Datos a actualizar
   * @returns Promise con el proveedor actualizado
   */
  static async update(id: string, providerData: UpdateProviderData): Promise<Provider> {
    const { data, error } = await supabase
      .from('providers')
      .update({ ...providerData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar proveedor: ${error.message}`);
    }

    return data;
  }

  /**
   * Elimina un proveedor
   * @param id - ID del proveedor a eliminar
   * @returns Promise que se resuelve cuando se completa la eliminación
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('providers')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error al eliminar proveedor: ${error.message}`);
    }
  }

  /**
   * Activa o desactiva un proveedor
   * @param id - ID del proveedor
   * @param isActive - Estado activo/inactivo
   * @returns Promise con el proveedor actualizado
   */
  static async toggleActive(id: string, isActive: boolean): Promise<Provider> {
    return this.update(id, { is_active: isActive });
  }

  /**
   * Busca proveedores por nombre
   * @param searchTerm - Término de búsqueda
   * @returns Promise con los proveedores encontrados
   */
  static async searchByName(searchTerm: string): Promise<Provider[]> {
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .ilike('name', `%${searchTerm}%`)
      .order('name');

    if (error) {
      throw new Error(`Error al buscar proveedores: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Obtiene proveedores activos únicamente
   * @returns Promise con los proveedores activos
   */
  static async getActive(): Promise<Provider[]> {
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw new Error(`Error al obtener proveedores activos: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Obtiene estadísticas de un proveedor específico
   * @param providerId - ID del proveedor
   * @returns Promise con las estadísticas del proveedor
   */
  static async getProviderStats(providerId: string): Promise<{
    total_payments: number;
    payments_count: number;
    average_payment: number;
    first_payment_date: string | null;
    last_payment_date: string | null;
  }> {
    const { data, error } = await supabase
      .from('payments')
      .select('amount, payment_date')
      .eq('provider_id', providerId)
      .order('payment_date');

    if (error) {
      throw new Error(`Error al obtener estadísticas del proveedor: ${error.message}`);
    }

    const payments = data || [];
    const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const paymentsCount = payments.length;

    return {
      total_payments: totalPayments,
      payments_count: paymentsCount,
      average_payment: paymentsCount > 0 ? totalPayments / paymentsCount : 0,
      first_payment_date: paymentsCount > 0 ? payments[0].payment_date : null,
      last_payment_date: paymentsCount > 0 ? payments[paymentsCount - 1].payment_date : null
    };
  }
}