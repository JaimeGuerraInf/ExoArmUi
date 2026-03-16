# 🦾 Exobrazo Rehab — Guía de Inicio Rápido

## ⚡ Resumen Visual

```
Arduino (COM3)
     │  USB
     ▼
[Windows] arduino_to_wsl.py  ──TCP:9999──▶  [WSL] tcp_ros_bridge.py
                                                        │
                                                        ▼ /angle_topic
                                              [WSL] rosbridge :9090
                                                        │
                                                        ▼ WebSocket
                                              [Browser] localhost:3000
```

---

## 🚀 Pasos de Inicio (en orden)

### 1️⃣ Terminal WSL — ROS Core
```bash
source /opt/ros/noetic/setup.bash
source ~/catkin_ws/devel/setup.bash
roscore
```
✅ Espera hasta ver: `started core service [/rosout]`

---

### 2️⃣ Terminal WSL (nueva pestaña) — Rosbridge WebSocket
```bash
source /opt/ros/noetic/setup.bash
source ~/catkin_ws/devel/setup.bash
roslaunch rosbridge_server rosbridge_websocket.launch
```
✅ Espera hasta ver: `Rosbridge WebSocket server started at ws://0.0.0.0:9090`

---

### 3️⃣ Terminal WSL (nueva pestaña) — Puente TCP Arduino
```bash
source /opt/ros/noetic/setup.bash
source ~/catkin_ws/devel/setup.bash
python3 ~/catkin_ws/src/exo_arm/scripts/tcp_ros_bridge.py
```
✅ Verás: `🔵 Esperando conexión desde Windows...`

---

### 4️⃣ Terminal Windows CMD/PowerShell — Leer Arduino y enviar a WSL
```powershell
cd c:\Users\jaime\exo-arm-ui
python scripts\arduino_to_wsl.py
```
✅ Verás: `Conectado a WSL. Enviando angulos...`
✅ En WSL verás: `✅ Conectado desde Windows`

---

### 5️⃣ Terminal Windows (nueva) — Aplicación Web
```powershell
cd c:\Users\jaime\exo-arm-ui
npm start
```
✅ Se abre el navegador en `http://localhost:3000`
✅ La app mostrará **"Conectado"** en verde

---

## 🎮 Modo Simulación (sin Arduino)

Si no tienes el Arduino conectado, puedes usar los scripts de simulación.
Solo necesitas los pasos 1, 2, 5 y además:

```bash
# WSL — en vez del paso 3 y 4, ejecuta uno de estos:
source /opt/ros/noetic/setup.bash
python3 ~/simulate_twinkle.py          # Twinkle Twinkle
python3 ~/simulate_escala_musical.py   # Escala Musical
python3 ~/simulate_mary.py             # Mary Had a Lamb
```

---

## 🧩 Resumen de Terminales

| # | Dónde        | Comando                                      | Para qué                  |
|---|--------------|----------------------------------------------|---------------------------|
| 1 | WSL          | `roscore`                                    | Motor de ROS              |
| 2 | WSL          | `roslaunch rosbridge_server ...`             | WebSocket para la app     |
| 3 | WSL          | `python3 .../tcp_ros_bridge.py`              | Recibe ángulos de Windows |
| 4 | Windows      | `python scripts\arduino_to_wsl.py`           | Lee Arduino → envía a WSL |
| 5 | Windows      | `npm start`                                  | Abre la app web           |

---

## 🔧 Solución de Problemas

| Síntoma | Causa probable | Solución |
|---------|---------------|----------|
| App muestra "Sin conexión ROS" | Rosbridge no está corriendo | Ejecutar paso 2 |
| `tcp_ros_bridge` no recibe datos | `arduino_to_wsl.py` no está corriendo | Ejecutar paso 4 |
| Error COM3 no encontrado | Arduino no conectado o puerto distinto | Conectar USB o cambiar `COM3` en `arduino_to_wsl.py` |
| `roscore` da error de URI | Ya hay un roscore corriendo | No pasa nada, continuar con paso 2 |
| Ángulos no se mueven en la app | ROS publica pero app no conecta | Verificar que rosbridge esté en el paso 2 |

---

## 📁 Scripts Clave

```
exo-arm-ui/
├── scripts/
│   ├── arduino_to_wsl.py        ← Windows: lee COM3 y envía a WSL
│   └── simulate_*.py            ← Simulaciones (correr en WSL ~/simulate_*.py)
│
WSL ~/catkin_ws/src/exo_arm/scripts/
├── tcp_ros_bridge.py            ← WSL: recibe ángulos y publica en ROS
└── ros_arm_bridge.py            ← (no se usa en el flujo actual)
```
