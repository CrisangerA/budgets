import { supabase } from '../lib/supabase';
import type { Week, CreateWeekData, UpdateWeekData, WeekWithPayments } from '../types';

/**
 * Servicio para gestionar las operaciones CRUD de semanas
 * Proporciona funciones para crear, leer, actualizar y eliminar semanas
 */
export class WeeksService {
  /**
   * Obtiene todas las semanas de un mes específico
   * @param monthId - ID del mes
   * @returns Promise con la lista de semanas
   */
  static async getByMonth(monthId: string): Promise<Week[]> {
    const { data, error } = await supabase
      .from('weeks')
      .select('*')
      .eq('month_id', monthId)
      .order('week_number');

    if (error) {
      throw new Error(`Error al obtener semanas: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Obtiene una semana por su ID
   * @param id - ID de la semana
   * @returns Promise con la semana encontrada
   */
  static async getById(id: string): Promise<Week | null> {
    const { data, error } = await supabase
      .from('weeks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No encontrado
      }
      throw new Error(`Error al obtener semana: ${error.message}`);
    }

    return data;
  }

  /**
   * Obtiene semanas con sus pagos asociados
   * @param monthId - ID del mes
   * @returns Promise con las semanas y sus pagos
   */
  static async getWithPayments(monthId: string): Promise<WeekWithPayments[]> {
    const { data, error } = await supabase
      .from('weeks')
      .select(`
        *,
        payments:payments(
          id,
          amount,
          description,
          payment_date,
          provider:providers(id, name)
        )
      `)
      .eq('month_id', monthId)
      .order('week_number');

    if (error) {
      throw new Error(`Error al obtener semanas con pagos: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Crea una nueva semana
   * @param weekData - Datos de la semana a crear
   * @returns Promise con la semana creada
   */
  static async create(weekData: CreateWeekData): Promise<Week> {
    const { data, error } = await supabase
      .from('weeks')
      .insert([weekData])
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear semana: ${error.message}`);
    }

    return data;
  }

  /**
   * Actualiza una semana existente
   * @param id - ID de la semana a actualizar
   * @param weekData - Datos a actualizar
   * @returns Promise con la semana actualizada
   */
  static async update(id: string, weekData: UpdateWeekData): Promise<Week> {
    const { data, error } = await supabase
      .from('weeks')
      .update({ ...weekData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar semana: ${error.message}`);
    }

    return data;
  }

  /**
   * Elimina una semana
   * @param id - ID de la semana a eliminar
   * @returns Promise que se resuelve cuando se completa la eliminación
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('weeks')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error al eliminar semana: ${error.message}`);
    }
  }

  /**
   * Obtiene el siguiente número de semana disponible para un mes
   * @param monthId - ID del mes
   * @returns Promise con el número de semana siguiente
   */
  static async getNextWeekNumber(monthId: string): Promise<number> {
    const { data, error } = await supabase
      .from('weeks')
      .select('week_number')
      .eq('month_id', monthId)
      .order('week_number', { ascending: false })
      .limit(1);

    if (error) {
      throw new Error(`Error al obtener número de semana: ${error.message}`);
    }

    return data && data.length > 0 ? data[0].week_number + 1 : 1;
  }

  /**
   * Calcula el total de pagos de una semana
   * @param weekId - ID de la semana
   * @returns Promise con el total de pagos
   */
  static async calculatePaymentsTotal(weekId: string): Promise<number> {
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
   * Obtiene estadísticas de una semana
   * @param weekId - ID de la semana
   * @returns Promise con las estadísticas de la semana
   */
  static async getWeekStats(weekId: string): Promise<{
    total_payments: number;
    remaining_credit: number;
    payments_count: number;
  }> {
    const week = await this.getById(weekId);
    if (!week) {
      throw new Error('Semana no encontrada');
    }

    const totalPayments = await this.calculatePaymentsTotal(weekId);
    
    const { data: paymentsData, error } = await supabase
      .from('payments')
      .select('id')
      .eq('week_id', weekId);

    if (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }

    return {
      total_payments: totalPayments,
      remaining_credit: week.credit_amount - totalPayments,
      payments_count: paymentsData?.length || 0
    };
  }
}