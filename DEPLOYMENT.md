# 🚀 Guía de Despliegue - Sistema de Gestión de Créditos

Esta guía te ayudará a desplegar el sistema de gestión de créditos en diferentes plataformas de hosting.

## 📋 Prerrequisitos

### 1. Configuración de Supabase
Antes de desplegar, necesitas tener un proyecto de Supabase configurado:

1. Crea una cuenta en [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Ejecuta las migraciones de la base de datos:
   - Ve a SQL Editor en tu dashboard de Supabase
   - Ejecuta el contenido de `supabase/migrations/001_create_tables.sql`
   - Ejecuta el contenido de `supabase/migrations/002_add_mock_data.sql`
4. Obtén las credenciales de tu proyecto:
   - `VITE_SUPABASE_URL`: URL de tu proyecto
   - `VITE_SUPABASE_ANON_KEY`: Clave anónima pública

### 2. Variables de Entorno
El proyecto requiere las siguientes variables de entorno:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

## 🌐 Opciones de Despliegue

### 1. Vercel (Recomendado)

#### Despliegue Automático desde GitHub
1. Conecta tu repositorio a [Vercel](https://vercel.com)
2. Importa tu proyecto desde GitHub
3. Configura las variables de entorno en el dashboard de Vercel:
   - Ve a Settings → Environment Variables
   - Añade `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
4. Vercel detectará automáticamente la configuración de `vercel.json`
5. El despliegue se realizará automáticamente

#### Despliegue Manual con CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Hacer login
vercel login

# Desplegar
pnpm run deploy:vercel
```

### 2. Netlify

#### Despliegue Automático desde GitHub
1. Conecta tu repositorio a [Netlify](https://netlify.com)
2. Configura el build:
   - Build command: `pnpm run build`
   - Publish directory: `dist`
3. Configura las variables de entorno en Site settings → Environment variables
4. Netlify usará automáticamente la configuración de `netlify.toml`

#### Despliegue Manual con CLI
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Hacer login
netlify login

# Construir el proyecto
pnpm run build

# Desplegar
pnpm run deploy:netlify
```

### 3. GitHub Pages

#### Configuración Automática
1. Ve a Settings → Pages en tu repositorio de GitHub
2. Selecciona "GitHub Actions" como source
3. El workflow en `.github/workflows/deploy.yml` se ejecutará automáticamente
4. Configura los secrets del repositorio:
   - Ve a Settings → Secrets and variables → Actions
   - Añade `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`

#### Despliegue Manual
```bash
# Instalar gh-pages
npm install -g gh-pages

# Construir el proyecto
pnpm run build

# Desplegar
pnpm run deploy:gh-pages
```

### 4. Otros Proveedores

El proyecto también es compatible con:
- **Firebase Hosting**: Usa `firebase deploy` después de configurar `firebase.json`
- **AWS S3 + CloudFront**: Sube la carpeta `dist` a S3 y configura CloudFront
- **DigitalOcean App Platform**: Conecta desde GitHub con build command `pnpm run build`

## 🔧 Configuración Avanzada

### Configuración de Dominio Personalizado

#### Vercel
1. Ve a Settings → Domains en tu proyecto
2. Añade tu dominio personalizado
3. Configura los registros DNS según las instrucciones

#### Netlify
1. Ve a Site settings → Domain management
2. Añade tu dominio personalizado
3. Configura los registros DNS

### Optimización de Performance

El proyecto ya incluye optimizaciones:
- **Code splitting** automático con Vite
- **Cache headers** para assets estáticos
- **Compresión gzip** habilitada
- **Source maps** ocultos en producción

## 🐛 Solución de Problemas

### Error: "Failed to fetch"
- **Causa**: Variables de entorno de Supabase no configuradas
- **Solución**: Verifica que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén configuradas correctamente

### Error: "404 Not Found" en rutas
- **Causa**: Configuración de SPA no habilitada
- **Solución**: Verifica que los redirects estén configurados (incluidos en `vercel.json` y `netlify.toml`)

### Error de Build: "Module not found"
- **Causa**: Dependencias no instaladas correctamente
- **Solución**: 
  ```bash
  rm -rf node_modules pnpm-lock.yaml
  pnpm install
  pnpm run build
  ```

### Error: "Permission denied for table"
- **Causa**: Políticas RLS no configuradas en Supabase
- **Solución**: Ejecuta las migraciones SQL que incluyen las políticas RLS

### Performance Issues
- **Causa**: Bundle size muy grande
- **Solución**: 
  ```bash
  # Analizar bundle
  pnpm run build
  npx vite-bundle-analyzer dist
  ```

## 📊 Monitoreo y Analytics

### Vercel Analytics
```bash
npm install @vercel/analytics
```

Añade en `src/main.tsx`:
```typescript
import { inject } from '@vercel/analytics';
inject();
```

### Google Analytics
1. Crea una propiedad en Google Analytics
2. Añade el tracking ID como variable de entorno
3. Instala `gtag` o usa un hook personalizado

## 🔒 Seguridad

### Headers de Seguridad
Los archivos de configuración incluyen headers de seguridad:
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Variables de Entorno
- ✅ **Nunca** commitees archivos `.env` con credenciales reales
- ✅ Usa variables de entorno específicas de cada plataforma
- ✅ Las claves `VITE_*` son públicas y seguras para el frontend

## 📝 Checklist de Despliegue

- [ ] ✅ Proyecto construye sin errores (`pnpm run build`)
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Base de datos Supabase configurada y migrada
- [ ] ✅ Dominio personalizado configurado (opcional)
- [ ] ✅ SSL/HTTPS habilitado
- [ ] ✅ Redirects para SPA configurados
- [ ] ✅ Headers de cache configurados
- [ ] ✅ Monitoreo configurado (opcional)

## 🆘 Soporte

Si encuentras problemas durante el despliegue:

1. Revisa los logs de build en tu plataforma de hosting
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de que la base de datos Supabase esté accesible
4. Consulta la documentación específica de tu plataforma de hosting

---

**¡Felicidades! 🎉** Tu sistema de gestión de créditos está listo para producción.

Para más información, consulta:
- [Documentación de Vite](https://vitejs.dev/guide/)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de React Router](https://reactrouter.com/)