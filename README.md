# 🌐 Mini Red Social - Proyecto Universitario

[![Estado](https://img.shields.io/badge/Estado-Completo-brightgreen)](https://github.com/mchiroyl/mini-red-social)
[![Licencia](https://img.shields.io/badge/Licencia-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)

Red social full-stack moderna con funcionalidades en tiempo real, desarrollada como proyecto universitario.

## 👨‍💻 Autores

- **Marvin Chiroy** - [GitHub](https://github.com/mchiroyl)
- **Josue Sánchez**
- **Obady Pérez**

**Universidad:** Universidad Mariano Gálvez
**Curso:** Desarrollo Web - 8vo Semestre
**Año:** 2025

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Uso](#-uso)
- [API Endpoints](#-api-endpoints)
- [Funcionalidades Detalladas](#-funcionalidades-detalladas)
- [Despliegue](#-despliegue)
- [Capturas de Pantalla](#-capturas-de-pantalla)
- [Licencia](#-licencia)

---

## ✨ Características

### 🔐 Autenticación y Seguridad
- ✅ Registro e inicio de sesión de usuarios
- ✅ **Recuperación de contraseña con tokens seguros**
- ✅ Contraseñas encriptadas con bcrypt
- ✅ Autenticación JWT en cookies HttpOnly
- ✅ Protección contra ataques XSS y CSRF
- ✅ CORS configurado correctamente

### 📝 Gestión de Publicaciones
- ✅ Crear, leer y eliminar publicaciones
- ✅ Feed personalizado (solo usuarios seguidos)
- ✅ Feed general (todas las publicaciones)
- ✅ Sistema de likes con contador en tiempo real
- ✅ Sistema de comentarios anidados
- ✅ Eliminar comentarios propios

### 👥 Interacciones Sociales
- ✅ Seguir y dejar de seguir usuarios
- ✅ Perfiles de usuario personalizados
- ✅ Ver lista de seguidores y seguidos
- ✅ Visualización de actividad de usuarios

### 💬 Chat en Tiempo Real
- ✅ Chat 1:1 entre usuarios
- ✅ **Indicador "escribiendo..." en tiempo real**
- ✅ Historial de mensajes persistente
- ✅ Notificaciones de nuevos mensajes

### 🔔 Sistema de Notificaciones
- ✅ Notificaciones en tiempo real vía Socket.IO
- ✅ Badge contador de notificaciones no vistas
- ✅ Notificaciones por:
  - Likes en publicaciones
  - Comentarios en publicaciones
  - Nuevos seguidores
  - Mensajes de chat
- ✅ Marcar notificaciones como vistas
- ✅ Navegación directa desde notificaciones

### 🎨 Diseño y UX
- ✅ Diseño inspirado en Facebook (sin copyright)
- ✅ **100% Responsive** (móvil, tablet, desktop)
- ✅ Paleta de colores moderna (azul, blanco, gris)
- ✅ Animaciones suaves y transiciones
- ✅ Estados vacíos ilustrados
- ✅ Indicadores de carga

### 📚 Documentación
- ✅ API documentada con Swagger/OpenAPI
- ✅ Endpoints interactivos en `/docs`
- ✅ Ejemplos de request/response
- ✅ Schemas completos

---

## 🛠 Tecnologías

### Frontend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Next.js** | 14.2.7 | Framework React con SSR |
| **React** | 18.3.1 | Biblioteca UI |
| **Socket.IO Client** | 4.7.5 | WebSockets para tiempo real |
| **CSS3** | - | Estilos personalizados |

### Backend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Node.js** | 18+ | Runtime JavaScript |
| **Express** | 4.19.2 | Framework web |
| **PostgreSQL** | 16 | Base de datos relacional |
| **Socket.IO** | 4.7.5 | WebSockets servidor |
| **JWT** | 9.0.2 | Autenticación |
| **bcrypt** | 5.1.1 | Hash de contraseñas |
| **Swagger** | 6.2.8 | Documentación API |

### DevOps
| Herramienta | Uso |
|-------------|-----|
| **Docker** | Contenedores |
| **Docker Compose** | Orquestación |
| **Nginx** | Proxy reverso |

---

## 📦 Requisitos Previos

### Para Desarrollo Local

**Opción 1: Con Docker (Recomendado)**
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado
- Docker Compose (incluido en Docker Desktop)

**Opción 2: Sin Docker**
- [Node.js](https://nodejs.org/) 18 o superior
- [PostgreSQL](https://www.postgresql.org/) 16 o superior
- npm o yarn

---

## 🚀 Instalación y Configuración

### Opción 1: Con Docker (Más Fácil)

```bash
# 1. Clonar el repositorio
git clone https://github.com/mchiroyl/mini-red-social.git
cd mini-red-social

# 2. Copiar archivos de variables de entorno
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# 3. Levantar todos los servicios
docker compose up --build

# 4. Acceder a la aplicación
# Frontend: http://localhost:3000
# Backend API: http://localhost:4000
# Swagger Docs: http://localhost:4000/docs
```

### Opción 2: Sin Docker (Manual)

#### Backend

```bash
# 1. Navegar a la carpeta del backend
cd backend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env

# 4. Editar .env con tus configuraciones
# DATABASE_URL=postgres://usuario:contraseña@localhost:5432/minisocial
# JWT_SECRET=tu_secret_muy_seguro
# CORS_ORIGIN=http://localhost:3000

# 5. Crear la base de datos
createdb minisocial

# 6. Ejecutar migraciones
node src/db/migrate.js

# 7. Iniciar el servidor
npm run dev
# El backend estará en http://localhost:4000
```

#### Frontend

```bash
# 1. Navegar a la carpeta del frontend (en otra terminal)
cd frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.local.example .env.local

# 4. Editar .env.local
# NEXT_PUBLIC_API_BASE=http://localhost:4000
# NEXT_PUBLIC_WS_BASE=http://localhost:4000

# 5. Iniciar el servidor de desarrollo
npm run dev
# El frontend estará en http://localhost:3000
```

---

## 📁 Estructura del Proyecto

```
mini-red-social/
├── backend/                    # API REST + WebSockets
│   ├── src/
│   │   ├── routes/            # Rutas de la API
│   │   │   ├── auth.js       # Autenticación
│   │   │   ├── users.js      # Usuarios
│   │   │   ├── posts.js      # Publicaciones
│   │   │   ├── comments.js   # Comentarios
│   │   │   ├── likes.js      # Likes
│   │   │   ├── chat.js       # Chat
│   │   │   └── notifications.js # Notificaciones
│   │   ├── db/
│   │   │   ├── pool.js       # Conexión PostgreSQL
│   │   │   └── migrate.js    # Migraciones
│   │   ├── auth.js           # Middleware de autenticación
│   │   ├── realtime.js       # Socket.IO servidor
│   │   ├── swagger.js        # Configuración Swagger
│   │   └── index.js          # Punto de entrada
│   ├── migrations/
│   │   ├── 001_init.sql      # Schema inicial
│   │   └── 002_password_reset.sql # Tokens de recuperación
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                   # Aplicación Next.js
│   ├── pages/
│   │   ├── index.js          # Login
│   │   ├── register.js       # Registro
│   │   ├── forgot-password.js # Solicitar recuperación
│   │   ├── reset-password.js # Restablecer contraseña
│   │   ├── feed.js           # Feed de publicaciones
│   │   ├── chat.js           # Chat 1:1
│   │   ├── notifications.js  # Notificaciones
│   │   ├── profile/
│   │   │   └── [username].js # Perfil de usuario
│   │   ├── _app.js           # App wrapper
│   │   └── _document.js      # Document HTML
│   ├── components/
│   │   ├── Layout.js         # Layout principal
│   │   └── PostCard.js       # Tarjeta de publicación
│   ├── lib/
│   │   ├── api.js            # Cliente API
│   │   └── socket.js         # Cliente Socket.IO
│   ├── public/
│   ├── styles.css            # Estilos globales
│   ├── .env.local.example
│   ├── Dockerfile
│   └── package.json
│
├── proxy/                      # Nginx (opcional)
│   ├── nginx.conf
│   └── Dockerfile
│
├── docker-compose.yml          # Orquestación Docker
├── .gitignore
└── README.md                   # Este archivo
```

---

## 💡 Uso

### 1. Registro de Usuario

1. Abre http://localhost:3000
2. Haz clic en "Crear cuenta nueva"
3. Completa el formulario:
   - Nombre de usuario
   - Email
   - Contraseña
4. Serás redirigido automáticamente al feed

### 1.5. Recuperación de Contraseña

1. En la página de login, haz clic en "¿Olvidaste tu contraseña?"
2. Ingresa tu correo electrónico
3. **En desarrollo:** El enlace de recuperación aparecerá en la página
4. **En producción:** Recibirías un email con el enlace
5. Haz clic en el enlace o abre `/reset-password?token=xxx`
6. Ingresa tu nueva contraseña (dos veces)
7. Serás redirigido automáticamente al login

> ⚠️ **IMPORTANTE:** El sistema NO envía emails reales. El enlace aparece directamente en la página.
>
> 📚 **Guía completa:** Ver [RECUPERACION-CONTRASEÑA.md](./RECUPERACION-CONTRASEÑA.md) para instrucciones detalladas y solución de problemas.

### 2. Crear Publicaciones

1. En el feed, escribe en el cuadro de texto
2. Haz clic en "Publicar"
3. Tu publicación aparecerá en el feed

### 3. Interactuar con Publicaciones

- **Like:** Haz clic en el botón "❤️ Me gusta"
- **Comentar:** Haz clic en "💬 Comentar", escribe y envía
- **Eliminar:** Solo tus propias publicaciones (botón 🗑️)

### 4. Seguir Usuarios

1. Haz clic en el nombre de usuario en una publicación
2. En el perfil, haz clic en "Seguir"
3. Sus publicaciones aparecerán en tu feed personalizado

### 5. Chat en Tiempo Real

1. Ve a la sección "Chat"
2. Selecciona un usuario de la lista
3. Escribe tu mensaje
4. **¡El otro usuario verá "escribiendo..." mientras tecleas!**
5. Los mensajes se entregan instantáneamente

### 6. Notificaciones

- El ícono 🔔 muestra un contador de notificaciones no vistas
- Haz clic para ver todas las notificaciones
- Haz clic en una notificación para ir a su contexto
- Marca todas como vistas con el botón

---

## 🔌 API Endpoints

### Autenticación
```
POST   /api/auth/register           - Registrar usuario
POST   /api/auth/login              - Iniciar sesión
POST   /api/auth/logout             - Cerrar sesión
POST   /api/auth/forgot-password    - Solicitar recuperación de contraseña
POST   /api/auth/reset-password     - Restablecer contraseña con token
POST   /api/auth/verify-reset-token - Verificar validez de token
```

### Usuarios
```
GET    /api/users/me           - Obtener perfil actual
GET    /api/users/:username    - Obtener perfil por username
POST   /api/users/:id/follow   - Seguir/dejar de seguir
GET    /api/users/:id/followers - Obtener seguidores
GET    /api/users/:id/following - Obtener seguidos
```

### Publicaciones
```
POST   /api/posts              - Crear publicación
GET    /api/posts/feed         - Obtener feed (query: ?all=true)
DELETE /api/posts/:id           - Eliminar publicación
```

### Likes
```
POST   /api/posts/:id/like     - Like/unlike publicación
```

### Comentarios
```
GET    /api/posts/:id/comments        - Obtener comentarios
POST   /api/posts/:id/comments        - Crear comentario
DELETE /api/posts/comment/:id         - Eliminar comentario
```

### Chat
```
GET    /api/chat/history/:userId      - Historial de chat
```

### Notificaciones
```
GET    /api/notifications              - Obtener notificaciones
POST   /api/notifications/seen         - Marcar como vistas
```

**📚 Documentación completa:** http://localhost:4000/docs (Swagger UI)

---

## 🎯 Funcionalidades Detalladas

### Sistema de Recuperación de Contraseña

**Flujo completo:**

1. **Solicitar recuperación:**
   - Usuario hace clic en "¿Olvidaste tu contraseña?" en el login
   - Ingresa su email en `/forgot-password`
   - Backend genera token seguro (crypto.randomBytes(32))
   - Token válido por 1 hora
   - En producción, se enviaría email con enlace

2. **Verificación de token:**
   - Usuario accede al enlace `/reset-password?token=xxx`
   - Frontend verifica automáticamente la validez del token
   - Muestra error si el token es inválido o ha expirado

3. **Restablecer contraseña:**
   - Usuario ingresa nueva contraseña (mínimo 6 caracteres)
   - Confirma la contraseña
   - Backend valida token, actualiza contraseña con hash bcrypt
   - Marca token como usado (single-use)
   - Redirige automáticamente al login

**Seguridad:**
- Tokens únicos generados con `crypto` (64 caracteres hex)
- Expiración automática (1 hora)
- Tokens de un solo uso
- Contraseñas hasheadas con bcrypt
- Respuesta genérica para emails no existentes (previene enumeración)
- Tokens invalidados al usarse o al solicitar uno nuevo

**Base de datos:**
```sql
CREATE TABLE password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  token VARCHAR(255) UNIQUE,
  expires_at TIMESTAMP,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indicador "Escribiendo..." en Chat

**Implementación:**

1. **Frontend:** Cuando el usuario escribe en el input del chat:
   ```javascript
   // Se emite evento cada vez que el usuario escribe
   socket.emit('chat:typing', {
     toUserId: destinatarioId,
     username: miUsername,
     isTyping: true
   })
   ```

2. **Backend:** Socket.IO transmite el evento al destinatario:
   ```javascript
   socket.on('chat:typing', ({ toUserId, username, isTyping }) => {
     io.to(`user:${toUserId}`).emit('chat:user-typing', {
       userId, username, isTyping
     })
   })
   ```

3. **Frontend destinatario:** Muestra indicador animado:
   ```
   "escribiendo..."
   ```

**Características:**
- Auto-desaparece después de 1 segundo de inactividad
- Se limpia al enviar mensaje
- Animación de puntos parpadeantes
- Funciona bidireccionalmente

### Sistema de Notificaciones

**Tipos de notificaciones:**
- ❤️ Like en tu publicación
- 💬 Comentario en tu publicación
- 👤 Nuevo seguidor
- 📩 Mensaje de chat

**Flujo:**
1. Usuario A realiza una acción (like, comentario, etc.)
2. Backend crea registro en tabla `notifications`
3. Socket.IO emite evento `notification:new` a Usuario B
4. Frontend de Usuario B:
   - Incrementa contador en badge
   - Actualiza lista de notificaciones
   - Muestra notificación

### Feed Personalizado vs General

**Feed Personalizado** (checkbox desmarcado):
- Muestra solo publicaciones de usuarios que sigues
- Query: `GET /api/posts/feed?all=false`

**Feed General** (checkbox marcado):
- Muestra todas las publicaciones
- Query: `GET /api/posts/feed?all=true`

---

## 🌐 Despliegue en Render + Vercel

**Tiempo estimado**: 15-20 minutos | **Costo**: 100% Gratuito

Este proyecto está configurado para desplegarse en:
- **Backend**: [Render](https://render.com) (Plan gratuito)
- **Frontend**: [Vercel](https://vercel.app) (Plan gratuito)

---

### 📦 PASO 0: Subir a GitHub

```bash
# Si aún no tienes el repo inicializado
git init
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/mchiroyl/mini-red-social-full-stack.git
git push -u origin main
```

---

### 🔧 PASO 1: Desplegar Backend en Render (10 min)

#### 1.1 Crear Base de Datos PostgreSQL

1. Ve a **https://dashboard.render.com/**
2. Si no tienes cuenta, haz clic en **"Get Started"** y regístrate
3. Una vez dentro, haz clic en el botón azul **"New +"** (esquina superior derecha)
4. Selecciona **"PostgreSQL"**
5. Configura la base de datos:
   - **Name**: `mini-social-db`
   - **Database**: `minisocial`
   - **User**: `postgres` (se llena automáticamente)
   - **Region**: Elige `Oregon (US West)` o la más cercana a ti
   - **PostgreSQL Version**: Deja la versión por defecto
   - **Datadog API Key**: Déjalo vacío
   - **Plan**: Selecciona **"Free"**
6. Haz clic en el botón verde **"Create Database"**
7. Espera 2-3 minutos mientras se crea
8. **MUY IMPORTANTE**: Una vez creada, busca y copia la **"Internal Database URL"** (la necesitarás en el siguiente paso)
   - Haz clic en tu base de datos recién creada
   - Busca la sección "Connections"
   - Copia el valor de **"Internal Database URL"** (empieza con `postgresql://`)

#### 1.2 Crear Web Service (Backend)

1. Regresa al Dashboard de Render
2. Haz clic en **"New +"** → **"Web Service"**
3. Haz clic en **"Build and deploy from a Git repository"** → **"Next"**
4. Si es la primera vez, conecta tu cuenta de GitHub:
   - Haz clic en **"Connect GitHub"**
   - Autoriza a Render
5. Busca tu repositorio `mini-red-social-full-stack` y haz clic en **"Connect"**
6. Configura el servicio:
   - **Name**: `mini-social-api` (o el nombre que prefieras)
   - **Region**: **LA MISMA** que elegiste para la base de datos (Oregon)
   - **Branch**: `main`
   - **Root Directory**: `backend` ⚠️ **MUY IMPORTANTE**
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js`
   - **Plan**: Selecciona **"Free"**

7. Ahora configura las **Variables de Entorno**:
   - Busca la sección **"Environment Variables"**
   - Haz clic en **"Add Environment Variable"** para cada una:

   ```
   NODE_ENV=production
   PORT=4000
   RUN_MIGRATIONS=true
   COOKIE_SECURE=true
   DATABASE_URL=<PEGA_AQUI_LA_INTERNAL_DATABASE_URL>
   JWT_SECRET=<GENERA_UNO_ABAJO>
   CORS_ORIGIN=
   ```

   **Para generar el JWT_SECRET**, abre una terminal y ejecuta:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copia el resultado y pégalo en `JWT_SECRET`

   **Deja `CORS_ORIGIN` vacío por ahora** (lo actualizaremos después)

8. Haz clic en el botón verde **"Create Web Service"**
9. Espera 5-10 minutos mientras se despliega (verás los logs en tiempo real)
10. **MUY IMPORTANTE**: Cuando termine, copia la **URL de tu backend** (ej: `https://mini-social-api.onrender.com`)

---

### ▲ PASO 2: Desplegar Frontend en Vercel (5 min)

#### 2.1 Importar Proyecto

1. Ve a **https://vercel.com/login**
2. Inicia sesión con tu cuenta de GitHub (o regístrate)
3. Una vez dentro, haz clic en **"Add New..."** → **"Project"**
4. Busca tu repositorio `mini-red-social-full-stack` y haz clic en **"Import"**
5. Configura el proyecto:
   - **Framework Preset**: `Next.js` (se detecta automáticamente)
   - **Root Directory**: Haz clic en **"Edit"** y escribe `frontend` ⚠️ **MUY IMPORTANTE**
   - **Build Command**: `npm run build` (ya está por defecto)
   - **Output Directory**: `.next` (ya está por defecto)
   - **Install Command**: `npm install` (ya está por defecto)

#### 2.2 Configurar Variables de Entorno

1. Expande la sección **"Environment Variables"**
2. Agrega las siguientes variables (haz clic en "Add" para cada una):

   **Variable 1:**
   - **Key**: `NEXT_PUBLIC_API_BASE`
   - **Value**: `https://mini-social-api.onrender.com` (usa TU URL de Render del Paso 1.2)
   - Environment: Marca las 3 opciones (Production, Preview, Development)

   **Variable 2:**
   - **Key**: `NEXT_PUBLIC_WS_BASE`
   - **Value**: `https://mini-social-api.onrender.com` (la misma URL)
   - Environment: Marca las 3 opciones (Production, Preview, Development)

3. Haz clic en el botón azul **"Deploy"**
4. Espera 3-5 minutos mientras se despliega
5. **MUY IMPORTANTE**: Cuando termine, copia la **URL de tu frontend** (ej: `https://mini-social.vercel.app`)

---

### 🔄 PASO 3: Actualizar CORS en Render (1 min)

1. Regresa a **https://dashboard.render.com/**
2. Haz clic en tu servicio **mini-social-api**
3. Ve a la pestaña **"Environment"** (menú izquierdo)
4. Busca la variable `CORS_ORIGIN`
5. Haz clic en el lápiz para editar
6. Pega la **URL de tu frontend de Vercel** (del Paso 2.2)
   - Ejemplo: `https://mini-social.vercel.app`
   - **NO incluyas `/` al final**
7. Haz clic en **"Save Changes"**
8. El servicio se reiniciará automáticamente (espera 2-3 minutos)

---

### ✅ PASO 4: Verificar que Todo Funciona

#### 4.1 Verificar Backend

1. Abre en tu navegador: `https://tu-backend.onrender.com/health`
   - Deberías ver: `{"status":"ok",...}`
2. Abre: `https://tu-backend.onrender.com/docs`
   - Deberías ver la documentación de Swagger

#### 4.2 Verificar Frontend

1. Abre: `https://tu-frontend.vercel.app`
2. Haz clic en **"Registrarse"**
3. Crea un usuario de prueba
4. Inicia sesión
5. Crea un post
6. ✅ **¡Si puedes crear un post, todo funciona!**

#### 4.3 Probar Funcionalidades

- ✅ Crear posts
- ✅ Dar like
- ✅ Comentar y responder
- ✅ Seguir usuarios
- ✅ Chat 1:1
- ✅ Notificaciones en tiempo real

---

### 🐛 Solución de Problemas

#### Error: CORS policy
**Solución**: Verifica que `CORS_ORIGIN` en Render sea exactamente la URL de Vercel (sin `/` al final)

#### Backend no responde
**Solución**: Revisa los logs en Render → Tu servicio → Logs

#### Frontend muestra error al conectarse
**Solución**:
1. Verifica que las variables `NEXT_PUBLIC_API_BASE` y `NEXT_PUBLIC_WS_BASE` estén configuradas
2. Re-despliega el frontend: Vercel → Tu proyecto → Deployments → Redeploy

---

### 📋 Archivos de Configuración (Ya Incluidos)

- ✅ `backend/render.yaml` - Configuración de Render
- ✅ `backend/.env.example` - Ejemplo de variables backend
- ✅ `frontend/vercel.json` - Configuración de Vercel
- ✅ `frontend/.env.example` - Ejemplo de variables frontend

---

### 💰 Costos (100% Gratuito)

**Render** (Free Tier):
- ✅ 750 horas/mes de servidor
- ✅ PostgreSQL gratis por 90 días
- ⚠️ El servicio se duerme después de 15 min de inactividad (primera petición tarda ~30 segundos)

**Vercel** (Free Tier):
- ✅ Despliegues ilimitados
- ✅ 100 GB de ancho de banda/mes
- ✅ SSL automático
- ✅ No se duerme nunca

---

### 🔄 Actualizar la Aplicación

Cuando hagas cambios en el código:

```bash
git add .
git commit -m "Descripción de cambios"
git push origin main
```

**Render y Vercel detectarán el cambio y re-desplegarán automáticamente** 🎉

---

## 📸 Capturas de Pantalla

### Login
![Login](docs/screenshots/login.png)
*Página de inicio de sesión con diseño moderno*

### Feed
![Feed](docs/screenshots/feed.png)
*Feed de publicaciones con likes y comentarios*

### Chat
![Chat](docs/screenshots/chat.png)
*Chat en tiempo real con indicador "escribiendo..."*

### Notificaciones
![Notificaciones](docs/screenshots/notifications.png)
*Sistema de notificaciones en tiempo real*

### Responsive
![Responsive](docs/screenshots/responsive.png)
*Diseño 100% responsive en todos los dispositivos*

---

## 🧪 Testing

### Probar Localmente

```bash
# Iniciar la aplicación
docker compose up

# En el navegador
# 1. Abre http://localhost:3000
# 2. Registra dos usuarios diferentes (usa dos navegadores/pestañas privadas)
# 3. Prueba el chat entre ambos usuarios
# 4. Verifica el indicador "escribiendo..."
# 5. Crea publicaciones, dale like, comenta
# 6. Verifica las notificaciones en tiempo real
```

### Probar API con Swagger

1. Abre http://localhost:4000/docs
2. Registra un usuario en `POST /api/auth/register`
3. Usa el botón "Authorize" con el token
4. Prueba todos los endpoints interactivamente

---

## 🤝 Contribuciones

Este es un proyecto universitario, pero las contribuciones son bienvenidas:

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 📧 Contacto

**Marvin Chiroy**
- GitHub: [@mchiroyl](https://github.com/mchiroyl)
- Repositorio: [mini-red-social-full-stack](https://github.com/mchiroyl/mini-red-social-full-stack)

**Josue Sánchez**
- Colaborador del proyecto

**Obady Pérez**
- Colaborador del proyecto

---

## 🙏 Agradecimientos

- Universidad Mariano Gálvez de Guatemala
- Docentes del curso de Desarrollo Web
- Comunidad open source por las herramientas utilizadas

---

## 📊 Estado del Proyecto

- ✅ **100% Completado**
- ✅ Backend funcional
- ✅ Frontend responsive
- ✅ Base de datos con migraciones
- ✅ Tiempo real implementado
- ✅ Documentación completa
- ✅ Listo para despliegue
- ✅ Sin problemas de copyright

---

## 🎓 Propósito Educativo

Este proyecto fue desarrollado con fines educativos como parte del curso de Desarrollo Web de la Universidad Mariano Gálvez. Demuestra conocimientos en:

- ✅ Desarrollo Full-Stack
- ✅ Arquitectura cliente-servidor
- ✅ APIs RESTful
- ✅ WebSockets y comunicación en tiempo real
- ✅ Bases de datos relacionales
- ✅ Autenticación y seguridad
- ✅ Diseño responsive
- ✅ Docker y contenedores
- ✅ Control de versiones con Git

---

**⭐ Si este proyecto te fue útil, no olvides darle una estrella en GitHub!**

---

*Última actualización: Enero 2025*
