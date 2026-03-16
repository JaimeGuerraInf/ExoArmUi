# 🎵 Simuladores de Ejercicios Musicales

Este directorio contiene scripts de Python que simulan el movimiento correcto del exobrazo para cada ejercicio musical. Cada script está perfectamente sincronizado con la interfaz web para proporcionar una experiencia de rehabilitación realista.

## 📋 Scripts Disponibles

### 1. 🎼 Escala Musical (`simulate_escala_musical.py`)
- **Duración**: 120 segundos (2 minutos exactos)
- **Ejercicio**: Seguimiento Lineal
- **Notas**: 8 notas (Do, Re, Mi, Fa, Sol, La, Si, Do)
- **Patrón**: Movimiento escalonado ascendente y descendente
- **Características**: 3 ciclos completos con transiciones suaves

### 2. ⭐ Twinkle Twinkle Little Star (`simulate_twinkle_perfect.py`)
- **Duración**: 150 segundos (2.5 minutos exactos)
- **Ejercicio**: Seguimiento Ondulado
- **Notas**: 14 notas (C-C-G-G-A-A-G, F-F-E-E-D-D-C)
- **Patrón**: Ondulado con vibrato musical
- **Características**: 2 repeticiones + variación final expresiva

### 3. 🐑 Mary Had a Little Lamb (`simulate_mary_perfect.py`)
- **Duración**: 180 segundos (3 minutos exactos)
- **Ejercicio**: Seguimiento Complejo
- **Notas**: 25 notas con armónicos múltiples
- **Patrón**: Complejo con máxima expresión
- **Características**: 3 interpretaciones con complejidad creciente

## 🚀 Uso Individual de Scripts

### Requisitos Previos
```bash
# 1. Asegúrate de que ROS esté configurado
source /opt/ros/noetic/setup.bash

# 2. Inicia roscore (en terminal separada)
roscore &

# 3. Inicia rosbridge_server para WebSocket (en terminal separada)
roslaunch rosbridge_server rosbridge_websocket.launch
```

### Ejecutar Scripts Individuales

**Escala Musical:**
```bash
cd scripts
python3 simulate_escala_musical.py
```

**Twinkle Twinkle Little Star:**
```bash
cd scripts
python3 simulate_twinkle_perfect.py
```

**Mary Had a Little Lamb:**
```bash
cd scripts
python3 simulate_mary_perfect.py
```

## 🎯 Sincronización con la Interfaz

### Pasos para una Simulación Perfecta:

1. **Preparar la Interfaz Web:**
   - Abre tu navegador y ve a la aplicación
   - Navega a "Ejercicios Musicales"
   - Selecciona el ejercicio que vas a simular

2. **Ejecutar el Script:**
   - Ejecuta el script correspondiente en la terminal
   - El script comenzará a publicar ángulos en `/angle_topic`

3. **Iniciar el Ejercicio:**
   - En la interfaz web, haz clic en "Comenzar Ejercicio"
   - Aparecerá una cuenta atrás estilo videojuego: 3, 2, 1, ¡YA!
   - El punto verde seguirá automáticamente el camino

4. **Observar la Sincronización:**
   - El camino durará exactamente lo mismo que el script
   - Las notas musicales se activarán en el momento correcto
   - La puntuación aumentará progresivamente

## 🔧 Características Técnicas

### Frecuencia de Publicación
- **60 Hz**: Perfecta sincronización con la interfaz (60 FPS)
- **Transiciones suaves**: Funciones ease-in-out matemáticas
- **Variaciones naturales**: Simulación de temblor humano realista

### Sincronización Temporal
- **Cálculo automático**: Velocidad de scroll adaptada a cada duración
- **Progreso visual**: Información en tiempo real del avance
- **Timing perfecto**: El camino termina exactamente con el script

### Movimientos Realistas
- **Escala Musical**: Transiciones escalonadas con suavizado
- **Twinkle Twinkle**: Vibrato musical con oscilaciones naturales
- **Mary Had a Little Lamb**: Armónicos complejos múltiples

## 🎵 Mapeo de Notas a Ángulos

```python
# Rango de movimiento del exobrazo
MIN_ANGLE = 30°   # Posición más alta (extensión máxima)
MAX_ANGLE = 135°  # Posición más baja (flexión máxima)

# Ejemplos de mapeo por ejercicio:
# Escala Musical: 135° (Do grave) → 30° (Do agudo)
# Twinkle Twinkle: 110° (C) → 35° (A)
# Mary Had a Little Lamb: 120° (C) → 60° (E)
```

## 🎮 Cuenta Atrás Estilo Videojuego

La interfaz incluye una cuenta atrás visual que aparece al iniciar cualquier ejercicio:

- **3**: Número grande en rojo con efecto de pulso
- **2**: Transición suave con animación
- **1**: Preparación final
- **¡YA!**: Texto en verde con partículas y efectos especiales

## 🐛 Solución de Problemas

### Script no se ejecuta:
```bash
# Verificar permisos
chmod +x simulate_*.py

# Verificar Python
python3 --version

# Verificar ROS
rostopic list
```

### No hay comunicación:
```bash
# Verificar tópico
rostopic echo /angle_topic

# Verificar rosbridge
rostopic list | grep rosbridge
```

### Sincronización incorrecta:
- Asegúrate de seleccionar el ejercicio correcto en la interfaz
- Verifica que el script corresponda al ejercicio seleccionado
- Reinicia tanto el script como la interfaz si es necesario

## 📊 Información de Debug

Cada script proporciona información detallada durante la ejecución:

```
🎵 Iniciando simulación de [Ejercicio]
⏱️  Duración total: [X] segundos ([X] minutos exactos)
📍 Moviendo a posición inicial... ([X]s)
🎼 [Fase del ejercicio] ([X] segundos)
   🎵 [Nota] ([X]°)
✅ [Ejercicio] completado!
⏱️  Tiempo total: [X.X] segundos
```

## 🎯 Calibración y Validación

Los scripts están calibrados para:
- **Duración exacta**: Cada script dura exactamente el tiempo especificado
- **Movimientos realistas**: Basados en patrones de rehabilitación reales
- **Sincronización perfecta**: El camino visual coincide 100% con el movimiento simulado
- **Feedback musical**: Las notas se activan en el momento preciso

¡Disfruta de tu experiencia de rehabilitación musical! 🎵🦾 