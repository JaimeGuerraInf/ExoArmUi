# Capítulo 2: Estado del arte — Proyectos similares y herramientas comparables

> **Nota:** Este archivo contiene únicamente la subsección 2.3 (Proyectos similares). Las secciones 2.1 (Exoesqueletos de brazo y rehabilitación robótica) y 2.2 (Tecnologías musicales en terapia motora) ya están redactadas en `docs/TFGInformatica.docx` y se integrarán tal cual en el documento final.

---

## 2.3 Sistemas comparables: interfaces de rehabilitación con retroalimentación musical o robótica

Una vez revisados los antecedentes sobre exoesqueletos y terapia musical por separado, es necesario analizar los sistemas que combinan ambas dimensiones o que se aproximan a la propuesta de este TFG desde distintos ángulos. A continuación se describen cuatro sistemas representativos, seguidos de una tabla comparativa y un análisis de la brecha que cubre este proyecto.

### 2.3.1 MusicGlove (Flint Rehabilitation Devices)

MusicGlove es un dispositivo de rehabilitación de la mano que combina un guante instrumentado con sensores de presión y un videojuego musical inspirado en *Guitar Hero*. El paciente realiza movimientos de pinza y agarre sincronizados con estímulos visuales y auditivos en pantalla, recibiendo puntuación en tiempo real. Estudios clínicos han demostrado mejoras significativas en la función manual post-ictus tras sesiones de 30 minutos durante dos semanas (Friedman et al., 2014).

Desde el punto de vista técnico, MusicGlove utiliza firmware propietario en microcontrolador ARM y una aplicación de escritorio en Windows. No ofrece integración con ROS ni acceso abierto al software, lo que limita su adaptación a otros segmentos articulares o su uso en entornos de investigación académica.

### 2.3.2 ArmeoSpring (Hocoma AG)

El ArmeoSpring es un exoesqueleto pasivo de miembro superior con compensación gravitacional que incorpora una suite de software clínico (*ArmeoPower Software*) con videojuegos terapéuticos y métricas de seguimiento. Su rango de actuación cubre hombro, codo y muñeca, y permite tanto modo activo-asistido como modo libre.

Aunque representa el estándar de referencia en rehabilitación robótica comercial, su coste supera los 30.000 € y su software es cerrado y no personalizable. No incorpora terapia musical propiamente dicha —los ejercicios son videojuegos visuales sin retroalimentación auditiva rítmica— y no permite conexión con ROS. Su uso queda restringido a hospitales de tercer nivel y centros de neurorrehabilitación especializados.

### 2.3.3 ReJoyce (Ré Interactive Technologies)

ReJoyce es una estación de rehabilitación de miembro superior que combina un manipulador instrumentado de 5 grados de libertad con juegos terapéuticos en pantalla. Permite monitorizar fuerza de agarre, supinación/pronación, flexoextensión de muñeca y actividad funcional de los dedos. El software incluye perfiles de paciente y seguimiento longitudinal.

Al igual que los anteriores, ReJoyce no integra retroalimentación musical rítmica ni está basado en tecnologías web abiertas. Requiere hardware específico de su fabricante y no permite simulación sin el dispositivo físico.

### 2.3.4 Prototipo ROS-Music (Universidad de Trento, 2021)

Un grupo de investigación de la Universidad de Trento publicó en 2021 un prototipo experimental que combina un exoesqueleto de codo de bajo coste con retroalimentación auditiva mediante síntesis MIDI en tiempo real, publicando los ángulos articulares a través de ROS y generando notas proporcionales al ángulo de flexión (Gandolfi et al., 2021). El sistema demostró la viabilidad técnica del enfoque pero careció de interfaz gráfica de usuario, no dispuso de modo simulación y no fue publicado como software de código abierto.

Este trabajo es el más cercano conceptualmente al presente TFG y confirma la pertinencia del enfoque, pero deja abierto el espacio para una implementación completa, usable y reproducible.

---

## 2.4 Tabla comparativa

| Sistema | Hardware | Software | Integración musical | ROS | Código abierto | Simulación sin HW |
|---|---|---|---|---|---|---|
| MusicGlove | Guante + sensores presión | Propietario (Windows) | Sí (videojuego musical) | No | No | No |
| ArmeoSpring | Exo. pasivo 6-DOF | Propietario (clínico) | No (solo visual) | No | No | No |
| ReJoyce | Manipulador 5-DOF | Propietario | No | No | No | No |
| ROS-Music (Trento) | Exo. codo bajo coste | ROS + MIDI | Sí (síntesis MIDI) | Sí | No | No |
| **Este TFG** | **EduExo + Arduino** | **React + ROS Noetic** | **Sí (MST, 3 ejercicios)** | **Sí** | **Sí** | **Sí** |

---

## 2.5 Análisis de la brecha tecnológica

Del análisis anterior se desprenden cuatro carencias comunes que este proyecto busca cubrir:

1. **Accesibilidad económica.** Los sistemas comerciales (ArmeoSpring, ReJoyce) tienen un coste prohibitivo para entornos docentes. El kit EduExo tiene un coste inferior a 300 €, incluyendo Arduino, lo que permite su adquisición por universidades y centros de formación.

2. **Arquitectura web y portabilidad.** Ninguno de los sistemas analizados ofrece una interfaz ejecutable en navegador sin instalación de software propietario. La arquitectura React + rosbridge de este TFG permite acceder a la herramienta desde cualquier equipo con navegador moderno conectado a la red local.

3. **Integración real de terapia musical (MST).** MusicGlove usa música como ambientación lúdica pero no implementa los principios de la MST (sincronización motora auditiva, correspondencia nota-ángulo). Este TFG diseña ejercicios donde cada nota musical corresponde a un ángulo objetivo específico, alineándose con los principios de la MST.

4. **Modo simulación y código abierto.** Ningún sistema analizado permite operar sin hardware físico ni publica su código fuente. Este TFG incluye simuladores Python que publican ángulos sintéticos en ROS, facilitando su uso en aulas sin hardware, y el código fuente es público en el repositorio del proyecto.
