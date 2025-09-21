import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MonthDetail from './pages/MonthDetail';
import WeekDetail from './pages/WeekDetail';
import Providers from './pages/Providers';

/**
 * Componente principal de la aplicación
 * Configura las rutas principales del sistema de gestión de créditos
 */
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Página principal - Resumen mensual */}
          <Route path="/" element={<Home />} />
          
          {/* Detalle de mes - Vista semanal */}
          <Route path="/month/:monthId" element={<MonthDetail />} />
          
          {/* Detalle de semana - Gestión de pagos */}
          <Route path="/week/:weekId" element={<WeekDetail />} />
          
          {/* Gestión de proveedores */}
          <Route path="/providers" element={<Providers />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
