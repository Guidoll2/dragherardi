# Portal de Educación Remota - Dra. Gherardi

## 🎓 Descripción General

Este portal ha sido transformado de un sitio de investigación a una plataforma completa de educación remota para estudiantes universitarios en áreas de medicina y ciencias de la salud.

## ✨ Características Principales

### Para la Administradora (Dra. Gherardi)
- **Dashboard Completo**: Gestión centralizada de todas las aulas virtuales
- **Creación de Aulas**: Sistema para crear y organizar aulas por temas
- **Gestión de Contenido**: Subir múltiples tipos de materiales educativos:
  - Texto plano
  - Archivos PDF
  - Documentos Word
  - Hojas de cálculo Excel
  - Presentaciones PowerPoint
  - Links de Google Drive
  - Enlaces externos
- **Sesiones en Vivo**: Programar y gestionar clases virtuales
- **Chat Interno**: Sistema de mensajería para interactuar con estudiantes durante las clases
- **Control de Stream**: Configurar URLs de Zoom u otros servicios de videoconferencia

### Para Estudiantes
- **Exploración de Aulas**: Navegar aulas disponibles y ver contenido
- **Acceso a Materiales**: Descargar y visualizar contenido educativo
- **Clases en Vivo**: Unirse a sesiones de video en tiempo real
- **Chat Interactivo**: Hacer preguntas durante las clases
- **Progreso Personal**: (Preparado para futuras mejoras)

## 🔐 Sistema de Autenticación

### Detección Automática de Roles
El sistema utiliza Clerk para autenticación y detecta automáticamente el rol del usuario:

- **Administradora**: `candegherardi@gmail.com`
  - Acceso completo al dashboard de administración
  - Crear aulas, subir contenido, gestionar sesiones
  
- **Estudiantes**: Cualquier otro usuario autenticado
  - Ver aulas disponibles
  - Acceder a materiales
  - Participar en sesiones en vivo

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── education/
│   │   ├── page.tsx                    # Punto de entrada - detecta rol
│   │   ├── admin/
│   │   │   ├── page.tsx                # Dashboard de administradora
│   │   │   ├── classroom/[id]/         # Gestión de aula individual
│   │   │   └── session/[id]/           # Control de sesión en vivo
│   │   └── student/
│   │       ├── page.tsx                # Dashboard de estudiante
│   │       ├── classroom/[id]/         # Vista de aula para estudiante
│   │       └── session/[id]/           # Participar en sesión en vivo
│   └── api/education/
│       ├── role/                       # Obtener rol del usuario
│       ├── classrooms/                 # CRUD de aulas
│       ├── materials/                  # CRUD de materiales
│       ├── sessions/                   # CRUD de sesiones
│       └── chat/                       # Sistema de mensajería
├── lib/utils/
│   └── auth.ts                         # Utilidades de autenticación
├── mongoDB/models/
│   ├── classroom.ts                    # Modelo de aulas
│   ├── educationalMaterial.ts          # Modelo de materiales
│   ├── liveSession.ts                  # Modelo de sesiones
│   └── chatMessage.ts                  # Modelo de mensajes
└── types/
    └── education.ts                    # Tipos TypeScript
```

## 🚀 Flujos de Trabajo

### Flujo de Administradora
1. Login con `candegherardi@gmail.com`
2. Redirigida a `/education/admin`
3. Crear nueva aula virtual
4. Subir materiales educativos (PDFs, documentos, links, etc.)
5. Programar sesiones en vivo
6. Iniciar sesión y gestionar chat en tiempo real

### Flujo de Estudiante
1. Login con cualquier cuenta
2. Redirigido a `/education/student`
3. Explorar aulas disponibles
4. Acceder a materiales de estudio
5. Unirse a sesiones en vivo cuando estén activas
6. Participar en el chat de la clase

## 💾 Base de Datos

### Modelos MongoDB

#### Classroom
- Información del aula
- Instructor
- Lista de estudiantes
- Estado activo/inactivo

#### EducationalMaterial
- Título y descripción
- Tipo de material (text, pdf, word, excel, powerpoint, google-drive, link)
- URLs o contenido
- Metadatos de subida

#### LiveSession
- Información de la sesión
- Fecha y hora programada
- Duración
- Estado en vivo
- URL del stream

#### ChatMessage
- Mensajes del chat
- Usuario y nombre
- Timestamp
- Indicador de instructor

## 🎨 Interfaz de Usuario

### Diseño
- **Colores**: Paleta verde suave (#D5E8D4, #5D8D7C) manteniendo la identidad del sitio
- **Tipografía**: Limpia y profesional
- **Animaciones**: Sutiles con Framer Motion
- **Iconos**: Lucide React para consistencia

### Características UX
- Navegación intuitiva
- Feedback visual claro
- Responsive design
- Estados de carga
- Mensajes de error/éxito

## 🔧 Configuración Técnica

### Dependencias Principales
- Next.js 14+ (App Router)
- Clerk (Autenticación)
- MongoDB (Base de datos)
- Framer Motion (Animaciones)
- Lucide React (Iconos)
- TypeScript (Type safety)

### Variables de Entorno Necesarias
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
MONGODB_URI=
```

## 📝 Próximos Pasos Recomendados

### Mejoras Futuras
1. **Upload de Archivos**: Integrar servicio como AWS S3 o Cloudinary
2. **WebRTC**: Implementar video/audio nativo en lugar de solo embeber
3. **Notificaciones**: Sistema de notificaciones push
4. **Analytics**: Tracking de progreso de estudiantes
5. **Quizzes**: Sistema de evaluación
6. **Certificados**: Generar certificados de completación
7. **WebSockets**: Chat en tiempo real con Socket.io
8. **Grabaciones**: Guardar sesiones automáticamente

### Integraciones Recomendadas
- **Zoom API**: Control directo de reuniones
- **Google Drive API**: Sincronización automática
- **Stripe**: Sistema de pagos si se monetiza
- **SendGrid**: Emails de notificación

## 🛡️ Seguridad

- Autenticación robusta con Clerk
- Validación de roles en cada endpoint
- Protección de rutas sensibles
- Sanitización de inputs
- Rate limiting recomendado para producción

## 📱 Responsive

El sistema está completamente optimizado para:
- Desktop (1920px+)
- Laptop (1024px - 1920px)
- Tablet (768px - 1024px)
- Mobile (320px - 768px)

## 🎯 Cambios Realizados

1. ✅ Card principal actualizado de "Reuniones remotas" a "Educación remota"
2. ✅ Sistema completo de roles (Admin/Student)
3. ✅ Dashboard de administradora con estadísticas
4. ✅ Gestión completa de aulas virtuales
5. ✅ Sistema de subida de materiales (todos los formatos)
6. ✅ Programación y gestión de sesiones en vivo
7. ✅ Chat interno para clases
8. ✅ Vista de estudiante optimizada
9. ✅ Preparación para streaming de video
10. ✅ APIs RESTful completas

## 📞 Contacto

Para cualquier consulta sobre el sistema:
- Email: candegherardi@gmail.com
- Admin Email: candegherardi@gmail.com

---

**Desarrollado con ❤️ para transformar la educación en medicina**
