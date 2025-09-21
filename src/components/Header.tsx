import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface HeaderAction {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  actions?: HeaderAction[];
}

/**
 * Componente Header reutilizable optimizado para dispositivos móviles
 * Proporciona una interfaz consistente para todas las vistas de la aplicación
 */
export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  onBackClick,
  actions = []
}) => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 gap-4">
          {/* Título y navegación */}
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
            {showBackButton && onBackClick && (
              <button
                onClick={onBackClick}
                className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
                <span className="hidden sm:inline">Volver</span>
              </button>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1 text-xs sm:text-sm text-gray-500 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          {actions.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:flex-shrink-0">
              {actions.map((action, index) => {
                const Icon = action.icon;
                const isPrimary = action.variant === 'primary' || action.variant === undefined;
                
                return (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className={`
                      inline-flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 
                      border rounded-md shadow-sm text-sm font-medium transition-colors
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                      ${
                        isPrimary
                          ? 'border-transparent text-white bg-blue-600 hover:bg-blue-700'
                          : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                      }
                    `}
                  >
                    {Icon && (
                      <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                    )}
                    <span className="truncate">{action.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;