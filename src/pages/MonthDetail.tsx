import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Calendar, DollarSign, CreditCard, ArrowLeft, Trash2, Edit } from 'lucide-react';
import { MonthsService } from '../services/monthsService';
import { WeeksService } from '../services/weeksService';
import { Breadcrumbs } from '../components/Breadcrumbs';
import type { Month, Week, CreateWeekData, WeekWithPayments } from '../types';

/**
 * Página de detalle semanal por mes
 * Implementa RF-03 (navegación a detalle semanal), RF-04 (visualización de semanas) y RF-05 (agregar semanas)
 */
export default function MonthDetail() {
  const { monthId } = useParams<{ monthId: string }>();
  const navigate = useNavigate();
  const [month, setMonth] = useState<Month | null>(null);
  const [weeks, setWeeks] = useState<WeekWithPayments[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWeekCredit, setNewWeekCredit] = useState('');

  /**
   * Carga los datos del mes y sus semanas al montar el componente
   */
  useEffect(() => {
    if (monthId) {
      loadMonthData();
    }
  }, [monthId]);

  /**
   * Obtiene los datos del mes y sus semanas
   */
  const loadMonthData = async () => {
    if (!monthId) return;

    try {
      setLoading(true);
      const [monthData, weeksData] = await Promise.all([
        MonthsService.getById(monthId),
        WeeksService.getWithPayments(monthId)
      ]);
      
      if (!monthData) {
        setError('Mes no encontrado');
        return;
      }
      
      setMonth(monthData);
      setWeeks(weeksData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los datos del mes');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Crea una nueva semana
   */
  const handleCreateWeek = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monthId || !newWeekCredit.trim()) return;

    try {
      const creditAmount = parseFloat(newWeekCredit);
      if (isNaN(creditAmount) || creditAmount <= 0) {
        setError('El monto del crédito debe ser un número válido mayor a 0');
        return;
      }

      const nextWeekNumber = await WeeksService.getNextWeekNumber(monthId);
      const today = new Date();
      const startDate = new Date(today);
      const endDate = new Date(today);
      endDate.setDate(startDate.getDate() + 6);
      
      await WeeksService.create({
        month_id: monthId,
        week_number: nextWeekNumber,
        credit_amount: creditAmount,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      });
      
      setNewWeekCredit('');
      setShowCreateForm(false);
      await loadMonthData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la semana');
    }
  };

  /**
   * Elimina una semana
   */
  const handleDeleteWeek = async (weekId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta semana? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await WeeksService.delete(weekId);
      await loadMonthData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la semana');
    }
  };

  /**
   * Calcula los totales del mes
   */
  const totalCredit = weeks.reduce((sum, week) => sum + week.credit_amount, 0);
  const totalPaid = weeks.reduce((sum, week) => {
    const weekTotal = week.payments.reduce((weekSum, payment) => weekSum + payment.amount, 0);
    return sum + weekTotal;
  }, 0);
  const totalPending = totalCredit - totalPaid;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando detalle del mes...</p>
        </div>
      </div>
    );
  }

  if (!month) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Mes no encontrado</h2>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Volver
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {month.name} {month.year}
                </h1>
                <p className="mt-1 text-sm text-gray-500">Detalle semanal de créditos</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Semana
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { label: `${month.name} ${month.year}` }
          ]}
        />
        {/* Tarjetas de resumen del mes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Crédito Total</p>
                <p className="text-2xl font-bold text-gray-900">${totalCredit.toLocaleString()}</p>
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
                <p className="text-2xl font-bold text-green-600">${totalPaid.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pendiente</p>
                <p className="text-2xl font-bold text-orange-600">${totalPending.toLocaleString()}</p>
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

        {/* Lista de semanas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Semanas del Mes</h2>
          </div>
          
          {weeks.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay semanas registradas</h3>
              <p className="text-gray-500 mb-4">Comienza agregando la primera semana de este mes</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primera Semana
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {weeks.map((week) => {
                const porcentajePagado = week.credit_amount > 0 
                  ? (week.payments.reduce((sum, payment) => sum + payment.amount, 0) / week.credit_amount) * 100 
                  : 0;
                
                return (
                  <div key={week.id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/week/${week.id}`)}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-medium text-gray-900">
                            Semana {week.week_number}
                          </h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {week.payments.length} pagos
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Crédito Asignado</p>
                            <p className="text-lg font-semibold text-gray-900">
                              ${week.credit_amount.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Pagado</p>
                            <p className="text-lg font-semibold text-green-600">
                              ${week.payments.reduce((sum, payment) => sum + payment.amount, 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Pendiente</p>
                            <p className="text-lg font-semibold text-orange-600">
                              ${(week.credit_amount - week.payments.reduce((sum, payment) => sum + payment.amount, 0)).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        {/* Barra de progreso */}
                        <div className="mb-3">
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
                        
                        <p className="text-sm text-gray-500">
                          Creada el {new Date(week.created_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      
                      <div className="ml-6 flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/week/${week.id}`)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Ver Pagos
                        </button>
                        <button
                          onClick={() => handleDeleteWeek(week.id)}
                          className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal para crear nueva semana */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Agregar Nueva Semana</h3>
              <form onSubmit={handleCreateWeek}>
                <div className="mb-6">
                  <label htmlFor="weekCredit" className="block text-sm font-medium text-gray-700 mb-2">
                    Monto del Crédito
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      id="weekCredit"
                      value={newWeekCredit}
                      onChange={(e) => setNewWeekCredit(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Ingresa el monto de crédito asignado para esta semana
                  </p>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewWeekCredit('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Crear Semana
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