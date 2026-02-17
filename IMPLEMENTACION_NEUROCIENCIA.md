# 🧠 Plataforma de Tesis Doctoral en Neurociencia

## ✅ Cambios Implementados

### 1. **Página Principal Rediseñada** 
- ✨ Eliminados los cards de "Education" y "Virtual Board"
- 🎨 Card único de "Research" con diseño glassmorphism estilo Apple
- 🔮 Efectos visuales modernos: blur backdrop, gradientes, animaciones suaves
- 📱 Totalmente responsive y optimizado

### 2. **Sistema de Autenticación con Google OAuth**
- 🔐 Integración completa de NextAuth.js con Google
- 👤 Login/registro mediante cuenta de Google
- 🎭 Sistema de sesiones con JWT
- 🚪 Página de login personalizada con diseño glassmorphism

### 3. **Sistema de Aprobación de Usuarios**
- 📧 Email automático a la administradora cuando un nuevo usuario se registra
- ⏳ Estados de usuario: `pending`, `user`, `admin`
- ✅ Campo `approved` en el modelo de usuario
- 🔒 Acceso diferenciado según estado de aprobación

### 4. **Página de Research con Roles**
- 👁️ **Usuarios NO autenticados**: Pueden ver documentos públicos
- ⏱️ **Usuarios pendientes**: Acceso a documentos públicos + notificación de estado
- ✅ **Usuarios aprobados**: Acceso completo + asistente de IA
- 🔐 Indicadores visuales de contenido bloqueado/desbloqueado
- 📊 3 categorías de documentos (1 pública, 2 privadas)

### 5. **Asistente de IA para Investigación**
- 🤖 Chat integrado para usuarios aprobados
- 🧪 Especializado en metodología de investigación doctoral en neurociencia
- 💬 Interfaz de chat moderna con mensajes usuario/asistente
- 🌐 Soporte bilingüe (español/inglés)
- 📡 API endpoint preparado para integración con OpenAI/Anthropic

## 📁 Archivos Creados/Modificados

### Nuevos Archivos
```
src/
├── app/
│   └── api/
│       ├── auth/[...nextauth]/route.ts     # NextAuth configuration
│       └── ai-assistant/route.ts            # AI assistant endpoint
├── components/
│   └── SessionProvider.tsx                  # Session wrapper
├── types/
│   └── next-auth.d.ts                       # NextAuth types
└── mongoDB/models/
    └── users.ts                             # Updated user model

.env.example                                  # Environment variables template
GOOGLE_AUTH_SETUP.md                         # Setup instructions
```

### Archivos Modificados
```
src/app/
├── page.tsx                    # Redesigned homepage
├── layout.tsx                  # Added SessionProvider
├── research/page.tsx           # Added auth, roles, AI chat
└── sign-in/[[...sign-in]]/page.tsx  # Google OAuth page
```

## 🚀 Configuración Requerida

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=genera-un-secret-seguro-con-el-comando-abajo

# Google OAuth (obtener de Google Cloud Console)
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret

# MongoDB
MONGODB_URI=tu-mongodb-uri

# Admin Email
ADMIN_EMAIL=candegherardi@gmail.com

# Email Configuration (para notificaciones)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password
EMAIL_FROM=tu-email@gmail.com

# Optional: OpenAI (para el asistente de IA)
OPENAI_API_KEY=sk-tu-api-key
```

### 2. Generar NEXTAUTH_SECRET

```bash
# Usando OpenSSL
openssl rand -base64 32

# O usando Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Configurar Google OAuth

Sigue las instrucciones detalladas en [GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md)

Resumen rápido:
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto o usa uno existente
3. Configura OAuth Consent Screen
4. Crea credenciales OAuth 2.0
5. Añade las URIs autorizadas:
   - `http://localhost:3000/api/auth/callback/google` (desarrollo)
   - `https://tu-dominio.com/api/auth/callback/google` (producción)

### 4. Configurar Email

Para Gmail:
1. Habilita la autenticación de 2 factores
2. Genera una "App Password" en tu cuenta de Google
3. Usa esa password en `EMAIL_PASSWORD`

## 🎯 Flujo de Usuario

### Usuario Nuevo (No Autenticado)
1. Visita la página principal → Ve el card de Research
2. Click en "Acceder al espacio" → Redirige a `/research`
3. En `/research` → Ve documentos públicos + mensaje "Inicia sesión"
4. Click en "Iniciar sesión" → Página de login con Google
5. Autoriza con Google → Se crea cuenta con `approved: false`
6. Email enviado a la administradora
7. Redirigido a `/research` con acceso limitado

### Usuario Pendiente de Aprobación
- Badge: "Pendiente de aprobación"
- Acceso: Solo documentos públicos
- No puede usar el asistente de IA

### Usuario Aprobado
- Sin badge de restricción
- Acceso: Todos los documentos
- Puede usar el asistente de IA
- Dashboard completo

### Administradora
1. Recibe email cuando hay nuevo registro
2. Accede a MongoDB o panel de admin (por crear)
3. Aprueba o rechaza usuario:
```javascript
// En MongoDB
db.users.updateOne(
  { email: "usuario@ejemplo.com" },
  { $set: { approved: true, role: "user" } }
)
```

## 🔧 Próximos Pasos Sugeridos

### Desarrollo Inmediato
1. **Configurar variables de entorno** en `.env.local`
2. **Obtener credenciales de Google OAuth**
3. **Probar el flujo de autenticación**

### Mejoras Futuras
1. **Panel de Administración**
   - Interfaz para aprobar/rechazar usuarios
   - Ver lista de usuarios pendientes
   - Gestión de roles

2. **Integrar IA Real**
   - Conectar con OpenAI API o Claude
   - Implementar context retention en el chat
   - Añadir análisis de documentos

3. **Sistema de Documentos**
   - Upload de PDFs/documentos
   - Categorización avanzada
   - Búsqueda y filtrado

4. **Notificaciones**
   - Email cuando usuario es aprobado
   - Notificaciones en tiempo real
   - Sistema de mensajería

5. **Analytics**
   - Tracking de uso del asistente
   - Estadísticas de usuarios
   - Métricas de investigación

## 🧪 Testing

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Visitar
# - Página principal: http://localhost:3000
# - Research: http://localhost:3000/research
# - Login: http://localhost:3000/sign-in
```

## 📝 Notas Importantes

1. **Seguridad**
   - Nunca commitear `.env.local` al repositorio
   - Mantener `NEXTAUTH_SECRET` seguro
   - Rotar las API keys regularmente

2. **Base de Datos**
   - El modelo de usuario ha cambiado
   - Usuarios antiguos de Clerk pueden coexistir
   - Considera migración si es necesario

3. **Email**
   - Configura correctamente el SMTP para notificaciones
   - Prueba el envío de emails en desarrollo

4. **Asistente de IA**
   - Actualmente usa respuestas simuladas
   - Descomentar código en `/api/ai-assistant/route.ts` para OpenAI
   - Añadir rate limiting en producción

## 🆘 Troubleshooting

### Error de autenticación
- Verifica que las URIs en Google Cloud coincidan exactamente
- Revisa que `NEXTAUTH_URL` sea correcta
- Confirma que `NEXTAUTH_SECRET` esté configurado

### Error de base de datos
- Verifica `MONGODB_URI`
- Asegúrate de que IP esté en whitelist (si usas Atlas)
- Revisa que el modelo de usuario esté actualizado

### Email no se envía
- Verifica configuración SMTP
- Para Gmail, usa App Password, no password normal
- Revisa logs en la consola

## 📊 Estado del Proyecto

✅ Página principal rediseñada
✅ Autenticación con Google
✅ Sistema de aprobación de usuarios
✅ Roles y permisos
✅ Asistente de IA (estructura lista)
⏳ Panel de administración (pendiente)
⏳ Integración real de IA (pendiente)
⏳ Sistema completo de documentos (pendiente)

## 🎨 Diseño

El diseño sigue principios de:
- **Glassmorphism**: Efectos de cristal con backdrop-blur
- **Apple-like**: Limpio, espacioso, elegante
- **Responsive**: Funciona en todos los dispositivos
- **Accesible**: Contraste adecuado, navegación clara

---

**Desarrollado para**: Plataforma de Tesis Doctoral en Neurociencia  
**Tecnologías**: Next.js 15, NextAuth.js, MongoDB, Tailwind CSS, Framer Motion  
**Fecha**: Febrero 2026
