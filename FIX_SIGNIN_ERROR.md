# 🔧 Solución Rápida - Error 404 en Sign-In

## ❌ Error Actual
```
GET /sign-in?redirect=%2Feducation 404
```

## ✅ Solución Implementada

He creado las páginas de autenticación necesarias:
- ✅ `/sign-in/[[...sign-in]]/page.tsx`
- ✅ `/sign-up/[[...sign-up]]/page.tsx`
- ✅ Middleware actualizado con protección de rutas

## 🔑 Configuración de Clerk (REQUERIDO)

### Paso 1: Crear cuenta en Clerk

1. Ve a [clerk.com](https://clerk.com)
2. Crea una cuenta gratuita
3. Crea una nueva aplicación

### Paso 2: Obtener las API Keys

1. En tu dashboard de Clerk, ve a **API Keys**
2. Copia el **Publishable Key** (comienza con `pk_test_`)
3. Copia el **Secret Key** (comienza con `sk_test_`)

### Paso 3: Crear archivo `.env.local`

Crea un archivo llamado `.env.local` en la raíz del proyecto con este contenido:

```env
# Clerk Keys (REEMPLAZA CON TUS KEYS REALES)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_TU_KEY_AQUI
CLERK_SECRET_KEY=sk_test_TU_KEY_AQUI

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/education
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/education

# MongoDB (si aún no lo tienes)
MONGODB_URI=tu_conexion_mongodb_aqui

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Paso 4: Configurar URLs en Clerk Dashboard

En tu dashboard de Clerk:

1. Ve a **Configure** → **Paths**
2. Configura:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/education`
   - After sign-up URL: `/education`

3. Ve a **Configure** → **Allowed Origins**
4. Añade: `http://localhost:3000`

### Paso 5: Reiniciar el servidor

```bash
# Detén el servidor (Ctrl+C)
# Reinicia
npm run dev
```

## 🧪 Verificar que funciona

1. Ve a `http://localhost:3000`
2. Haz clic en **"Educación remota"**
3. Deberías ver la página de login de Clerk
4. Crea una cuenta de prueba
5. Serás redirigido a `/education`

## 📧 Configurar Email de Admin

Para que `candegherardi@gmail.com` sea admin:

1. Registra esa cuenta en Clerk
2. O crea cualquier cuenta primero para probar
3. La lógica ya detecta automáticamente el rol por email

## 🐛 Si sigue sin funcionar

### Verifica las variables de entorno:
```bash
# En la terminal
echo $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
```

### Revisa los logs:
- Busca mensajes de error en la consola
- Verifica que las keys comiencen con `pk_test_` y `sk_test_`

### Limpia cache:
```bash
rm -rf .next
npm run dev
```

## 📚 Documentación

Para más información:
- [Clerk Next.js Quickstart](https://clerk.com/docs/quickstarts/nextjs)
- Ver archivo `INSTALLATION.md` en este proyecto

---

## ✅ Checklist Rápido

- [ ] Cuenta en Clerk creada
- [ ] Keys copiadas
- [ ] Archivo `.env.local` creado
- [ ] Keys pegadas en `.env.local`
- [ ] URLs configuradas en Clerk dashboard
- [ ] Servidor reiniciado
- [ ] Login funciona
- [ ] Redirección a `/education` funciona

---

**Una vez completados estos pasos, el portal funcionará perfectamente.** 🎓
