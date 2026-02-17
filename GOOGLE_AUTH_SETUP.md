# Configuración de Autenticación con Google OAuth

## Pasos para configurar Google OAuth

### 1. Crear un Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Navega a "APIs & Services" > "Credentials"

### 2. Configurar OAuth Consent Screen

1. En el menú lateral, selecciona "OAuth consent screen"
2. Elige "External" como tipo de usuario
3. Completa la información requerida:
   - **App name**: Neurociencia Doctoral Platform
   - **User support email**: Tu email
   - **Developer contact email**: Tu email
4. Guarda y continúa

### 3. Crear Credenciales OAuth

1. Ve a "Credentials" > "Create Credentials" > "OAuth client ID"
2. Selecciona "Web application"
3. Configura:
   - **Name**: Neurociencia Doctoral
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (desarrollo)
     - Tu dominio de producción (ej: `https://tudomain.com`)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (desarrollo)
     - `https://tudomain.com/api/auth/callback/google` (producción)
4. Haz clic en "Create"

### 4. Copiar Credenciales

Después de crear las credenciales, Google te mostrará:
- **Client ID**: Copia esto a `GOOGLE_CLIENT_ID` en tu `.env.local`
- **Client Secret**: Copia esto a `GOOGLE_CLIENT_SECRET` en tu `.env.local`

### 5. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=genera-un-secret-seguro-aqui

# Google OAuth
GOOGLE_CLIENT_ID=tu-client-id-de-google.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret-de-google

# MongoDB
MONGODB_URI=tu-mongodb-connection-string

# Admin Email
ADMIN_EMAIL=candegherardi@gmail.com
```

### 6. Generar NEXTAUTH_SECRET

Puedes generar un secret seguro ejecutando:

```bash
openssl rand -base64 32
```

O en Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 7. Configurar MongoDB

Asegúrate de tener una base de datos MongoDB configurada. Puedes usar:
- MongoDB Atlas (cloud)
- MongoDB local

La URI debería verse así:
```
mongodb+srv://usuario:password@cluster.mongodb.net/nombre-base-datos
```

## Flujo de Autenticación

1. **Usuario no registrado**: Al iniciar sesión por primera vez:
   - Se crea un usuario con `approved: false`
   - Se envía un email a la administradora
   - El usuario puede ver documentos públicos

2. **Aprobación pendiente**: 
   - El usuario ve un badge "Pendiente de aprobación"
   - Acceso limitado a recursos públicos

3. **Usuario aprobado**:
   - Acceso completo a todos los documentos
   - Puede usar el asistente de IA
   - Dashboard completo de research

## Gestión de Usuarios

Para aprobar usuarios, necesitarás crear un panel de administración o aprobar manualmente en MongoDB:

```javascript
db.users.updateOne(
  { email: "usuario@ejemplo.com" },
  { $set: { approved: true, role: "user" } }
)
```

## Integración del Asistente de IA

El asistente de IA actualmente tiene una respuesta simulada. Para integrarlo con OpenAI:

1. Obtén una API key de [OpenAI](https://platform.openai.com/)
2. Añade a `.env.local`:
   ```
   OPENAI_API_KEY=sk-tu-api-key
   ```
3. Descomenta el código de integración en `/api/ai-assistant/route.ts`

## Testing

Para probar localmente:

```bash
npm run dev
```

Visita:
- Página principal: `http://localhost:3000`
- Login: `http://localhost:3000/sign-in`
- Research: `http://localhost:3000/research`

## Producción

Antes de desplegar:

1. Actualiza las URIs autorizadas en Google Cloud Console
2. Actualiza `NEXTAUTH_URL` con tu dominio de producción
3. Asegúrate de que todas las variables de entorno estén configuradas en tu plataforma de hosting (Vercel, Railway, etc.)
