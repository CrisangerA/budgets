import React from 'react';
import { z } from 'zod';

/**
 * Esquema de validación para meses
 * Valida los datos requeridos para crear o editar un mes
 */
export const monthSchema = z.object({
  name: z.string()
    .min(1, 'El nombre del mes es requerido')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  year: z.number()
    .int('El año debe ser un número entero')
    .min(2020, 'El año debe ser mayor a 2020')
    .max(2030, 'El año debe ser menor a 2030'),
  total_credit: z.number()
    .min(0, 'El crédito total debe ser mayor o igual a 0')
    .optional()
});

/**
 * Esquema de validación para semanas
 * Valida los datos requeridos para crear o editar una semana
 */
export const weekSchema = z.object({
  name: z.string()
    .min(1, 'El nombre de la semana es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  start_date: z.string()
    .min(1, 'La fecha de inicio es requerida')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, 'Formato de fecha inválido'),
  end_date: z.string()
    .min(1, 'La fecha de fin es requerida')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, 'Formato de fecha inválido'),
  month_id: z.string()
    .uuid('ID de mes inválido')
}).refine((data) => {
  const startDate = new Date(data.start_date);
  const endDate = new Date(data.end_date);
  return startDate <= endDate;
}, {
  message: 'La fecha de inicio debe ser anterior o igual a la fecha de fin',
  path: ['end_date']
});

/**
 * Esquema de validación para proveedores
 * Valida los datos requeridos para crear o editar un proveedor
 */
export const providerSchema = z.object({
  name: z.string()
    .min(1, 'El nombre del proveedor es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  description: z.string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
  contact_info: z.string()
    .max(200, 'La información de contacto no puede exceder 200 caracteres')
    .optional()
    .or(z.literal(''))
});

/**
 * Esquema de validación para pagos
 * Valida los datos requeridos para crear o editar un pago
 */
export const paymentSchema = z.object({
  amount: z.number()
    .positive('El monto debe ser mayor a 0')
    .max(999999.99, 'El monto no puede exceder 999,999.99'),
  description: z.string()
    .min(1, 'La descripción es requerida')
    .max(200, 'La descripción no puede exceder 200 caracteres'),
  payment_date: z.string()
    .min(1, 'La fecha de pago es requerida')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, 'Formato de fecha inválido'),
  provider_id: z.string()
    .uuid('ID de proveedor inválido'),
  week_id: z.string()
    .uuid('ID de semana inválido')
});

/**
 * Tipos TypeScript derivados de los esquemas Zod
 */
export type MonthFormData = z.infer<typeof monthSchema>;
export type WeekFormData = z.infer<typeof weekSchema>;
export type ProviderFormData = z.infer<typeof providerSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;

/**
 * Función utilitaria para validar datos con manejo de errores
 * @param schema - Esquema Zod a utilizar para la validación
 * @param data - Datos a validar
 * @returns Objeto con resultado de validación y errores si los hay
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return {
      success: true,
      data: result.data,
      errors: null
    };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach((error) => {
    const path = error.path.join('.');
    errors[path] = error.message;
  });
  
  return {
    success: false,
    data: null,
    errors
  };
}

/**
 * Hook personalizado para validación en tiempo real
 * @param schema - Esquema Zod a utilizar
 * @param initialData - Datos iniciales del formulario
 */
export function useFormValidation<T extends Record<string, any>>(
  schema: z.ZodObject<any>, 
  initialData: Partial<T> = {}
) {
  const [data, setData] = React.useState<Partial<T>>(initialData);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  
  const validateField = (name: string, value: unknown) => {
    try {
      const fieldSchema = schema.pick({ [name]: true });
      const result = fieldSchema.safeParse({ [name]: value });
      
      if (result.success) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      } else {
        const error = result.error.errors[0];
        setErrors(prev => ({
          ...prev,
          [name]: error.message
        }));
      }
    } catch (error) {
      // Si no se puede validar el campo individual, validar todo el objeto
      const result = schema.safeParse({ ...data, [name]: value });
      if (!result.success) {
        const fieldError = result.error.errors.find(err => 
          err.path.includes(name)
        );
        if (fieldError) {
          setErrors(prev => ({
            ...prev,
            [name]: fieldError.message
          }));
        }
      }
    }
  };
  
  const updateField = (name: string, value: unknown) => {
    setData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    
    if (touched[name]) {
      validateField(name, value);
    }
  };
  
  const validateAll = () => {
    const result = validateData(schema, data);
    if (!result.success && result.errors) {
      setErrors(result.errors);
    }
    return result;
  };
  
  const reset = () => {
    setData(initialData);
    setErrors({});
    setTouched({});
  };
  
  return {
    data,
    errors,
    touched,
    updateField,
    validateAll,
    reset,
    isValid: Object.keys(errors).length === 0
  };
}