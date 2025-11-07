# 🌐 Cómo Acceder a la Aplicación

## ⚠️ CAMBIO IMPORTANTE

**Ya NO uses:** ~~https://social.local/~~

## ✅ URLs CORRECTAS AHORA

### Acceso a la Aplicación

**Frontend (Aplicación Web):**
```
http://localhost:3000
```

**Backend API:**
```
http://localhost:4000
```

**Documentación Swagger:**
```
http://localhost:4000/docs
```

---

## 🔧 ¿Por Qué Cambió?

### Antes (Configuración Complicada)
- Usaba dominios personalizados: `social.local` y `api.social.local`
- Requería modificar el archivo hosts de Windows
- Usaba HTTPS con certificados autofirmados
- Más difícil de configurar y probar

### Ahora (Configuración Simple)
- ✅ Usa `localhost` directamente
- ✅ No requiere modificar ningún archivo del sistema
- ✅ HTTP simple (suficiente para desarrollo)
- ✅ Más fácil de probar y compartir

---

## 📋 Guía Rápida de Acceso

### 1. Iniciar la Aplicación

```bash
cd "D:\2_UMG\8vo._semestre\DESARROLLO WEB\mini red social full-stack"
docker compose up -d
```

### 2. Verificar que Todo Esté Corriendo

```bash
docker compose ps
```

**Debes ver:**
```
NAME              STATUS                    PORTS
mini_social_api   Up                        0.0.0.0:4000->4000/tcp
mini_social_db    Up (healthy)              5432/tcp
mini_social_web   Up                        0.0.0.0:3000->3000/tcp
```

### 3. Acceder en el Navegador

Abre tu navegador y ve a:
```
http://localhost:3000
```

---

## 🆘 Solución de Problemas

### Problema 1: "No puedo acceder a localhost:3000"

**Verificar que los contenedores estén corriendo:**
```bash
docker compose ps
```

**Si no están corriendo:**
```bash
docker compose up -d
```

**Si hay errores:**
```bash
docker compose logs frontend
docker compose logs backend
```

### Problema 2: "Página en blanco o error de conexión"

**Reiniciar los servicios:**
```bash
docker compose restart
```

**Esperar 10 segundos y recargar el navegador**

### Problema 3: "social.local ya no funciona"

**Esto es correcto.** Ahora debes usar `localhost:3000`

Si quieres volver a usar `social.local`:

1. Editar archivo hosts de Windows:
   - Ruta: `C:\Windows\System32\drivers\etc\hosts`
   - Agregar líneas:
     ```
     127.0.0.1    social.local
     127.0.0.1    api.social.local
     ```

2. Restaurar configuración antigua en `docker-compose.yml`

**PERO NO ES RECOMENDADO** - localhost es más simple

### Problema 4: "Puerto ya en uso"

Si ves error: `port is already allocated`

**Ver qué está usando el puerto:**
```bash
netstat -ano | findstr :3000
netstat -ano | findstr :4000
```

**Detener el proceso:**
```bash
taskkill /PID [número] /F
```

**O cambiar el puerto en docker-compose.yml:**
```yaml
ports:
  - "3001:3000"  # Cambiar 3000 a 3001
```

### Problema 5: "Error de CORS"

Si ves error en la consola del navegador:
```
Access to fetch at 'http://localhost:4000' from origin 'http://localhost:3000' has been blocked by CORS
```

**Verificar configuración del backend:**
```bash
docker compose exec backend env | grep CORS
```

**Debe mostrar:**
```
CORS_ORIGIN=http://localhost:3000
```

**Si no es así, reiniciar:**
```bash
docker compose down
docker compose up -d
```

---

## 🎯 URLs de Prueba

### Páginas Principales

| Página | URL | Descripción |
|--------|-----|-------------|
| **Login** | http://localhost:3000 | Inicio de sesión |
| **Registro** | http://localhost:3000/register | Crear cuenta |
| **Olvidé contraseña** | http://localhost:3000/forgot-password | Recuperar contraseña |
| **Feed** | http://localhost:3000/feed | Publicaciones |
| **Chat** | http://localhost:3000/chat | Mensajes |
| **Notificaciones** | http://localhost:3000/notifications | Alertas |
| **Perfil** | http://localhost:3000/profile/[usuario] | Ver perfil |

### API Endpoints

| Endpoint | URL | Método |
|----------|-----|--------|
| **Registro** | http://localhost:4000/api/auth/register | POST |
| **Login** | http://localhost:4000/api/auth/login | POST |
| **Posts** | http://localhost:4000/api/posts/feed | GET |
| **Docs** | http://localhost:4000/docs | GET |

---

## 🔄 Comandos Útiles

### Iniciar
```bash
docker compose up -d
```

### Detener
```bash
docker compose down
```

### Ver logs en tiempo real
```bash
docker compose logs -f
```

### Ver logs de un servicio específico
```bash
docker compose logs frontend
docker compose logs backend
docker compose logs db
```

### Reiniciar un servicio
```bash
docker compose restart frontend
docker compose restart backend
```

### Reconstruir (después de cambios)
```bash
docker compose up -d --build
```

### Limpiar todo (¡CUIDADO! Borra la base de datos)
```bash
docker compose down -v
docker compose up -d
```

---

## 📱 Probar en Otros Dispositivos

### En tu red local (celular, tablet, otra computadora)

1. **Obtener tu IP local:**
   ```bash
   ipconfig
   ```
   Busca "IPv4 Address" en tu adaptador de red (ejemplo: 192.168.1.100)

2. **Modificar docker-compose.yml:**
   ```yaml
   environment:
     CORS_ORIGIN: http://192.168.1.100:3000
   ```

3. **Reiniciar:**
   ```bash
   docker compose restart backend
   ```

4. **Acceder desde otros dispositivos:**
   ```
   http://192.168.1.100:3000
   ```

---

## 🎓 Para Presentación/Demostración

### Opción 1: Laptop/PC del profe
```
1. Clonar repositorio
2. docker compose up -d
3. Abrir http://localhost:3000
```

### Opción 2: Tu laptop + proyector
```
1. docker compose up -d
2. Abrir http://localhost:3000
3. Proyectar pantalla
```

### Opción 3: Despliegue en línea (avanzado)

**Railway + Vercel** (gratis):
- Backend en Railway
- Frontend en Vercel
- Base de datos PostgreSQL en Railway

Ver README.md para instrucciones detalladas.

---

## ✅ Checklist Pre-Demostración

Antes de presentar tu proyecto:

- [ ] `docker compose ps` - Todos los contenedores corriendo
- [ ] http://localhost:3000 - Login carga correctamente
- [ ] Registrar usuario de prueba
- [ ] Crear publicación
- [ ] Probar chat con segundo usuario
- [ ] Probar recuperación de contraseña
- [ ] Verificar notificaciones
- [ ] Probar likes y comentarios

---

## 📞 Resumen Rápido

**ANTES:**
```
❌ https://social.local/
❌ Requiere configurar hosts
❌ Certificados SSL
❌ Más complejo
```

**AHORA:**
```
✅ http://localhost:3000
✅ Funciona directamente
✅ No requiere configuración extra
✅ Más simple
```

**Para recuperar contraseña:**
1. http://localhost:3000 → "¿Olvidaste tu contraseña?"
2. El enlace aparece en la página (no se envía email)
3. Copiar y pegar el enlace completo

---

**Desarrollado por:** Marvin Chiroy, Josue Sánchez, Obady Pérez
**Universidad:** Mariano Gálvez de Guatemala
