import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface CardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'gray';
  subtitle?: string;
  onClick?: () => void;
  children?: ReactNode;
}

/**
 * Componente de tarjeta reutilizable
 * Diseño basado en tarjetas/paneles con colores especificados
 * Azul #3B82F6, Verde #10B981
 */
export function Card({ 
  title, 
  value, 
  icon: Icon, 
  color = 'blue', 
  subtitle, 
  onClick, 
  children 
}: CardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      border: 'border-blue-200'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      border: 'border-green-200'
    },
    gray: {
      bg: 'bg-gray-50',
      icon: 'text-gray-600',
      border: 'border-gray-200'
    }
  };

  const classes = colorClasses[color];

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border ${classes.border} p-6 ${
        onClick ? 'hover:shadow-md transition-shadow cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className={`${classes.bg} rounded-lg p-3`}>
          <Icon className={`h-6 w-6 ${classes.icon}`} />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
}