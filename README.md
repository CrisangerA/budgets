# Sistema de Gestión de Créditos

Aplicación web para la gestión y seguimiento de créditos que permite registrar información mensual y desglosarla por semanas, incluyendo gestión de proveedores y pagos.

## 🚀 Tecnologías

- **Frontend**: React 18 + TypeScript + Vite
- **Estilos**: Tailwind CSS
- **Iconos**: Heroicons
- **Backend**: Supabase (PostgreSQL)
- **Validación**: Zod
- **Enrutamiento**: React Router DOM
- **Estado**: Zustand

## 📋 Características

- ✅ Resumen mensual de créditos
- ✅ Desglose semanal por mes
- ✅ Gestión de proveedores
- ✅ Registro de pagos
- ✅ Navegación intuitiva
- ✅ Diseño responsive
- ✅ Interfaz basada en paneles/tarjetas

## 🛠️ Configuración

### 1. Instalación

```bash
pnpm install
```

### 2. Configuración de Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Copia el archivo `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

3. Completa las variables de entorno en `.env.local`:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

### 3. Configuración de la Base de Datos

Ejecuta los siguientes scripts SQL en tu proyecto de Supabase para crear las tablas necesarias:

```sql
-- Ver archivo: .trae/documents/technical_architecture_document.md
-- Sección: 6.2 Lenguaje de Definición de Datos
```

## 🚀 Desarrollo

```bash
# Iniciar servidor de desarrollo
pnpm dev

# Construir para producción
pnpm build

# Vista previa de la construcción
pnpm preview

# Verificar tipos
pnpm check

# Linting
pnpm lint
```

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
├── layouts/            # Layouts de la aplicación
├── pages/              # Páginas principales
├── services/           # Servicios para API/Supabase
├── types/              # Definiciones de tipos TypeScript
├── lib/                # Configuraciones y utilidades
├── hooks/              # Hooks personalizados
└── assets/             # Recursos estáticos
```

## 🎯 Rutas Principales

- `/` - Página principal (resumen mensual)
- `/month/:id` - Detalle semanal de un mes
- `/providers` - Gestión de proveedores
- `/payments` - Gestión de pagos

## 📚 Documentación

- [Requerimientos del Producto](.trae/documents/product_requirements_document.md)
- [Arquitectura Técnica](.trae/documents/technical_architecture_document.md)

## 🎨 Diseño

### Colores Principales
- **Azul**: `#3B82F6` (elementos principales)
- **Verde**: `#10B981` (acciones positivas)
- **Gris**: `#6B7280` (texto secundario)

### Fuentes
- **Principal**: Inter, system-ui, sans-serif

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.
