# 🔐 Sistema de Recuperación de Contraseña

## ⚠️ IMPORTANTE - Sobre el Envío de Correos

### ¿Por qué NO recibes un email?

**El sistema NO envía correos electrónicos reales.** Esto es completamente normal y esperado por las siguientes razones:

1. **Proyecto Universitario**: Este es un proyecto educativo, no una aplicación en producción
2. **Sin Servicio SMTP**: No está configurado ningún servicio de envío de emails (Gmail, SendGrid, etc.)
3. **Solo para Desarrollo**: El enlace de recuperación aparece directamente en la página web

### ✅ Cómo Funciona en Desarrollo

Cuando solicitas recuperar tu contraseña:

1. Ve a: http://localhost:3000
2. Haz clic en **"¿Olvidaste tu contraseña?"**
3. Ingresa tu correo electrónico
4. **¡IMPORTANTE!** El enlace de recuperación aparecerá directamente en la misma página
5. Copia ese enlace y ábrelo en tu navegador
6. Ingresa tu nueva contraseña

---

## 📝 Guía Paso a Paso

### Paso 1: Acceder a la página de recuperación

**URL**: http://localhost:3000

Haz clic en el enlace "¿Olvidaste tu contraseña?" que está debajo del campo de contraseña.

### Paso 2: Solicitar recuperación

En la página `/forgot-password`:

1. Ingresa tu correo electrónico (debe estar registrado)
2. Haz clic en "Enviar enlace de recuperación"

### Paso 3: Obtener el enlace

**¡ATENCIÓN!** Después de hacer clic, verás un cuadro azul con:
- Mensaje de éxito
- **Link de recuperación** (algo como: http://localhost:3000/reset-password?token=...)

**Ejemplo del enlace:**
```
http://localhost:3000/reset-password?token=420a512cbb7b699d51b6ba98caa55ef9c8b3ad9b81f468d765d6af37314c27a7
```

### Paso 4: Usar el enlace

Opciones:
- **Hacer clic directamente** en el enlace azul, O
- **Copiar y pegar** el enlace completo en tu navegador

### Paso 5: Restablecer contraseña

En la página de reset:

1. Ingresa tu nueva contraseña (mínimo 6 caracteres)
2. Confirma la contraseña (debe ser igual)
3. Haz clic en "Restablecer contraseña"
4. Serás redirigido automáticamente al login en 3 segundos

---

## 🔧 Solución de Problemas

### Problema 1: "No aparece la página de reset"

**Solución:** Asegúrate de:
- Copiar el enlace COMPLETO (incluye el token largo)
- El enlace debe empezar con: `http://localhost:3000/reset-password?token=`
- No debe tener espacios ni saltos de línea

### Problema 2: "Token inválido o expirado"

**Causas:**
- El token expira después de 1 hora
- Ya usaste ese token (son de un solo uso)
- El token fue generado antes de reiniciar Docker

**Solución:**
1. Ve a `/forgot-password` nuevamente
2. Solicita un nuevo enlace
3. Usa el nuevo token inmediatamente

### Problema 3: "La página no carga"

**Solución:**
1. Verifica que Docker esté corriendo:
   ```bash
   docker compose ps
   ```

2. Deberías ver estos contenedores corriendo:
   - mini_social_api (puerto 4000)
   - mini_social_web (puerto 3000)
   - mini_social_db

3. Si no están corriendo:
   ```bash
   docker compose up -d
   ```

### Problema 4: "Email no existe"

**Nota de Seguridad:**
Por seguridad, el sistema SIEMPRE dice "Si el email existe, recibirás un enlace..."

Pero si el email NO existe:
- NO se genera ningún token
- Aparece un mensaje adicional "(solo para desarrollo): Email no encontrado"

**Solución:**
- Usa un email que hayas registrado anteriormente
- O registra una nueva cuenta primero

---

## 🚀 Configuración para Producción

Si en el futuro quisieras enviar emails REALES:

### Opción 1: Gmail (más fácil)

```javascript
// backend/src/services/email.js
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'tu-email@gmail.com',
    pass: 'tu-app-password' // NO tu contraseña normal
  }
})

export async function sendPasswordResetEmail(email, token) {
  const resetLink = `https://tu-dominio.com/reset-password?token=${token}`

  await transporter.sendMail({
    from: 'Mini Red Social <tu-email@gmail.com>',
    to: email,
    subject: 'Recuperación de Contraseña - Mini Red Social',
    html: `
      <h2>Recuperación de Contraseña</h2>
      <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Este enlace expira en 1 hora.</p>
      <p>Si no solicitaste esto, ignora este email.</p>
    `
  })
}
```

### Opción 2: SendGrid (para producción seria)

1. Crea cuenta en https://sendgrid.com
2. Obtén tu API Key
3. Instala el paquete:
   ```bash
   npm install @sendgrid/mail
   ```

4. Configura:
   ```javascript
   import sgMail from '@sendgrid/mail'

   sgMail.setApiKey(process.env.SENDGRID_API_KEY)

   export async function sendPasswordResetEmail(email, token) {
     const msg = {
       to: email,
       from: 'noreply@tu-dominio.com',
       subject: 'Recuperación de Contraseña',
       html: `<a href="https://tu-dominio.com/reset-password?token=${token}">Restablecer contraseña</a>`
     }

     await sgMail.send(msg)
   }
   ```

5. Actualiza la ruta en `backend/src/routes/auth.js`:
   ```javascript
   import { sendPasswordResetEmail } from '../services/email.js'

   // En la ruta /forgot-password, después de generar el token:
   await sendPasswordResetEmail(email, token)

   res.json({
     message: 'Si el email existe, recibirás un enlace de recuperación'
     // NO devolver el token en producción
   })
   ```

---

## 📊 Base de Datos

La tabla `password_reset_tokens` almacena:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | SERIAL | ID único |
| user_id | INTEGER | Usuario que solicitó |
| token | VARCHAR(255) | Token seguro (64 chars hex) |
| expires_at | TIMESTAMP | Fecha de expiración (1 hora) |
| used | BOOLEAN | Si ya fue usado |
| created_at | TIMESTAMP | Fecha de creación |

**Consultas útiles:**

Ver tokens activos:
```sql
SELECT * FROM password_reset_tokens
WHERE used = FALSE AND expires_at > NOW();
```

Limpiar tokens expirados:
```sql
DELETE FROM password_reset_tokens
WHERE expires_at < NOW() OR used = TRUE;
```

---

## 🔒 Seguridad Implementada

✅ **Tokens criptográficamente seguros**
- Generados con `crypto.randomBytes(32)` (256 bits de entropía)
- 64 caracteres hexadecimales

✅ **Expiración automática**
- Válidos solo por 1 hora
- No se pueden usar después de expirar

✅ **Un solo uso**
- Al restablecer la contraseña, el token se marca como `used=true`
- No se puede reutilizar el mismo token

✅ **Prevención de enumeración**
- Respuesta genérica aunque el email no exista
- Evita que atacantes descubran qué emails están registrados

✅ **Contraseñas hasheadas**
- Bcrypt con salt automático
- Costo 10 (2^10 iteraciones)

✅ **Invalidación de tokens anteriores**
- Al solicitar nuevo token, se invalidan los anteriores del mismo usuario

---

## ❓ Preguntas Frecuentes

### ¿Puedo usar número de teléfono en lugar de email?

Sí, pero requeriría:

1. **Servicio SMS** (como Twilio, que es de pago)
2. **Modificar la base de datos** para almacenar números
3. **Cambiar el formulario** de registro/login
4. **Implementar validación** de números telefónicos

**Costo aproximado:** $0.05 USD por SMS

**Ejemplo con Twilio:**
```javascript
import twilio from 'twilio'

const client = twilio(accountSid, authToken)

await client.messages.create({
  body: `Tu código de recuperación: ${code}`,
  from: '+1234567890',
  to: userPhone
})
```

### ¿Cuánto dura el token?

1 hora (3600 segundos). Definido en:
```javascript
const expiresAt = new Date(Date.now() + 3600000) // 1 hora
```

Puedes cambiarlo modificando el número (en milisegundos):
- 30 minutos: 1800000
- 2 horas: 7200000
- 24 horas: 86400000

### ¿Es seguro para un proyecto universitario?

**Sí**, implementa:
- Encriptación de contraseñas (bcrypt)
- Tokens seguros (crypto)
- Expiración automática
- Protección contra reutilización
- Prevención de enumeración

Para un proyecto universitario, es más que suficiente.

---

## 📞 Soporte

Si tienes problemas:

1. Verifica que Docker esté corriendo: `docker compose ps`
2. Revisa los logs: `docker compose logs backend`
3. Asegúrate de estar en: http://localhost:3000
4. El enlace debe incluir `?token=` con un token largo

**Desarrollado por:** Marvin Chiroy, Josue Sánchez, Obady Pérez
**Universidad:** Mariano Gálvez de Guatemala
**Curso:** Desarrollo Web - 8vo Semestre
