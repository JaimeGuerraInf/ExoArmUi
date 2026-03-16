# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Exobrazo Rehab** is a React-based rehabilitation UI for a robotic exoskeleton arm. The browser app connects to a ROS (Robot Operating System) backend via WebSocket (rosbridge) and provides musical exercises that guide arm movement through audio-visual feedback.

## Commands

```bash
npm install     # Install dependencies (first time)
npm start       # Dev server at http://localhost:3000
npm run build   # Production build
npm test        # Run tests (interactive watch mode)
npm test -- --watchAll=false  # Run tests once (CI mode)
```

## System Architecture

The full stack spans three environments:

```
Arduino (COM3/ttyACM0)
     │  USB/Serial (115200 baud)
     ▼
[Windows] scripts/arduino_to_wsl.py  ──TCP:9999──▶  [WSL] catkin_ws/.../tcp_ros_bridge.py
                                                               │
                                                               ▼ /angle_topic (std_msgs/Float64)
                                                     [WSL] rosbridge :9090
                                                               │
                                                               ▼ WebSocket (roslib)
                                                     [Browser] localhost:3000
```

**Key ROS topics:**
- `/angle_topic` (`std_msgs/Float64`) — arm angle from Arduino (45–80° real hardware, 45–180° simulation)
- `/exercise_control` (`std_msgs/String`) — publish `start_<type>` or `stop`
- `/calibration_command` (`std_msgs/String`) — publish `calibrate` or `adjust_limits`
- `/calibration_status` (`std_msgs/Bool`) — subscribe to calibration state

## Frontend Structure

- **`src/hooks/useRosAngle.js`** — central hook; manages roslib WebSocket connection (`localhost:9090`), subscribes to angle/calibration topics, exposes `{ angle, connected, calibrated, startExercise, stopExercise, calibrateSystem, adjustLimits }`.
- **`src/data/exercises.js`** — defines musical exercise sequences (notes, angles, sounds, timing).
- **`src/utils/angleUtils.js`** — `convertInputToVisualAngle` / `convertVisualToInputAngle` for mapping real hardware range (45–80°) ↔ visual range (45–180°).
- **`src/components/EjerciciosMusicales.js`** — main exercise UI; preloads audio from `public/sounds/`, tracks note hits, computes score.
- **`src/components/exercises/TrackingExercise.js`** — real-time scrolling path tracker that renders the arm angle visually.
- **`public/sounds/`** — MP3 files named by musical note (A–G).

## Routing

```
/                → WelcomeScreen
/dashboard       → DashboardHome        (inside DashboardLayout)
/ejercicios      → EjerciciosMusicales  (inside DashboardLayout)
/progreso        → Progress             (inside DashboardLayout)
/configuracion   → Configuracion        (inside DashboardLayout)
```

`BackgroundLayout` wraps all routes; `DashboardLayout` wraps the authenticated sub-routes and renders `SideMenu` + `Navbar`.

## CSS Conventions

Component CSS lives in `src/styles/components/`, layout CSS in `src/styles/layouts/`, globals in `src/styles/global/`. Import paths from a component: `"../styles/components/ComponentName.css"`.

## Simulation (No Hardware)

Run ROS core + rosbridge, then execute a simulator from WSL:

```bash
source /opt/ros/noetic/setup.bash
python3 scripts/simulate_twinkle_perfect.py  # Twinkle Twinkle (150s, synced)
python3 scripts/simulate_escala_musical.py   # Musical Scale (120s)
python3 scripts/simulate_mary_perfect.py     # Mary Had a Little Lamb (180s)
```

Simulators publish at 60 Hz to `/angle_topic` using **visual angle space (45–180°)**.

## Gotchas

**Dual angle spaces** — `useRosAngle.js` silently branches on received values:
- If `rawVal` is in `[45, 80]` → treated as real hardware angle (passed through directly)
- Otherwise → treated as visual/simulation angle (45–180°) and converted via `convertVisualToInputAngle`

Exercise sequences in `src/data/exercises.js` use **visual angles (45–180°)**. The hardware physical range is 45–80°, mapped to 45–180° for display/exercises via `angleUtils.js`.

## ROS Launch (Full Hardware)

```bash
# In WSL, from the catkin workspace:
roslaunch launch/websocket.launch
# Starts rosbridge on :9090 + ros_arm_bridge node reading /dev/ttyACM0 at 115200 baud
```
