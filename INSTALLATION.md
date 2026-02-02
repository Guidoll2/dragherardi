# 🚀 Instalación y Despliegue - Portal de Educación

## 📋 Pre-requisitos

- Node.js 18+ instalado
- Cuenta en MongoDB Atlas (o servidor MongoDB)
- Cuenta en Clerk para autenticación
- Cuenta en Vercel (para deploy)

---

## 🔧 Instalación Local

### 1. Clonar el repositorio
```bash
git clone <tu-repo>
cd dragherardi
```

### 2. Instalar dependencias
```bash
npm install
```

Las dependencias ya están en `package.json`, incluyendo:
- Next.js 15
- Clerk
- MongoDB/Mongoose
- Framer Motion
- Lucide React
- Tailwind CSS

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# URLs de Clerk
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/education
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/education

# MongoDB
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority

# SendGrid (opcional, para emails)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@tudominio.com

# URL del sitio (para producción)
NEXT_PUBLIC_SITE_URL=https://tudominio.com
```

### 4. Obtener credenciales de Clerk

1. Ve a [clerk.com](https://clerk.com)
2. Crea una cuenta o inicia sesión
3. Crea una nueva aplicación
4. Ve a "API Keys"
5. Copia las keys y pégalas en `.env.local`

### 5. Configurar MongoDB Atlas

1. Ve a [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Crea una cuenta gratuita
3. Crea un nuevo cluster (tier gratuito)
4. En "Database Access", crea un usuario con password
5. En "Network Access", añade tu IP (o 0.0.0.0/0 para desarrollo)
6. Haz clic en "Connect" → "Connect your application"
7. Copia el connection string
8. Reemplaza `<password>` con tu password
9. Pégalo en `MONGODB_URI` en `.env.local`

### 6. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 🌐 Despliegue en Vercel

### Opción 1: Deploy automático desde GitHub

1. Push tu código a GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Conecta tu cuenta de GitHub
4. Selecciona tu repositorio
5. Haz clic en "Import"
6. Agrega las variables de entorno (desde `.env.local`)
7. Haz clic en "Deploy"

### Opción 2: Deploy con Vercel CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Para producción
vercel --prod
```

### Configurar variables de entorno en Vercel

1. En el dashboard de Vercel, ve a tu proyecto
2. Settings → Environment Variables
3. Agrega todas las variables de `.env.local`
4. Redeploy si es necesario

---

## 🔒 Seguridad

### Variables de entorno
- ❌ NUNCA subas `.env.local` a GitHub
- ✅ Añade `.env.local` a `.gitignore` (ya está)
- ✅ Usa diferentes keys para desarrollo y producción

### Clerk Settings (Producción)

1. En Clerk Dashboard, ve a tu aplicación
2. **Allowed Origins**: Añade tu dominio de producción
3. **Allowed Redirect URLs**: 
   - `https://tudominio.com/sign-in`
   - `https://tudominio.com/sign-up`
   - `https://tudominio.com/education`

### MongoDB Atlas (Producción)

1. En Network Access, remueve `0.0.0.0/0`
2. Añade solo las IPs de Vercel
3. Usa un usuario de DB con permisos mínimos necesarios

---

## 🧪 Testing

### Verificar instalación

```bash
# Build del proyecto
npm run build

# Verificar que no hay errores de TypeScript
npm run lint
```

### Test manual

1. ✅ Página principal carga correctamente
2. ✅ Card "Educación remota" visible
3. ✅ Click en "Educación remota" redirige a `/education`
4. ✅ Sistema de login de Clerk funciona
5. ✅ Admin login con `candegherardi@gmail.com` → Dashboard admin
6. ✅ Otro usuario → Dashboard estudiante

### Test de funcionalidades

**Como Admin:**
1. ✅ Crear aula
2. ✅ Subir material (cada tipo)
3. ✅ Programar sesión
4. ✅ Iniciar sesión en vivo
5. ✅ Enviar mensaje en chat

**Como Estudiante:**
1. ✅ Ver aulas disponibles
2. ✅ Acceder a materiales
3. ✅ Ver sesiones programadas
4. ✅ Unirse a sesión en vivo
5. ✅ Enviar mensaje en chat

---

## 🐛 Troubleshooting

### Error: "Cannot connect to MongoDB"
- Verifica que `MONGODB_URI` esté correcta
- Confirma que tu IP está en Network Access
- Revisa que el usuario de DB tiene permisos

### Error: "Clerk is not defined"
- Verifica que las keys de Clerk estén en `.env.local`
- Reinicia el servidor de desarrollo
- Limpia cache: `rm -rf .next`

### Error: "Module not found"
- Reinstala dependencias: `rm -rf node_modules && npm install`
- Verifica que la importación sea correcta

### Error: Build failed en Vercel
- Revisa los logs de build en Vercel
- Verifica que todas las variables de entorno estén configuradas
- Asegúrate de que no hay errores de TypeScript

### Chat no actualiza en tiempo real
- El sistema usa polling cada 3 segundos (no WebSockets)
- Para tiempo real verdadero, implementar Socket.io

---

## 📊 Monitoring y Mantenimiento

### Logs en Vercel
- Ve a tu proyecto → Functions
- Revisa logs de errores
- Monitorea uso de recursos

### MongoDB Atlas
- Revisa métricas en el dashboard
- Monitorea espacio usado
- Configura alertas

### Clerk
- Revisa usuarios activos
- Monitorea intentos de login
- Configura 2FA si es necesario

---

## 🔄 Actualizaciones

### Para actualizar en producción:

```bash
# 1. Hacer cambios en local
# 2. Commit
git add .
git commit -m "Descripción de cambios"

# 3. Push (deploy automático si está configurado)
git push origin main
```

### Rollback si algo falla:

1. En Vercel Dashboard → Deployments
2. Encuentra el deployment anterior que funcionaba
3. Haz clic en "..." → "Promote to Production"

---

## 📞 Soporte

### Recursos:
- [Documentación Next.js](https://nextjs.org/docs)
- [Documentación Clerk](https://clerk.com/docs)
- [Documentación MongoDB](https://docs.mongodb.com)
- [Documentación Vercel](https://vercel.com/docs)

### Archivos de ayuda:
- `EDUCATION_PORTAL.md` - Documentación técnica
- `QUICKSTART_GUIDE.md` - Guía de uso para la Dra. Gherardi
- `IMPLEMENTATION_SUMMARY.md` - Resumen de implementación

---

## ✅ Checklist Pre-Deploy

- [ ] Todas las variables de entorno configuradas
- [ ] MongoDB Atlas configurado y conectado
- [ ] Clerk configurado con dominios correctos
- [ ] Build local exitoso (`npm run build`)
- [ ] No hay errores de TypeScript
- [ ] Testing manual completado
- [ ] `.env.local` en `.gitignore`
- [ ] Código pusheado a GitHub
- [ ] Deploy en Vercel exitoso
- [ ] URL de producción funcionando
- [ ] Login de admin probado
- [ ] Login de estudiante probado

---

## 🎉 ¡Listo!

Tu portal de educación está instalado y desplegado correctamente.

**Siguiente paso**: Comparte el link con la Dra. Gherardi y estudiantes.

---

**¿Necesitas ayuda?** Consulta los archivos de documentación o revisa los logs de error.
