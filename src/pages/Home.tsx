import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, DollarSign, CreditCard, TrendingUp, Building2 } from 'lucide-react';
import { MonthsService } from '../services/monthsService';
import type { MonthSummary, CreateMonthData } from '../types';
import { Header } from '../components';

/**
 * Página principal con resumen mensual de créditos
 * Implementa RF-01 (visualización de resumen mensual) y RF-02 (totales de créditos)
 */
export default function Home() {
  const navigate = useNavigate();
  const [months, setMonths] = useState<MonthSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMonthName, setNewMonthName] = useState('');
  const [newMonthYear, setNewMonthYear] = useState(new Date().getFullYear());

  /**
   * Carga los meses con sus resúmenes al montar el componente
   */
  useEffect(() => {
    loadMonths();
  }, []);

  /**
   * Obtiene todos los meses con sus resúmenes desde el servicio
   */
  const loadMonths = async () => {
    try {
      setLoading(true);
      const monthsData = await MonthsService.getSummary();
      setMonths(monthsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los meses');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Crea un nuevo mes
   */
  const handleCreateMonth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMonthName.trim()) return;

    try {
      await MonthsService.create({
        name: newMonthName.trim(),
        year: newMonthYear,
        total_credit: 0
      });
      setNewMonthName('');
      setNewMonthYear(new Date().getFullYear());
      setShowCreateForm(false);
      await loadMonths();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el mes');
    }
  };

  /**
   * Calcula el total general de todos los meses
   */
  const totalGeneral = months.reduce((sum, month) => sum + month.month.total_credit, 0);
  const totalPagado = months.reduce((sum, month) => sum + month.total_payments, 0);
  const totalPendiente = totalGeneral - totalPagado;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando resumen mensual...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        title="Gestión de Créditos"
        subtitle="Resumen mensual de créditos y pagos"
        actions={[
          {
            label: "Gestionar Proveedores",
            onClick: () => navigate('/providers'),
            icon: Building2,
            variant: "secondary"
          },
          {
            label: "Agregar Mes",
            onClick: () => setShowCreateForm(true),
            icon: Plus,
            variant: "primary"
          }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tarjetas de resumen general */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Créditos</p>
                <p className="text-2xl font-bold text-gray-900">${totalGeneral.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCard className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Pagado</p>
                <p className="text-2xl font-bold text-green-600">${totalPagado.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pendiente</p>
                <p className="text-2xl font-bold text-orange-600">${totalPendiente.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Lista de meses */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Resumen por Mes</h2>
          </div>
          
          {months.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay meses registrados</h3>
              <p className="text-gray-500 mb-4">Comienza agregando tu primer mes para gestionar créditos</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primer Mes
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {months.map((month) => {
                const porcentajePagado = month.month.total_credit > 0
                  ? (month.total_payments / month.month.total_credit) * 100 
                  : 0;
                
                return (
                    <div key={month.month.id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                       onClick={() => navigate(`/month/${month.month.id}`)}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900">
                            {month.month.name} {month.month.year}
                          </h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {month.weeks_count} semanas
                          </span>
                        </div>
                        
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Crédito Total</p>
                            <p className="text-lg font-semibold text-gray-900">
                              ${month.month.total_credit.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Pagado</p>
                            <p className="text-lg font-semibold text-green-600">
                              ${month.total_payments.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Pendiente</p>
                            <p className="text-lg font-semibold text-orange-600">
                              ${(month.month.total_credit - month.total_payments).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        {/* Barra de progreso */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                            <span>Progreso de pagos</span>
                            <span>{porcentajePagado.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(porcentajePagado, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-6">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Última actualización</p>
                          <p className="text-sm text-gray-900">
                            {new Date(month.month.updated_at).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal para crear nuevo mes */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Agregar Nuevo Mes</h3>
              <form onSubmit={handleCreateMonth}>
                <div className="mb-4">
                  <label htmlFor="monthName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Mes
                  </label>
                  <input
                    type="text"
                    id="monthName"
                    value={newMonthName}
                    onChange={(e) => setNewMonthName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Enero, Febrero..."
                    required
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="monthYear" className="block text-sm font-medium text-gray-700 mb-2">
                    Año
                  </label>
                  <input
                    type="number"
                    id="monthYear"
                    value={newMonthYear}
                    onChange={(e) => setNewMonthYear(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="2020"
                    max="2030"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewMonthName('');
                      setNewMonthYear(new Date().getFullYear());
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Crear Mes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}