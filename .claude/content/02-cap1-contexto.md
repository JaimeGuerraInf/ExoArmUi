# Capítulo 1: Introducción

---

## 1.1 Contexto y motivación

Las enfermedades neurológicas y las lesiones musculoesqueléticas del miembro superior constituyen una de las principales causas de discapacidad funcional en la población adulta. Patologías como el ictus cerebrovascular, la parálisis parcial post-traumática o las lesiones crónicas del codo —epicondilitis, luxaciones, contracturas post-inmovilización— requieren programas de rehabilitación motora prolongados que demandan tanto recursos humanos especializados como equipamiento clínico apropiado. En España, según datos del Instituto Nacional de Estadística, más de 1,3 millones de personas presentan algún grado de discapacidad motora en miembros superiores, lo que pone de relieve la necesidad de desarrollar herramientas de rehabilitación accesibles, reproducibles y motivadoras.

En este contexto, la robótica de rehabilitación ha emergido como un campo de investigación de gran proyección. Los exoesqueletos de miembro superior permiten asistir, guiar y monitorizar el movimiento articular del paciente de forma cuantitativa y repetible, superando las limitaciones inherentes a la terapia manual. Sin embargo, los sistemas comerciales disponibles —como el ArmeoSpring de Hocoma o el ARMin de ETH Zürich— presentan un coste elevado y una complejidad de uso que los restringe a entornos hospitalarios especializados, dejando fuera del alcance de centros docentes y clínicas de menor dimensión las posibilidades de la rehabilitación robótica asistida.

Desde el punto de vista educativo, los estudiantes de fisioterapia y de ingeniería biomédica necesitan entornos donde experimentar con protocolos de rehabilitación antes de trabajar directamente con pacientes reales. La disponibilidad de simuladores accesibles y económicos que reproduzcan fielmente las condiciones de una sesión terapéutica real —incluyendo retroalimentación en tiempo real del ángulo articular— representa un recurso pedagógico de gran valor.

A esta necesidad se suma el creciente interés científico por la Terapia Musical Soportada (*Music-Supported Therapy*, MST), un enfoque que combina estimulación auditiva rítmica con actividad motora repetitiva. Estudios como los de Schneider et al. (2007) y Thaut y Hoemberg (2015) han demostrado que el uso de música durante la rehabilitación motora post-ictus activa mecanismos de neuroplasticidad que aceleran la recuperación funcional del miembro superior, mejoran la coordinación y aumentan la motivación del paciente durante el ejercicio. La MST aprovecha la estrecha relación entre el sistema auditivo y el sistema motor del cerebro para convertir la música en una guía cinética natural.

El presente proyecto nace de la convergencia de estas tres necesidades: el acceso a tecnología de rehabilitación robótica de bajo coste, la simulación educativa para futuros fisioterapeutas y la integración de terapia musical en el proceso de rehabilitación. Se propone el desarrollo de una interfaz web interactiva que, conectada a un exoesqueleto de brazo de bajo coste (kit EduExo con Arduino Uno) a través de ROS (*Robot Operating System*) y WebSocket, permita ejecutar ejercicios de rehabilitación de codo sincronizados con melodías musicales, monitorizar el ángulo articular en tiempo real y registrar el rendimiento del usuario.

La elección de una arquitectura web basada en React y ROS responde a la necesidad de portabilidad, facilidad de despliegue y compatibilidad con estándares de la robótica académica. La comunicación vía rosbridge_server permite que la interfaz funcione en cualquier navegador moderno sin instalación de software adicional en el equipo del usuario, y el modo de simulación —mediante scripts Python que publican ángulos sintéticos en ROS— garantiza la utilidad de la herramienta incluso en ausencia de hardware físico.

---

## 1.2 Objetivos generales y específicos

El objetivo general de este proyecto es desarrollar un sistema completo de interfaz gráfica interactiva que permita simular, controlar y evaluar ejercicios de rehabilitación del miembro superior (articulación de codo) mediante un exoesqueleto robótico, incorporando elementos de terapia musical para mejorar la experiencia terapéutica. Este objetivo general se desglosa en los siguientes objetivos específicos:

- Diseñar e implementar una interfaz gráfica de usuario (GUI) intuitiva y amigable, basada en tecnología web (ReactJS), que facilite la comunicación entre el usuario (fisioterapeuta o estudiante) y el exoesqueleto de brazo simulado. La interfaz debe permitir ingresar los parámetros de la sesión de rehabilitación de forma sencilla y mostrar información en tiempo real del progreso del ejercicio.

- Integrar una simulación de terapia musical en la interfaz, de modo que el ejercicio de rehabilitación se sincronice con estímulos musicales o sonoros. Esto implica desarrollar funciones que reproduzcan música o ritmos durante la sesión y que utilicen la música como guía para el paciente, recreando principios de la MST dentro de la aplicación para aumentar la motivación y participación del usuario.

- Implementar la comunicación en tiempo real con ROS para el control del exoesqueleto simulado. Específicamente, configurar ROS Noetic en WSL2 con los nodos necesarios para simular el comportamiento del exoesqueleto de codo, y utilizar rosbridge junto con ROSLIB.js para intercambiar mensajes entre la interfaz web y el backend ROS.

- Visualizar datos y métricas de la sesión de forma clara y útil, mostrando mediante gráficas la evolución del ángulo articular, la amplitud de movimiento alcanzada, el número de repeticiones completadas y la puntuación del ejercicio.

- Asegurar un enfoque educativo y clínico en el diseño del sistema, incluyendo contenido pedagógico para estudiantes y criterios de uso apropiados para entornos de rehabilitación.

- Incorporar consideraciones de usabilidad y experiencia de usuario (UX), con diseño visual moderno basado en glassmorphism, animaciones no intrusivas y retroalimentación constante al usuario.

- Desarrollar la aplicación aplicando buenas prácticas de ingeniería del software, documentando el código y produciendo guías de instalación y uso.

- Probar y validar el sistema mediante casos de uso simulados, asegurando que cumple con los requisitos funcionales básicos: conexión estable con ROS, visualización precisa, reproducción de audio sincronizada y registro correcto de la puntuación.

---

## 1.3 Alcance del proyecto

El presente proyecto se enmarca dentro del ámbito de la informática aplicada a la salud, más concretamente en el desarrollo de una herramienta interactiva para la simulación de terapias de rehabilitación de codo. El sistema se ha diseñado para integrarse con el exoesqueleto educativo EduExo, un kit desarrollado por Löffl et al. (2019), el cual permite monitorizar el ángulo de flexión y extensión de la articulación del codo mediante sensores analógicos conectados a una placa Arduino.

Este proyecto no pretende sustituir herramientas médicas reales ni sistemas clínicos certificados, sino servir como entorno de simulación orientado a la docencia y experimentación en fisioterapia. Se centra exclusivamente en la monitorización pasiva del ángulo articular, sin generar movimientos mecánicos activos. De esta forma, permite al estudiante de fisioterapia visualizar en tiempo real la evolución de un ejercicio, asociarlo a una melodía específica y reflexionar sobre la biomecánica y el rango de movilidad articular afectado.

El sistema está limitado a:

- Captura de movimientos de flexión-extensión del codo humano mediante potenciómetro analógico y Arduino
- Visualización de datos en tiempo real desde ROS en una interfaz web desarrollada en React
- Sincronización de patrones de movimiento con melodías infantiles seleccionadas por su estructura repetitiva y simplicidad rítmica
- Soporte para modo simulación sin hardware físico mediante scripts Python

Este TFG no contempla la validación clínica con pacientes ni la intervención directa en procesos de rehabilitación médica. No obstante, sienta las bases para futuras ampliaciones más especializadas y validadas.

> Referencia: Löffl, M. (2019). *EduExo — The Robotic Exoskeleton Kit Handbook*. ISBN: 978-3-9820934-0-1

---

## 1.4 Metodología de trabajo

El enfoque metodológico seguido ha sido de tipo descriptivo, iterativo y constructivo, partiendo del análisis de tecnologías existentes hasta llegar a la implementación funcional del prototipo. Se ha utilizado una combinación de métodos de ingeniería del software y experimentación en entornos de simulación robótica, siguiendo las etapas habituales de desarrollo: análisis, diseño, implementación, pruebas y validación.

- **Fase de investigación y análisis:** se identificaron tecnologías viables para la comunicación entre el hardware (Arduino + EduExo) y ROS, así como los frameworks adecuados para el desarrollo frontend. También se revisaron antecedentes clínicos relacionados con la rehabilitación de codo y el uso de melodías como estimulación motora.

- **Fase de diseño:** se estructuró la arquitectura del sistema, incluyendo la integración entre ROS y React mediante rosbridge_server y la especificación de los componentes principales de la interfaz. Se diseñaron los ejercicios musicales con base en progresiones angulares coherentes con protocolos fisioterapéuticos.

- **Fase de desarrollo:** se implementó el sistema en ROS y React, utilizando herramientas como Chart.js, ROSLIB.js y Framer Motion para la visualización. Se empleó una metodología ágil e incremental, probando cada componente en simulación antes de su integración final.

- **Fase de pruebas y evaluación:** se realizaron pruebas funcionales del sistema con estudiantes, comprobando la visualización en tiempo real, la conexión ROS-WebSocket, y la correcta correspondencia entre ángulos y notas musicales.

La metodología empleada toma elementos de la Ingeniería del Software Ágil (Sommerville, 2011), adaptada al contexto de sistemas embebidos y visualización interactiva.

> Referencia: Sommerville, I. (2011). *Software Engineering* (9th ed.). Pearson.

---

## 1.5 Estructura del documento

Este documento está organizado en once capítulos que siguen un orden lógico para exponer de forma clara tanto el marco teórico como el proceso técnico y clínico del proyecto:

- **Capítulo 1: Introducción.** Se presentan el contexto, la motivación, los objetivos, el alcance y la metodología del trabajo.
- **Capítulo 2: Estado del arte.** Se analizan antecedentes relevantes sobre exoesqueletos, interfaces musicales terapéuticas y herramientas similares existentes.
- **Capítulo 3: Fundamento clínico y justificación didáctica.** Se describen las lesiones que pueden beneficiarse de esta herramienta, así como su aplicabilidad en entornos docentes.
- **Capítulo 4: Requisitos del sistema.** Se especifican los requisitos funcionales y no funcionales, junto con los casos de uso.
- **Capítulo 5: Tecnologías empleadas.** Se explica la elección e integración de los distintos componentes hardware y software.
- **Capítulo 6: Diseño de la interfaz y arquitectura.** Se detalla la estructura de la interfaz web y su interacción con ROS.
- **Capítulo 7: Implementación.** Se documenta el desarrollo técnico del sistema, con especial énfasis en la integración de datos y gráficos.
- **Capítulo 8: Diseño de ejercicios.** Se explican los ejercicios musicales implementados, su lógica terapéutica y patrones de movimiento asociados.
- **Capítulo 9: Evaluación y resultados.** Se presentan los resultados de las pruebas realizadas con usuarios y los criterios de evaluación seguidos.
- **Capítulo 10: Conclusiones y trabajo futuro.** Se resumen los logros alcanzados, limitaciones detectadas y futuras líneas de mejora.
- **Capítulo 11: Bibliografía.** Se listan todas las fuentes consultadas en formato APA.

Adicionalmente, se incluyen anexos con capturas de pantalla, fragmentos de código relevantes y documentación de soporte.
