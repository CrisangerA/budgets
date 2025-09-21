import { supabase } from '../lib/supabase';
import type { Month, CreateMonthData, UpdateMonthData, MonthSummary } from '../types';

/**
 * Servicio para gestionar las operaciones CRUD de meses
 * Proporciona funciones para crear, leer, actualizar y eliminar meses
 */
export class MonthsService {
  /**
   * Obtiene todos los meses ordenados por año y nombre
   * @returns Promise con la lista de meses
   */
  static async getAll(): Promise<Month[]> {
    const { data, error } = await supabase
      .from('months')
      .select('*')
      .order('year', { ascending: false })
      .order('name');

    if (error) {
      throw new Error(`Error al obtener meses: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Obtiene un mes por su ID
   * @param id - ID del mes
   * @returns Promise con el mes encontrado
   */
  static async getById(id: string): Promise<Month | null> {
    const { data, error } = await supabase
      .from('months')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No encontrado
      }
      throw new Error(`Error al obtener mes: ${error.message}`);
    }

    return data;
  }

  /**
   * Crea un nuevo mes
   * @param monthData - Datos del mes a crear
   * @returns Promise con el mes creado
   */
  static async create(monthData: CreateMonthData): Promise<Month> {
    const { data, error } = await supabase
      .from('months')
      .insert([monthData])
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear mes: ${error.message}`);
    }

    return data;
  }

  /**
   * Actualiza un mes existente
   * @param id - ID del mes a actualizar
   * @param monthData - Datos a actualizar
   * @returns Promise con el mes actualizado
   */
  static async update(id: string, monthData: UpdateMonthData): Promise<Month> {
    const { data, error } = await supabase
      .from('months')
      .update({ ...monthData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar mes: ${error.message}`);
    }

    return data;
  }

  /**
   * Elimina un mes
   * @param id - ID del mes a eliminar
   * @returns Promise que se resuelve cuando se completa la eliminación
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('months')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error al eliminar mes: ${error.message}`);
    }
  }

  /**
   * Obtiene el resumen de meses con estadísticas
   * @returns Promise con la lista de resúmenes mensuales
   */
  static async getSummary(): Promise<MonthSummary[]> {
    const { data, error } = await supabase
      .from('months')
      .select(`
        *,
        weeks:weeks(count),
        payments:weeks(payments(amount))
      `)
      .order('year', { ascending: false })
      .order('name');

    if (error) {
      throw new Error(`Error al obtener resumen de meses: ${error.message}`);
    }

    return (data || []).map(month => ({
      month: {
        id: month.id,
        name: month.name,
        year: month.year,
        total_credit: month.total_credit,
        created_at: month.created_at,
        updated_at: month.updated_at
      },
      weeks_count: month.weeks?.[0]?.count || 0,
      total_payments: month.payments?.reduce((sum: number, week: any) => 
        sum + (week.payments?.reduce((weekSum: number, payment: any) => weekSum + payment.amount, 0) || 0), 0) || 0,
      average_weekly_credit: month.weeks?.[0]?.count > 0 ? month.total_credit / month.weeks[0].count : 0
    }));
  }

  /**
   * Recalcula el total de crédito de un mes basado en sus semanas
   * @param monthId - ID del mes
   * @returns Promise con el mes actualizado
   */
  static async recalculateTotal(monthId: string): Promise<Month> {
    // Obtener la suma de créditos de todas las semanas del mes
    const { data: weeks, error: weeksError } = await supabase
      .from('weeks')
      .select('credit_amount')
      .eq('month_id', monthId);

    if (weeksError) {
      throw new Error(`Error al obtener semanas: ${weeksError.message}`);
    }

    const totalCredit = weeks?.reduce((sum, week) => sum + (week.credit_amount || 0), 0) || 0;

    // Actualizar el total del mes
    return this.update(monthId, { total_credit: totalCredit });
  }
}