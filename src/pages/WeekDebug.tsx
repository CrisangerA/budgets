import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WeeksService } from '../services/weeksService';
import type { Week } from '../types';

/**
 * Componente de depuración para investigar el problema de navegación a semanas
 */
export default function WeekDebug() {
  const { weekId } = useParams<{ weekId: string }>();
  const navigate = useNavigate();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [week, setWeek] = useState<Week | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDebugData = async () => {
      setLoading(true);
      const info: any = {
        weekId,
        timestamp: new Date().toISOString(),
        urlParams: window.location.href,
        envVars: {
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
          hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
        }
      };

      if (weekId) {
        try {
          info.beforeQuery = 'Iniciando consulta WeeksService.getById';
          const weekData = await WeeksService.getById(weekId);
          info.queryResult = weekData;
          info.querySuccess = !!weekData;
          
          if (weekData) {
            setWeek(weekData);
            info.weekFound = true;
          } else {
            setError('Semana no encontrada');
            info.weekFound = false;
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
          setError(errorMsg);
          info.queryError = errorMsg;
          info.errorStack = err instanceof Error ? err.stack : 'No stack available';
        }
      } else {
        info.noWeekId = true;
      }

      setDebugInfo(info);
      setLoading(false);
    };

    loadDebugData();
  }, [weekId]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">🔍 Debug de Navegación a Semanas</h1>
          
          <div className="mb-6">
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              ← Volver al Inicio
            </button>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando información de depuración...</p>
            </div>
          )}

          {!loading && (
            <>
              <div className="bg-gray-100 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-semibold mb-3">📊 Información de Depuración</h2>
                <pre className="text-sm overflow-auto bg-white p-3 rounded border">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                  <h3 className="font-semibold">❌ Error Encontrado:</h3>
                  <p>{error}</p>
                </div>
              )}

              {week && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                  <h3 className="font-semibold">✅ Semana Encontrada:</h3>
                  <pre className="text-sm mt-2 bg-white p-3 rounded border">
                    {JSON.stringify(week, null, 2)}
                  </pre>
                </div>
              )}

              <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                <h3 className="font-semibold">💡 Instrucciones:</h3>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Esta página muestra información detallada sobre la consulta a la base de datos</li>
                  <li>Verifica que weekId esté presente en la URL</li>
                  <li>Revisa que las variables de entorno de Supabase estén configuradas</li>
                  <li>Comprueba si la consulta a la base de datos fue exitosa</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}