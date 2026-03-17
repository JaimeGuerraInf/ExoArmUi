# Resumen + Abstract + Descriptores

---

## Resumen

Este Trabajo de Fin de Grado presenta el diseño e implementación de una interfaz web interactiva para la rehabilitación del codo mediante terapia musical asistida por un exoesqueleto de brazo. El sistema integra hardware accesible (kit EduExo con Arduino Uno) con ROS (Robot Operating System) y una aplicación frontend desarrollada en React, formando una plataforma de bajo coste orientada tanto a la docencia en fisioterapia como a la experimentación clínica.

La motivación clínica surge de la necesidad de herramientas accesibles y motivadoras para la rehabilitación de lesiones del codo, como la epicondilitis, luxaciones o secuelas post-ictus. La Terapia Musical Soportada (MST, *Music-Supported Therapy*) ha demostrado beneficios neurológicos y motores en la recuperación de movimiento, al combinar estimulación auditiva rítmica con actividad motora repetitiva.

Desde el punto de vista técnico, el sistema captura el ángulo de flexión-extensión del codo a través de un potenciómetro conectado al Arduino, transmite los datos mediante un puente TCP a ROS Noetic en WSL2 y los expone a la interfaz web a través de rosbridge_server vía WebSocket. La interfaz permite ejecutar tres ejercicios musicales sincronizados con melodías (Escala musical, *Twinkle Twinkle Little Star* y *Mary Had a Little Lamb*), visualizar el movimiento en tiempo real mediante Chart.js y registrar la puntuación del paciente.

La principal contribución es una herramienta web abierta, basada en ROS, que integra terapia musical con rehabilitación motora sin requerir hardware clínico especializado, permitiendo además su uso en modo simulación sin hardware físico.

**Palabras clave:** exoesqueleto, rehabilitación motora, terapia musical, ROS, React, WebSocket, interfaz web

---

## Abstract

This Bachelor's Thesis presents the design and implementation of an interactive web interface for elbow rehabilitation using music-supported therapy assisted by a robotic arm exoskeleton. The system integrates accessible hardware (EduExo kit with Arduino Uno) with ROS (Robot Operating System) and a React-based frontend application, forming a low-cost platform designed for both physiotherapy education and clinical experimentation.

The clinical motivation stems from the need for accessible and engaging tools for elbow rehabilitation in conditions such as lateral epicondylitis, dislocations, or post-stroke sequelae. Music-Supported Therapy (MST) has demonstrated neurological and motor benefits in movement recovery by combining rhythmic auditory stimulation with repetitive motor activity.

From a technical perspective, the system captures the elbow flexion-extension angle via a potentiometer connected to an Arduino, transmits the data through a TCP bridge to ROS Noetic running on WSL2, and exposes it to the web interface through rosbridge_server over WebSocket. The interface allows users to perform three music-synchronised exercises (*Musical Scale*, *Twinkle Twinkle Little Star* and *Mary Had a Little Lamb*), visualise movement in real time using Chart.js, and record the patient's performance score.

The main contribution is an open, ROS-based web tool that integrates music therapy with motor rehabilitation without requiring specialised clinical hardware, while also supporting a simulation mode for use without physical hardware.

**Keywords:** exoskeleton, motor rehabilitation, music therapy, ROS, React, WebSocket, web interface

---

## Descriptores

1. Exoesqueleto de rehabilitación
2. Terapia Musical Soportada (MST)
3. Robot Operating System (ROS)
4. Interfaz web reactiva
5. Rehabilitación motora del codo
