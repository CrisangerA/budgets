// Tipos de datos para el sistema de gestión de créditos

/**
 * Interfaz para la entidad Month (Mes)
 * Representa un mes específico con su información de crédito total
 */
export interface Month {
  id: string;
  name: string;
  year: number;
  total_credit: number;
  created_at: string;
  updated_at: string;
}

/**
 * Interfaz para la entidad Week (Semana)
 * Representa una semana dentro de un mes con su monto de crédito
 */
export interface Week {
  id: string;
  month_id: string;
  week_number: number;
  start_date: string;
  end_date: string;
  credit_amount: number;
  created_at: string;
  updated_at: string;
}

/**
 * Interfaz para la entidad Provider (Proveedor)
 * Representa un proveedor con su información de contacto
 */
export interface Provider {
  id: string;
  name: string;
  description?: string;
  contact_info?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Interfaz para la entidad Payment (Pago)
 * Representa un pago realizado a un proveedor en una semana específica
 */
export interface Payment {
  id: string;
  provider_id: string;
  week_id: string;
  amount: number;
  payment_date: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Tipos para formularios de creación (sin campos auto-generados)
 */
export type CreateMonthData = Omit<Month, 'id' | 'created_at' | 'updated_at'>;
export type CreateWeekData = Omit<Week, 'id' | 'created_at' | 'updated_at'>;
export type CreateProviderData = Omit<Provider, 'id' | 'created_at' | 'updated_at'> & {
  is_active?: boolean;
};
export type CreatePaymentData = Omit<Payment, 'id' | 'created_at' | 'updated_at'>;

/**
 * Tipos para formularios de actualización (campos opcionales)
 */
export type UpdateMonthData = Partial<CreateMonthData>;
export type UpdateWeekData = Partial<CreateWeekData>;
export type UpdateProviderData = Partial<CreateProviderData> & {
  is_active?: boolean;
};
export type UpdatePaymentData = Partial<CreatePaymentData>;

/**
 * Interfaz extendida para Week con información del mes
 */
export interface WeekWithMonth extends Week {
  month: Month;
}

/**
 * Interfaz extendida para Payment con información del proveedor y semana
 */
export interface PaymentWithDetails extends Payment {
  provider: Provider;
  week: WeekWithMonth;
}

/**
 * Tipo para el resumen mensual con estadísticas
 */
export interface MonthSummary {
  month: Month;
  weeks_count: number;
  total_payments: number;
  average_weekly_credit: number;
}

/**
 * Tipo para el resumen de proveedores
 */
export interface ProviderSummary {
  provider: Provider;
  payments_count: number;
  last_payment_date?: string;
}

/**
 * Interfaz extendida para Week con pagos
 */
export interface WeekWithPayments extends Week {
  payments: Payment[];
}

/**
 * Interfaz extendida para Week con resumen
 */
export interface WeekWithSummary extends Week {
  total_payments: number;
  payments_count: number;
}

/**
 * Interfaz extendida para Provider con estadísticas
 */
export interface ProviderWithStats {
  provider: Provider;
  total_payments: number;
  payments_count: number;
  last_payment_date: string | null;
  average_payment: number;
}

// Tipos para respuestas de API
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  loading: boolean
}

// Tipos para navegación
export interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  current: boolean
}