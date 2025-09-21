import { useState, useEffect } from 'react';
import { Plus, Search, Building2, Users, ToggleLeft, ToggleRight, Edit, Trash2, TrendingUp } from 'lucide-react';
import { ProvidersService } from '../services/providersService';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Header } from '../components/Header';
import type { ProviderWithStats, CreateProviderData, UpdateProviderData } from '../types';

/**
 * Página de gestión de proveedores
 * Implementa RF-06 (gestión de proveedores) y RF-07 (asociación con créditos)
 */
export default function Providers() {
  const [providers, setProviders] = useState<ProviderWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ProviderWithStats | null>(null);
  const [formData, setFormData] = useState<CreateProviderData>({
    name: '',
    description: '',
    is_active: true
  });

  /**
   * Carga la lista de proveedores al montar el componente
   */
  useEffect(() => {
    loadProviders();
  }, []);

  /**
   * Obtiene todos los proveedores con estadísticas
   */
  const loadProviders = async () => {
    try {
      setLoading(true);
      const data = await ProvidersService.getWithStats();
      setProviders(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los proveedores');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filtra proveedores por término de búsqueda
   */
  const filteredProviders = providers.filter(provider =>
    provider.provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (provider.provider.description && provider.provider.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  /**
   * Maneja el envío del formulario de creación/edición
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('El nombre del proveedor es requerido');
      return;
    }

    try {
      if (editingProvider) {
        const updateData: UpdateProviderData = {
          name: formData.name,
          description: formData.description || null
        };
        await ProvidersService.update(editingProvider.provider.id, updateData);
      } else {
        await ProvidersService.create(formData);
      }
      
      resetForm();
      await loadProviders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el proveedor');
    }
  };

  /**
   * Prepara el formulario para editar un proveedor
   */
  const handleEdit = (provider: ProviderWithStats) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.provider.name,
      description: provider.provider.description || '',
      is_active: provider.provider.is_active
    });
    setShowCreateForm(true);
  };

  /**
   * Elimina un proveedor
   */
  const handleDelete = async (providerId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este proveedor? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await ProvidersService.delete(providerId);
      await loadProviders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el proveedor');
    }
  };

  /**
   * Alterna el estado activo/inactivo de un proveedor
   */
  const handleToggleActive = async (providerId: string) => {
    try {
      const provider = providers.find(p => p.provider.id === providerId);
      if (provider) {
        await ProvidersService.toggleActive(providerId, !provider.provider.is_active);
      }
      await loadProviders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar el estado del proveedor');
    }
  };

  /**
   * Resetea el formulario y cierra el modal
   */
  const resetForm = () => {
    setFormData({ name: '', description: '', is_active: true });
    setEditingProvider(null);
    setShowCreateForm(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando proveedores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Breadcrumbs 
          items={[
            { label: 'Proveedores' }
          ]}
        />
      </div>

      {/* Header */}
      <Header
        title="Gestión de Proveedores"
        subtitle="Administra los proveedores y sus asociaciones con créditos"
        actions={[
          {
            label: 'Agregar Proveedor',
            icon: Plus,
            onClick: () => setShowCreateForm(true),
            variant: 'primary'
          }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              placeholder="Buscar proveedores por nombre o descripción..."
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Lista de proveedores */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Proveedores ({filteredProviders.length})
            </h2>
          </div>
          
          {filteredProviders.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No se encontraron proveedores' : 'No hay proveedores registrados'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Comienza agregando tu primer proveedor'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Primer Proveedor
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredProviders.map((provider) => (
                <div key={provider.provider.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {provider.provider.name}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          provider.provider.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {provider.provider.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                        {provider.total_payments > 0 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {provider.payments_count} pagos
                          </span>
                        )}
                      </div>
                      
                      {provider.provider.description && (
                        <p className="text-gray-600 mb-3">{provider.provider.description}</p>
                      )}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-500">Total Pagos</p>
                          <p className="text-lg font-semibold text-gray-900">
                            ${provider.total_payments.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Cantidad de Pagos</p>
                          <p className="text-lg font-semibold text-blue-600">
                            {provider.payments_count}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Último Pago</p>
                          <p className="text-sm text-gray-900">
                            {provider.last_payment_date 
                              ? new Date(provider.last_payment_date).toLocaleDateString('es-ES')
                              : 'Sin pagos'
                            }
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-500">
                        Creado el {new Date(provider.provider.created_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    
                    <div className="ml-6 flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleActive(provider.provider.id)}
                        className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                          provider.provider.is_active
                            ? 'border-orange-300 text-orange-700 bg-white hover:bg-orange-50 focus:ring-orange-500'
                            : 'border-green-300 text-green-700 bg-white hover:bg-green-50 focus:ring-green-500'
                        }`}
                        title={provider.provider.is_active ? 'Desactivar proveedor' : 'Activar proveedor'}
                      >
                        {provider.provider.is_active ? (
                          <ToggleRight className="h-4 w-4" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(provider)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(provider.provider.id)}
                        className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        disabled={provider.payments_count > 0}
                        title={provider.payments_count > 0 ? 'No se puede eliminar un proveedor con pagos asociados' : 'Eliminar proveedor'}
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

      {/* Modal para crear/editar proveedor */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingProvider ? 'Editar Proveedor' : 'Agregar Nuevo Proveedor'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="providerName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Proveedor *
                  </label>
                  <input
                    type="text"
                    id="providerName"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Supermercado ABC"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="providerDescription" className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción (Opcional)
                  </label>
                  <textarea
                    id="providerDescription"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descripción del proveedor o tipo de servicios..."
                  />
                </div>
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Proveedor activo</span>
                  </label>
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
                    {editingProvider ? 'Actualizar' : 'Crear'} Proveedor
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