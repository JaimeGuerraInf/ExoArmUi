# Capítulo 4: Requisitos del sistema

---

## 4.1 Introducción al análisis de requisitos

El análisis de requisitos constituye una fase fundamental en el desarrollo de cualquier sistema software, ya que establece de manera formal y verificable qué debe hacer el sistema (*requisitos funcionales*) y bajo qué condiciones de calidad y restricciones debe hacerlo (*requisitos no funcionales*). Para este proyecto se ha adoptado el enfoque de la ingeniería de requisitos descrito por Sommerville (2011), que distingue entre requisitos de usuario —expresados en lenguaje natural orientado al cliente— y requisitos de sistema —especificaciones técnicas precisas utilizadas durante el diseño e implementación.

La elicitación de requisitos se llevó a cabo mediante el análisis de los objetivos clínicos y didácticos del sistema (capítulos 1 y 3), el estudio de proyectos similares (capítulo 2) y el refinamiento iterativo con el equipo de desarrollo. El resultado es un catálogo de diez requisitos funcionales y ocho requisitos no funcionales que rigen la totalidad del sistema.

---

## 4.2 Requisitos funcionales

Los requisitos funcionales describen las capacidades que el sistema debe ofrecer a sus actores. Se identifican con el prefijo **RF** y se priorizan según el modelo MoSCoW: **Alta** (Must have), **Media** (Should have) y **Baja** (Could have).

| ID | Descripción | Prioridad |
|----|-------------|-----------|
| RF01 | El sistema debe mostrar el ángulo articular del codo en tiempo real, obtenido del sensor Arduino o del simulador, con una frecuencia de actualización mínima de 30 Hz. | Alta |
| RF02 | El sistema debe permitir al usuario iniciar y detener ejercicios musicales de rehabilitación desde la interfaz web, enviando los comandos correspondientes al sistema ROS. | Alta |
| RF03 | El sistema debe reproducir retroalimentación auditiva (notas musicales) cuando el ángulo articular del usuario alcance la zona objetivo de cada nota durante el ejercicio activo. | Alta |
| RF04 | El sistema debe mostrar una visualización gráfica de trayectoria en tiempo real que represente la evolución del ángulo articular a lo largo del ejercicio, diferenciando la trayectoria ideal de la trayectoria real. | Alta |
| RF05 | El sistema debe calcular y mostrar una puntuación de desempeño al finalizar cada ejercicio, basada en el número de notas alcanzadas correctamente respecto al total del ejercicio. | Alta |
| RF06 | El sistema debe ofrecer un modo de calibración que permita ajustar los límites de rango de movimiento del sensor hardware, publicando los comandos de calibración al tópico ROS correspondiente. | Alta |
| RF07 | El sistema debe operar en modo de simulación, sin necesidad de hardware físico Arduino, ejecutando scripts simuladores que publican ángulos al tópico `/angle_topic` a través de ROS. | Media |
| RF08 | El sistema debe mostrar el estado de conexión con el servidor ROS (*rosbridge*) en la interfaz, indicando de forma visible si la conexión WebSocket está activa o interrumpida. | Media |
| RF09 | El sistema debe mantener un historial de sesiones de ejercicio por usuario que pueda consultarse desde la sección de progreso de la interfaz web. | Media |
| RF10 | El sistema debe soportar al menos tres ejercicios musicales distintos (Escala musical, *Twinkle Twinkle Little Star* y *Mary Had a Little Lamb*), cada uno con su propia secuencia de notas y asignación de ángulos objetivo. | Alta |

---

## 4.3 Requisitos no funcionales

Los requisitos no funcionales establecen las restricciones de calidad, rendimiento y entorno bajo las que el sistema debe operar. Se identifican con el prefijo **RNF**.

| ID | Categoría | Descripción |
|----|-----------|-------------|
| RNF01 | Rendimiento | La latencia extremo a extremo desde la lectura del sensor hasta la actualización visual en el navegador no debe superar los 33 ms (equivalente a 30 fotogramas por segundo), garantizando una retroalimentación perceptualmente inmediata para el usuario. |
| RNF02 | Portabilidad | El sistema debe funcionar íntegramente desde un navegador web estándar sin necesidad de instalar software adicional en el equipo del usuario. Los navegadores objetivo son Google Chrome (v100+) y Mozilla Firefox (v100+). |
| RNF03 | Disponibilidad | El servidor de desarrollo debe estar disponible durante toda la sesión terapéutica sin reinicios manuales. El cliente WebSocket debe implementar reconexión automática ante caídas de la conexión con *rosbridge*. |
| RNF04 | Usabilidad | La interfaz debe ser operable por estudiantes de fisioterapia sin formación técnica en robótica o ROS. Todas las acciones principales deben ser accesibles en un máximo de dos clics desde la pantalla principal. |
| RNF05 | Coste | La solución completa debe poder desplegarse con hardware de bajo coste: un kit EduExo (< 150 €) y un ordenador de uso general. No se requieren licencias de software propietario. |
| RNF06 | Mantenibilidad | El código fuente debe seguir una arquitectura de componentes React con separación clara entre lógica de comunicación (hooks), datos (archivos de configuración de ejercicios) y presentación (componentes y hojas de estilo). |
| RNF07 | Escalabilidad | El diseño del sistema debe permitir añadir nuevos ejercicios musicales sin modificar la lógica de comunicación ROS ni la interfaz general, únicamente agregando entradas al archivo de definición de ejercicios. |
| RNF08 | Seguridad | La comunicación WebSocket entre el navegador y *rosbridge* se restringe a la red local (localhost / red interna del laboratorio). No se expone ningún servicio ROS a redes externas. |

---

## 4.4 Actores del sistema

El análisis de casos de uso identifica tres actores que interactúan con el sistema:

**Fisioterapeuta / Estudiante de fisioterapia.** Es el actor principal. Utiliza la interfaz web para seleccionar y lanzar ejercicios, supervisar el ángulo articular del paciente o del propio brazo en simulación, consultar el progreso histórico y calibrar el sistema cuando sea necesario. En el contexto didáctico, el mismo usuario actúa simultáneamente como operador del sistema y como sujeto de la rehabilitación.

**Sistema ROS (rosbridge).** Actor externo de tipo sistema. Actúa como intermediario entre la interfaz web y el hardware Arduino. Recibe comandos publicados por el navegador (inicio/parada de ejercicio, calibración) y emite los ángulos articulares capturados por el sensor o el simulador. La comunicación se establece mediante WebSocket en el puerto 9090.

**Hardware Arduino (EduExo).** Actor externo de tipo dispositivo. Lee el ángulo articular mediante un potenciómetro analógico y lo transmite al puente TCP mediante comunicación serie USB (115200 baudios). Solo interviene en sesiones con hardware físico; en modo de simulación este actor es reemplazado por los scripts simuladores.

---

## 4.5 Diagrama de casos de uso

A continuación se describen los principales casos de uso del sistema, estructurados por actor principal. La figura correspondiente al diagrama UML se referencia como **Figura 4.1**.

### CU-01: Iniciar ejercicio musical

- **Actor principal:** Fisioterapeuta / Estudiante
- **Precondición:** El sistema está conectado a *rosbridge* (RF08 satisfecho). El usuario ha seleccionado un ejercicio de la lista.
- **Flujo principal:** El usuario pulsa "Iniciar ejercicio". El sistema publica el comando `start_<tipo>` en el tópico `/exercise_control`. El servidor ROS recibe el comando y activa el modo de ejercicio. El sistema comienza a comparar el ángulo recibido con la secuencia de notas del ejercicio seleccionado.
- **Flujo alternativo:** Si la conexión con *rosbridge* está inactiva, el sistema muestra un aviso de conexión y bloquea el botón de inicio.
- **Postcondición:** El ejercicio está en curso; la visualización de trayectoria y la retroalimentación auditiva están activas.

### CU-02: Monitorizar ángulo articular en tiempo real

- **Actor principal:** Fisioterapeuta / Estudiante
- **Actor secundario:** Sistema ROS / Hardware Arduino
- **Precondición:** El sistema está suscrito al tópico `/angle_topic`.
- **Flujo principal:** El sensor Arduino publica el ángulo bruto vía TCP → puente ROS → `/angle_topic`. El hook `useRosAngle` recibe el valor, aplica la conversión de espacio de ángulos si corresponde y actualiza el estado del componente. El gráfico de trayectoria y el indicador de ángulo numérico se actualizan en cada trama recibida.
- **Postcondición:** La interfaz refleja el ángulo articular actual con una latencia inferior a 33 ms.

### CU-03: Calibrar el sistema

- **Actor principal:** Fisioterapeuta / Estudiante
- **Precondición:** El hardware Arduino está conectado y el tópico `/calibration_command` está disponible.
- **Flujo principal:** El usuario accede a la sección de configuración y pulsa "Calibrar". El sistema publica el comando `calibrate` en `/calibration_command`. El nodo ROS procesa la calibración y publica el resultado en `/calibration_status`. La interfaz actualiza el indicador de estado de calibración.
- **Postcondición:** El sistema está calibrado y listo para realizar ejercicios con los límites de ángulo correctos.

### CU-04: Consultar progreso histórico

- **Actor principal:** Fisioterapeuta / Estudiante
- **Precondición:** El usuario ha completado al menos una sesión de ejercicio.
- **Flujo principal:** El usuario navega a la sección "Progreso". El sistema recupera y presenta el historial de sesiones, mostrando la puntuación obtenida, el ejercicio realizado y la fecha de cada sesión.
- **Postcondición:** El usuario tiene visibilidad del progreso acumulado a lo largo de las sesiones.

### CU-05: Ejecutar ejercicio en modo simulación

- **Actor principal:** Fisioterapeuta / Estudiante
- **Precondición:** ROS core y *rosbridge* están activos en WSL. El usuario ejecuta uno de los scripts simuladores (`simulate_twinkle_perfect.py`, `simulate_escala_musical.py` o `simulate_mary_perfect.py`).
- **Flujo principal:** El script simulador publica ángulos en espacio visual (45–180°) al tópico `/angle_topic` a 60 Hz. La interfaz los recibe y procesa de forma idéntica a como lo haría con el hardware real.
- **Postcondición:** El ejercicio se desarrolla completamente sin necesidad de hardware Arduino, permitiendo validación funcional y uso didáctico.

---

## 4.6 Trazabilidad entre requisitos y casos de uso

La siguiente tabla relaciona los casos de uso identificados con los requisitos funcionales que satisfacen, garantizando la cobertura completa del catálogo de requisitos.

| Caso de uso | Requisitos funcionales cubiertos |
|-------------|----------------------------------|
| CU-01: Iniciar ejercicio | RF02, RF03, RF04 |
| CU-02: Monitorizar ángulo | RF01, RF04, RF08 |
| CU-03: Calibrar sistema | RF06 |
| CU-04: Consultar progreso | RF05, RF09 |
| CU-05: Simulación sin hardware | RF07, RF10 |

Todos los requisitos no funcionales (RNF01–RNF08) aplican transversalmente al conjunto del sistema y se verifican mediante las pruebas descritas en el capítulo 9.
