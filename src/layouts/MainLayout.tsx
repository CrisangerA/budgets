import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  HomeIcon, 
  UserGroupIcon, 
  CreditCardIcon,
  PlusIcon 
} from '@heroicons/react/24/outline'

interface MainLayoutProps {
  children: React.ReactNode
}

/**
 * Layout principal de la aplicación con navegación
 * Incluye header con navegación y área de contenido principal
 */
export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation()

  const navigationItems = [
    {
      name: 'Resumen',
      href: '/',
      icon: HomeIcon,
      current: location.pathname === '/'
    },
    {
      name: 'Proveedores',
      href: '/providers',
      icon: UserGroupIcon,
      current: location.pathname === '/providers'
    },
    {
      name: 'Pagos',
      href: '/payments',
      icon: CreditCardIcon,
      current: location.pathname === '/payments'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con navegación */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Título */}
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Gestión de Créditos
              </h1>
            </div>

            {/* Navegación */}
            <nav className="hidden md:flex space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      item.current
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* Botón de agregar */}
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-success-600 hover:bg-success-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success-500 transition-colors">
              <PlusIcon className="w-5 h-5 mr-2" />
              Agregar
            </button>
          </div>
        </div>

        {/* Navegación móvil */}
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 py-3 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors ${
                    item.current
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}