# 🎾 Sistema de Reserva de Clases de Tenis

Aplicación web sencilla para gestionar reservas de clases de tenis con horarios definidos y control administrativo.

## 📋 Características

### Horarios Disponibles
- **Mañana**: 6:00 AM - 9:00 AM (Cancha 3) - 3 bloques de 1 hora
- **Tarde**: 5:00 PM - 9:00 PM (Cancha 6) - 4 bloques de 1 hora

### Vista del Cliente
- Ver solo horarios disponibles
- Reservar con formulario simple
- Confirmación inmediata
- Selección de fecha

### Vista del Entrenador (Admin)
- Ver todas las reservas del día
- Cambiar estado de clases (disponible/reservado/cancelado)
- Estadísticas en tiempo real
- Lista detallada de reservas
- Reinicio diario automático
- Exportación de datos

## 🚀 Cómo Empezar

1. **Abrir la aplicación**:
   - Abre `index.html` en tu navegador para la vista de cliente
   - Abre `admin.html` para el panel del entrenador

2. **Para clientes**:
   - Selecciona la fecha deseada
   - Haz clic en un horario disponible
   - Completa el formulario con tus datos
   - Confirma la reserva

3. **Para el entrenador**:
   - Accede a `admin.html`
   - Selecciona la fecha a gestionar
   - Ve estadísticas y gestiona reservas
   - Cancela o libera horarios según necesites

## 📁 Estructura de Archivos

```
horariosclases/
├── index.html          # Página principal para clientes
├── admin.html          # Panel de administración
├── style.css           # Estilos CSS
├── script.js           # Lógica JavaScript
├── data.json           # Configuración inicial
└── README.md           # Este archivo
```

## 🔧 Funcionalidades Técnicas

### Almacenamiento
- Usa `localStorage` del navegador
- Datos persistentes entre sesiones
- Reinicio automático diario a medianoche

### Estados de Reserva
- **Disponible**: Verde, puede ser reservado
- **Reservado**: Amarillo, con datos del cliente
- **Cancelado**: Rojo, puede ser liberado

### Sistema Automático
- Reinicio diario de horarios
- Generación automática de slots disponibles
- Validación de fechas y horarios

## 🎨 Diseño Responsivo

- Interfaz moderna y profesional
- Diseño adaptativo para móviles
- Colores intuitivos por estado
- Animaciones suaves y transiciones

## 📊 Estadísticas del Panel Admin

- Total de reservas
- Horarios disponibles
- Horarios reservados
- Horarios cancelados

## 🔒 Seguridad

- Validación de formularios
- Confirmación para acciones destructivas
- Datos almacenados localmente

## 🚀 Mejoras Futuras

- [ ] Sistema de notificaciones por email
- [ ] Integración con calendarios
- [ ] Múltiples canchas
- [ ] Sistema de pagos
- [ ] Base de datos en la nube

## 📞 Soporte

Esta es una aplicación básica pero funcional. Para cualquier modificación o mejora, contacta con el desarrollador.

---

**¡Disfruta gestionando tus clases de tenis! 🎾**
