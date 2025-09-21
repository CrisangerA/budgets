import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Search, DollarSign, CreditCard, Calendar, ArrowLeft, Edit, Trash2, User } from 'lucide-react';
import { WeeksService } from '../services/weeksService';
import { PaymentsService } from '../services/paymentsService';
import { ProvidersService } from '../services/providersService';
import { Breadcrumbs } from '../components/Breadcrumbs';
import type { Week, PaymentWithDetails, Provider, CreatePaymentData, UpdatePaymentData } from '../types';

/**
 * Página de gestión de pagos por semana
 * Implementa RF-08 (registro de pagos) y RF-09 (cálculo de totales)
 */
export default function WeekDetail() {
  const { weekId } = useParams<{ weekId: string }>();
  const navigate = useNavigate();
  const [week, setWeek] = useState<Week | null>(null);
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentWithDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newPaymentAmount, setNewPaymentAmount] = useState('');
  const [newPaymentDescription, setNewPaymentDescription] = useState('');
  const [newPaymentProviderId, setNewPaymentProviderId] = useState('');
  const [newPaymentDate, setNewPaymentDate] = useState('');
  const [formData, setFormData] = useState<CreatePaymentData>({
    week_id: '',
    provider_id: '',
    amount: 0,
    payment_date: new Date().toISOString().split('T')[0],
    description: ''
  });

  /**
   * Carga los datos de la semana y sus pagos al montar el componente
   */
  useEffect(() => {
    if (weekId) {
      loadWeekData();
      loadProviders();
    }
  }, [weekId]);

  /**
   * Obtiene los datos de la semana y sus pagos
   */
  const loadWeekData = async () => {
    if (!weekId) return;

    try {
      setLoading(true);
      const [weekData, paymentsData] = await Promise.all([
        WeeksService.getById(weekId),
        PaymentsService.getWithDetails(weekId)
      ]);
      
      if (!weekData) {
        setError('Semana no encontrada');
        return;
      }
      
      setWeek(weekData);
      setPayments(paymentsData);
      setFormData(prev => ({ ...prev, week_id: weekId }));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los datos de la semana');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtiene la lista de proveedores activos
   */
  const loadProviders = async () => {
    try {
      const data = await ProvidersService.getActive();
      setProviders(data);
    } catch (err) {
      console.error('Error al cargar proveedores:', err);
    }
  };

  /**
   * Filtra pagos por término de búsqueda
   */
  const filteredPayments = payments.filter(payment =>
    payment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.provider?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * Maneja el envío del formulario de creación/edición
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.provider_id || formData.amount <= 0) {
      setError('Todos los campos son requeridos y el monto debe ser mayor a 0');
      return;
    }

    try {
      if (editingPayment) {
        const updateData: UpdatePaymentData = {
          provider_id: formData.provider_id,
          amount: formData.amount,
          description: formData.description
        };
        await PaymentsService.update(editingPayment.id, updateData);
      } else {
        await PaymentsService.create(formData);
      }
      
      resetForm();
      await loadWeekData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el pago');
    }
  };

  /**
   * Prepara el formulario para editar un pago
   */
  const handleEdit = (payment: PaymentWithDetails) => {
    setEditingPayment(payment);
    setFormData({
      week_id: payment.week_id,
      provider_id: payment.provider_id,
      amount: payment.amount,
      payment_date: payment.payment_date.split('T')[0],
      description: payment.description || ''
    });
    setShowCreateForm(true);
  };

  /**
   * Elimina un pago
   */
  const handleDelete = async (paymentId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este pago? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await PaymentsService.delete(paymentId);
      await loadWeekData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el pago');
    }
  };

  /**
   * Resetea el formulario y cierra el modal
   */
  const resetForm = () => {
    setFormData({
      week_id: weekId || '',
      provider_id: '',
      amount: 0,
      payment_date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setEditingPayment(null);
    setShowCreateForm(false);
    setError(null);
  };

  /**
   * Calcula los totales de la semana
   */
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingCredit = week ? week.credit_amount - totalPaid : 0;
  const progressPercentage = week && week.credit_amount > 0 
    ? (totalPaid / week.credit_amount) * 100 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando detalle de la semana...</p>
        </div>
      </div>
    );
  }

  if (!week) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Semana no encontrada</h2>
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
                onClick={() => navigate(-1)}
                className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Volver
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Semana {week.week_number}
                </h1>
                <p className="mt-1 text-sm text-gray-500">Gestión de pagos y créditos</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Pago
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { label: 'Mes', href: week?.month_id ? `/month/${week.month_id}` : undefined },
            { label: week ? `Semana ${week.week_number}` : 'Semana' }
          ]}
        />
        
        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Crédito Asignado</p>
                <p className="text-2xl font-bold text-gray-900">${week.credit_amount.toLocaleString()}</p>
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
                <p className="text-sm font-medium text-gray-500">Crédito Restante</p>
                <p className="text-2xl font-bold text-orange-600">${remainingCredit.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Progreso de pagos</span>
            <span>{progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-green-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {remainingCredit > 0 
              ? `Quedan $${remainingCredit.toLocaleString()} por asignar`
              : progressPercentage > 100 
                ? `Excedido por $${Math.abs(remainingCredit).toLocaleString()}`
                : 'Crédito completamente asignado'
            }
          </p>
        </div>

        {/* Barra de búsqueda */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Buscar pagos por descripción o proveedor..."
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Lista de pagos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Pagos Registrados ({filteredPayments.length})
            </h2>
          </div>
          
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No se encontraron pagos' : 'No hay pagos registrados'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Comienza registrando el primer pago de esta semana'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Primer Pago
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <div key={payment.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          ${payment.amount.toLocaleString()}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <User className="h-3 w-3 mr-1" />
                          {payment.provider?.name || 'Proveedor'}
                        </span>
                      </div>
                      
                      {payment.description && (
                        <p className="text-gray-600 mb-3">{payment.description}</p>
                      )}
                      
                      <p className="text-sm text-gray-500">
                        Registrado el {new Date(payment.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    
                    <div className="ml-6 flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(payment)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(payment.id)}
                        className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal para crear/editar pago */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingPayment ? 'Editar Pago' : 'Registrar Nuevo Pago'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="providerId" className="block text-sm font-medium text-gray-700 mb-2">
                    Proveedor *
                  </label>
                  <select
                    id="providerId"
                    value={formData.provider_id}
                    onChange={(e) => setFormData({ ...formData, provider_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Seleccionar proveedor</option>
                    {providers.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                    Monto *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      id="amount"
                      value={formData.amount || ''}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha del Pago *
                  </label>
                  <input
                    type="date"
                    id="paymentDate"
                    value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descripción del pago (opcional)..."
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {editingPayment ? 'Actualizar' : 'Registrar'} Pago
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