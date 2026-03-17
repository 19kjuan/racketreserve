# 🚀 Guía de Configuración de Supabase

## 📋 Pasos para Configurar Supabase

### 1️⃣ Crear Proyecto en Supabase

1. **Ve a [Supabase.com](https://supabase.com)**
2. **Inicia sesión** o regístrate con GitHub/Google
3. **Crea nuevo proyecto:**
   - Nombre: `RacketReserve`
   - Contraseña de BD: (crea una segura y guárdala)
   - Región: elige la más cercana a ti
   - Plan: **Free** 🆓

### 2️⃣ Obtener Credenciales

1. En tu proyecto, ve a **Settings → API**
2. Copia estos dos valores:
   ```
   Project URL: https://TU_PROYECTO.supabase.co
   Anon Public Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 3️⃣ Configurar Base de Datos

1. Ve a **SQL Editor** en el menú lateral
2. **Copia y pega** el contenido del archivo `supabase-setup.sql`
3. **Ejecuta** el script (botón "Run")
4. Esto creará la tabla `tennis_reservations` y las funciones necesarias

### 4️⃣ Configurar el Proyecto

1. **Abre el archivo `supabase.js`**
2. **Reemplaza** las credenciales:
   ```javascript
   const SUPABASE_URL = 'https://TU_PROYECTO.supabase.co';
   const SUPABASE_ANON_KEY = 'TU_ANON_KEY';
   ```

### 5️⃣ ¡Listo para Desplegar! 🎉

Una vez configurado, tu aplicación:
- ✅ **Persistirá datos** globalmente
- ✅ **Funcionará en Vercel/GitHub Pages**
- ✅ **Sincronizará** en tiempo real
- ✅ **Tendrá respaldo** automático

---

## 🔧 Estructura de la Base de Datos

### Tabla: `tennis_reservations`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID | ID único de reserva |
| `date` | TEXT | Fecha de la reserva |
| `time` | TEXT | Hora (06:00, 07:00, etc.) |
| `period` | TEXT | Período (morning/afternoon) |
| `slot_key` | TEXT | Clave única (morning_06) |
| `court` | TEXT | Cancha (Cancha 3/Cancha 6) |
| `status` | TEXT | Estado (available/booked/cancelled) |
| `customer` | TEXT | Nombre del cliente |
| `phone` | TEXT | Teléfono del cliente |
| `email` | TEXT | Email del cliente |
| `booking_date` | TIMESTAMP | Fecha de reserva |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Fecha de actualización |

---

## 🚀 Despliegue en Vercel/GitHub Pages

### Vercel
1. Sube tu código a GitHub
2. Conecta tu repo a Vercel
3. Despliega automáticamente

### GitHub Pages
1. Sube tu código a GitHub
2. Ve a Settings → Pages
3. Selecciona tu rama main
4. Activa Pages

---

## 🔍 Verificación

Para verificar que todo funciona:

1. **Abre `index.html`** en tu navegador
2. **Haz una reserva** de prueba
3. **Ve a Supabase → Table Editor**
4. **Verifica** que aparezca la reserva

---

## 🆘 Soporte y Troubleshooting

### Problemas Comunes:

**❌ "Supabase not configured"**
- Revisa que las credenciales en `supabase.js` sean correctas

**❌ "Table doesn't exist"**
- Ejecuta el SQL en `supabase-setup.sql`

**❌ "CORS error"**
- Las credenciales son incorrectas o el proyecto no existe

**❌ "Permission denied"**
- Verifica las RLS policies en Supabase

---

## 📞 Contacto

Si tienes problemas:
1. Revisa la consola del navegador
2. Verifica las credenciales de Supabase
3. Confirma que el SQL se ejecutó correctamente

---

**¡Tu sistema de reservas está listo para producción! 🎾**
