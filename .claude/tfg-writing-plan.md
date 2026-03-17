# TFG Documentation Plan — Exobrazo Rehab

## Context

Jaime is writing the TFG memory for the ExoArmUi project at UPSA (Universidad Pontificia de Salamanca). The document must strictly follow the UPSA TFG norms (`docs/NormasEstructuraEstiloMemoriaTFG.pdf`). Partial content already exists in `docs/TFGInformatica.docx`. The workflow is: write content in Markdown here → generate final `.docx` with `python-docx`.

**Title:** Diseño e implementación de una interfaz web para la rehabilitación con exoesqueleto de brazo mediante terapia musical
**Author:** Jaime Guerra Díaz | **Director:** TBD | **Date:** Salamanca, 07 de 2025

---

## Document Structure (UPSA-mandated page order)

```
[Cover page]           — no page number
[Blank page]           — no page number
[Resumen + Abstract + Descriptores]  — Roman numeral iii
[Blank page]           — no page number
[Índice temático]      — starts on odd Roman page
[Índice de Figuras]    — starts on odd Roman page
[Índice de Tablas]     — starts on odd Roman page
[Cap. 1 Introducción]  — Arabic page 1 (resets here)
[Cap. 2 ...]
...
[Bibliografía]
[Anexos]
```

---

## Step-by-Step Writing Plan

Each step = write in Markdown → Jaime reviews → approve → next step.
After all steps: generate `.docx` with full UPSA formatting.

---

### STEP 1 — Resumen + Abstract + Descriptores
**File:** `.claude/content/01-resumen.md`
**Status:** ⬜ Pending
**Rules:** 200–250 words in Spanish. English translation. 3–5 keywords.
**Content to cover:**
- What the system is (exoskeleton + music therapy + ROS + React UI)
- Clinical motivation (elbow rehabilitation, MST therapy)
- Technical approach (rosbridge, WebSocket, simulation)
- Main result / contribution

---

### STEP 2 — Cap. 1: Contexto y motivación
**File:** `.claude/content/02-cap1-contexto.md`
**Status:** ⬜ Pending
**Existing:** Objetivos, Alcance, Metodología, Estructura — all ✅ (only need to be copied/polished)
**Content to write:**
- Clinical context: stroke, neurological injuries, need for accessible rehab tools
- Educational context: physiotherapy students, simulation over real hardware
- Why music therapy (MST — Music-Supported Therapy)
- Why this tool: low-cost, web-based, ROS-connected
- Reference: Löffl (2019), Sommerville (2011)

---

### STEP 3 — Cap. 2: Proyectos similares
**File:** `.claude/content/03-cap2-proyectos-similares.md`
**Status:** ⬜ Pending
**Existing:** Exoesqueletos section ✅, Terapia musical section ✅ — only this subsection is stub
**Content to write:**
- 3–4 comparable systems: MusicGlove, ArmeoSpring, ReJoyce, custom research prototypes
- Comparison table: system / hardware / software / music integration / open source?
- Gap analysis: what this project adds that others don't (web-based, ROS, musical exercises, low-cost)

---

### STEP 4 — Cap. 3: Fundamento clínico y justificación didáctica
**File:** `.claude/content/04-cap3-clinico.md`
**Status:** ⬜ Pending (partial content exists, needs expansion)
**Content to write/expand:**
- Anatomy of elbow joint (existing intro is good, expand slightly)
- Lesiones tratables (epicondilitis, luxaciones, post-ictus) — exists, needs clinical refs
- Music-Supported Therapy (MST): neurological basis, evidence (Schneider 2007, Thaut 2015)
- Justificación didáctica: how it serves physiotherapy students (simulation before real patients)
- Reference: at least 3–4 clinical/educational sources

---

### STEP 5 — Cap. 4: Requisitos del sistema
**File:** `.claude/content/05-cap4-requisitos.md`
**Status:** ⬜ Pending (bullet points exist, need full prose + use case diagram description)
**Content to write:**
- RF01–RF10: Functional requirements in table format (ID / Description / Priority)
- RNF01–RNF08: Non-functional requirements in table format
- Use case diagram description (text + ASCII or reference to figure)
- Main actors: Fisioterapeuta/Estudiante, ROS system, Arduino hardware
- Key use cases: Iniciar ejercicio, Monitorizar ángulo, Calibrar sistema, Ver progreso

---

### STEP 6 — Cap. 5: Tecnologías empleadas
**File:** `.claude/content/06-cap5-tecnologias.md`
**Status:** ⬜ Pending (hardware section partial, backend/frontend stubs)
**Content to write:**
- **Hardware:** EduExo kit, Arduino Uno, analog potentiometer sensor — specs, role in system
- **Backend:** ROS Noetic (why ROS, architecture), rosbridge_server (WebSocket gateway), Python bridge script (`tcp_ros_bridge.py`), topics used (`/angle_topic`, `/exercise_control`, `/calibration_command`)
- **Frontend:** React 18 (component model, hooks), ROSLIB.js (ROS WebSocket client), Chart.js (real-time graph), Bootstrap + Glassmorphism CSS, Framer Motion (animations)
- **Communication stack:** Arduino → TCP → ROS → rosbridge → WebSocket → React (already written, just integrate)
- Justification for each technology choice

---

### STEP 7 — Cap. 7: Implementación
**File:** `.claude/content/07-cap7-implementacion.md`
**Status:** ⬜ Pending (all 5 subsections empty)
**Content to write (referencing actual source files):**
- **7.1 Comunicación serie con Arduino** — `scripts/arduino_to_wsl.py`, baud rate 115200, JSON protocol, timeout handling
- **7.2 Servidor TCP y bridge ROS** — `catkin_ws/.../tcp_ros_bridge.py`, threading, reconnect logic, 30Hz rate limiting, publishes to `/angle_topic`
- **7.3 Hook `useRosAngle` y suscriptores frontend** — `src/hooks/useRosAngle.js`, dual angle space logic (45–80° hardware vs 45–180° visual), `angleUtils.js` conversion
- **7.4 Visualización en tiempo real con Chart.js** — `TrackingExercise.js`, scrolling path, 60fps render, angle-to-pixel mapping
- **7.5 Estructura de ejercicios musicales** — `src/data/exercises.js`, note sequences, angle targets, audio preloading from `public/sounds/`, score computation in `EjerciciosMusicales.js`
- Each subsection: brief description + key code snippets (≤15 lines each) + explanation

---

### STEP 8 — Cap. 8: Diseño de ejercicios de rehabilitación musical
**File:** `.claude/content/08-cap8-ejercicios.md`
**Status:** ⬜ Pending
**Content to write:**
- **8.1 Ejercicio 1: Escala musical ascendente y descendente** — 8 notes (Do–Re–Mi–Fa–Sol–La–Si–Do), angle range 45–180°, therapeutic rationale (full ROM)
- **8.2 Ejercicio 2: Twinkle Twinkle Little Star** — note sequence, angle mapping, 150s duration, 60Hz simulation
- **8.3 Ejercicio 3: Mary Had a Little Lamb** — note sequence, angle mapping, 180s duration
- **8.4 Patrones ángulo vs nota** — table mapping each musical note to target visual angle and hardware angle
- **8.5 Correspondencia con ejercicios terapéuticos reales** — how these map to clinically used ROM exercises, repetition counts, speed guidance

---

### STEP 9 — Cap. 9: Evaluación y resultados
**File:** `.claude/content/09-cap9-evaluacion.md`
**Status:** ⬜ Pending
**Content to write (based on real tests done):**
- **9.1 Criterios de evaluación:** functional correctness, latency (<33ms), UI usability, ROS connectivity
- **9.2 Resultados de pruebas con usuarios:** observations from tests with students (# participants, tasks performed, outcomes)
- **9.3 Análisis de retroalimentación:** qualitative feedback summary, issues found, improvements made
- **9.4 Validación técnica y funcional:** latency measurements, WebSocket stability, angle accuracy, exercise score accuracy
- Jaime must provide test data/observations for this step

---

### STEP 10 — Cap. 10: Conclusiones y trabajo futuro
**File:** `.claude/content/10-cap10-conclusiones.md`
**Status:** ⬜ Pending
**Content to write:**
- **10.1 Conclusiones generales:** what was achieved vs. objectives set in Cap. 1 (point-by-point)
- **10.2 Limitaciones actuales:** hardware range (45–80° only), no clinical validation, no patient data, WSL2 dependency
- **10.3 Propuestas de mejora:** real EMG integration, cloud data storage, multi-joint support
- **10.4 Líneas futuras de investigación:** clinical trials, ML for adaptive exercise, mobile version

---

### STEP 11 — Bibliografía
**File:** `.claude/content/11-bibliografia.md`
**Status:** ⬜ Pending
**Format:** APA 7th edition (matches UPSA style used in template)
**Sources to include (already referenced in the doc):**
- Löffl, M. (2019). EduExo handbook
- Sommerville, I. (2011). Software Engineering (9th ed.)
- Schneider et al. (2007). MST study
- Thaut & Hoemberg (2015). Handbook of Neurologic Music Therapy
- ARMin, Myomo, MusicGlove papers
- React, ROS, rosbridge official docs
- Any additional sources Jaime references per chapter

---

### STEP 12 — Generación del `.docx` final
**Output file:** `docs/TFG_JaimeGuerraDiaz_Final.docx`
**Script:** `scripts/generate_tfg.py` (to be created)
**Libraries:** `python-docx`
**Format applied:**
- A4 page, margins (top/bottom 3cm, internal 3.5cm, external 2.5cm)
- Mirror margins for double-sided printing
- Section breaks (odd-page) between chapters
- Roman numeral pagination (i, ii, iii…) for pre-chapter pages, centered bottom
- Arabic pagination from Ch.1, exterior (right on odd, left on even)
- Headers: odd = chapter title, even = TFG title; no header on first page of chapter
- Styles: Heading 1 (chapters), Heading 2, Heading 3, Normal body, Code, Caption
- Cover page: no header/footer/page number
- Blank pages: no header/footer/page number
- Automatic TOC, Figure index, Table index (Word fields)

---

## Content Output Files Location

All Markdown content will be saved to `.claude/content/` within the project:

```
.claude/
  content/
    01-resumen.md
    02-cap1-contexto.md
    03-cap2-proyectos-similares.md
    04-cap3-clinico.md
    05-cap4-requisitos.md
    06-cap5-tecnologias.md
    07-cap7-implementacion.md
    08-cap8-ejercicios.md
    09-cap9-evaluacion.md
    10-cap10-conclusiones.md
    11-bibliografia.md
  tfg-plan.md       ← this file (progress tracking)
  tfg-context.md    ← project metadata
scripts/
  generate_tfg.py   ← docx generator (Step 12)
docs/
  TFG_JaimeGuerraDiaz_Final.docx  ← final output
```
