import { supabase } from '../lib/supabase';
import type { Payment, CreatePaymentData, UpdatePaymentData, PaymentWithDetails } from '../types';

/**
 * Servicio para gestionar las operaciones CRUD de pagos
 * Proporciona funciones para crear, leer, actualizar y eliminar pagos
 */
export class PaymentsService {
  /**
   * Obtiene todos los pagos de una semana específica
   * @param weekId - ID de la semana
   * @returns Promise con la lista de pagos
   */
  static async getByWeek(weekId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('week_id', weekId)
      .order('payment_date', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener pagos: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Obtiene un pago por su ID
   * @param id - ID del pago
   * @returns Promise con el pago encontrado
   */
  static async getById(id: string): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No encontrado
      }
      throw new Error(`Error al obtener pago: ${error.message}`);
    }

    return data;
  }

  /**
   * Obtiene pagos con detalles de proveedor y semana
   * @param weekId - ID de la semana (opcional)
   * @returns Promise con los pagos y sus detalles
   */
  static async getWithDetails(weekId?: string): Promise<PaymentWithDetails[]> {
    let query = supabase
      .from('payments')
      .select(`
        *,
        provider:providers(
          id,
          name,
          description
        ),
        week:weeks(
          id,
          week_number,
          credit_amount,
          month:months(
            id,
            name,
            year
          )
        )
      `);

    if (weekId) {
      query = query.eq('week_id', weekId);
    }

    const { data, error } = await query.order('payment_date', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener pagos con detalles: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Crea un nuevo pago
   * @param paymentData - Datos del pago a crear
   * @returns Promise con el pago creado
   */
  static async create(paymentData: CreatePaymentData): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert([paymentData])
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear pago: ${error.message}`);
    }

    return data;
  }

  /**
   * Actualiza un pago existente
   * @param id - ID del pago a actualizar
   * @param paymentData - Datos a actualizar
   * @returns Promise con el pago actualizado
   */
  static async update(id: string, paymentData: UpdatePaymentData): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .update({ ...paymentData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar pago: ${error.message}`);
    }

    return data;
  }

  /**
   * Elimina un pago
   * @param id - ID del pago a eliminar
   * @returns Promise que se resuelve cuando se completa la eliminación
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error al eliminar pago: ${error.message}`);
    }
  }

  /**
   * Obtiene pagos por proveedor
   * @param providerId - ID del proveedor
   * @returns Promise con los pagos del proveedor
   */
  static async getByProvider(providerId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('provider_id', providerId)
      .order('payment_date', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener pagos del proveedor: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Obtiene pagos por rango de fechas
   * @param startDate - Fecha de inicio
   * @param endDate - Fecha de fin
   * @returns Promise con los pagos en el rango
   */
  static async getByDateRange(startDate: string, endDate: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .gte('payment_date', startDate)
      .lte('payment_date', endDate)
      .order('payment_date', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener pagos por fecha: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Calcula el total de pagos de una semana
   * @param weekId - ID de la semana
   * @returns Promise con el total de pagos
   */
  static async getTotalByWeek(weekId: string): Promise<number> {
    const { data, error } = await supabase
      .from('payments')
      .select('amount')
      .eq('week_id', weekId);

    if (error) {
      throw new Error(`Error al calcular total de pagos: ${error.message}`);
    }

    return data?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  }

  /**
   * Calcula el total de pagos de un mes
   * @param monthId - ID del mes
   * @returns Promise con el total de pagos del mes
   */
  static async getTotalByMonth(monthId: string): Promise<number> {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        amount,
        week:weeks!inner(
          month_id
        )
      `)
      .eq('week.month_id', monthId);

    if (error) {
      throw new Error(`Error al calcular total de pagos del mes: ${error.message}`);
    }

    return data?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  }

  /**
   * Obtiene estadísticas de pagos
   * @param weekId - ID de la semana (opcional)
   * @returns Promise con las estadísticas
   */
  static async getPaymentStats(weekId?: string): Promise<{
    total_amount: number;
    payments_count: number;
    average_payment: number;
    max_payment: number;
    min_payment: number;
  }> {
    let query = supabase
      .from('payments')
      .select('amount');

    if (weekId) {
      query = query.eq('week_id', weekId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error al obtener estadísticas de pagos: ${error.message}`);
    }

    const payments = data || [];
    const amounts = payments.map(p => p.amount);
    const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);
    const paymentsCount = payments.length;

    return {
      total_amount: totalAmount,
      payments_count: paymentsCount,
      average_payment: paymentsCount > 0 ? totalAmount / paymentsCount : 0,
      max_payment: paymentsCount > 0 ? Math.max(...amounts) : 0,
      min_payment: paymentsCount > 0 ? Math.min(...amounts) : 0
    };
  }

  /**
   * Busca pagos por descripción
   * @param searchTerm - Término de búsqueda
   * @returns Promise con los pagos encontrados
   */
  static async searchByDescription(searchTerm: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .ilike('description', `%${searchTerm}%`)
      .order('payment_date', { ascending: false });

    if (error) {
      throw new Error(`Error al buscar pagos: ${error.message}`);
    }

    return data || [];
  }
}