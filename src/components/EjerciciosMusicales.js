import React, { useState, useEffect, useRef } from "react";
import SensorChart from "./SensorChart";
import { Container, Row, Col, Card, Button, Alert } from "react-bootstrap";
import { FaPlay, FaRedo, FaMusic, FaPlug, FaExclamationTriangle, FaDownload } from "react-icons/fa";
import { GiMuscleUp } from "react-icons/gi";
import exercises from "../data/exercises";
import useRosAngle from "../hooks/useRosAngle";
import { motion, AnimatePresence } from "framer-motion";
import { convertInputToVisualAngle, convertVisualToInputAngle } from "../utils/angleUtils";
import "../styles/components/EjerciciosMusicales.css";

const EjerciciosMusicales = () => {
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [resetGraph, setResetGraph] = useState(false);
  const [listening, setListening] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [hitNotes, setHitNotes] = useState(0);
  const [lastPlayedTime, setLastPlayedTime] = useState(0);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [perfectNote, setPerfectNote] = useState(false);
  const [forceRender, setForceRender] = useState(0);
  const audioRef = useRef(null);
  const { angle, connected } = useRosAngle();
  
  const preloadAudio = async (exercise) => {
    try {
      console.log(`🔄 Precargando audio para ejercicio: ${exercise.name}`);
      
      // Verificar que los archivos de audio existen
      const testPromises = exercise.sequence.map(async (note) => {
        try {
          const audio = new Audio(note.sound);
          return new Promise((resolve, reject) => {
            audio.addEventListener('canplaythrough', () => resolve(note.sound));
            audio.addEventListener('error', () => reject(`Error cargando ${note.sound}`));
            audio.load();
          });
        } catch (error) {
          console.warn(`No se pudo precargar ${note.sound}:`, error);
          return note.sound; // Continuar aunque no se pueda precargar
        }
      });
      
      await Promise.allSettled(testPromises);
      setAudioLoaded(true);
      console.log(`Audio precargado para: ${exercise.name}`);
      
    } catch (error) {
      console.error("Error precargando audio:", error);
      setAudioLoaded(true); // Permitir continuar aunque falle la precarga
    }
  };

  const cleanupAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
      audioRef.current = null;
    }
  };

  const playNote = async (sound) => {
    try {
      console.log(`Intentando reproducir: ${sound}`);
      
      // Detener cualquier audio previo
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      // Crear nueva instancia de audio para evitar problemas de cache
      audioRef.current = new Audio(sound);
      audioRef.current.volume = 0.8; // Volumen alto para que se escuche bien
      
      // Reproducir inmediatamente
      await audioRef.current.play();
      console.log(`🎵 Audio reproducido exitosamente: ${sound}`);
      
    } catch (error) {
      console.error(`Error reproduciendo sonido ${sound}:`, error);
      // NO usar fallback - esto está causando que suenen tonos sintéticos
      console.log('Asegúrate de que el archivo de audio existe en public/sounds/');
    }
  };

  const handleExerciseSelect = async (exercise) => {
    try {
      setError(null);
      setLoading(true);
      
      // Limpiar estado anterior
      cleanupAudio();
      setCurrentNoteIndex(0);
      setHitNotes(0);
      setScore(0);
      setResetGraph(true);
      setPerfectNote(false);
      setLastPlayedTime(0);
      
      // Precargar audio
      await preloadAudio(exercise);
      
      // Establecer ejercicio seleccionado e inicializar tiempo
      setSelectedExercise(exercise);
      setListening(true); // ¡CRUCIAL! Activar la escucha
      setLastPlayedTime(Date.now()); // Evitar reproducción inmediata de una nota
      
      console.log(`🎵 Ejercicio "${exercise.name}" cargado correctamente`);
      console.log('Listening activado, esperando ángulos...');
    } catch (error) {
      console.error("Error cargando ejercicio:", error);
      setError(`Error al cargar el ejercicio: ${error.message}`);
      setSelectedExercise(null);
      setListening(false);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    cleanupAudio();
    setSelectedExercise(null);
    setCurrentNoteIndex(0);
    setHitNotes(0);
    setScore(0);
    setResetGraph(true);
    setError(null);
    setPerfectNote(false);
    setListening(false);
    setLastPlayedTime(0);
    console.log("🔄 Ejercicio reiniciado");
  };

  useEffect(() => {
    if (selectedExercise && angle !== null && listening && audioLoaded) {
      const currentNote = selectedExercise.sequence[currentNoteIndex];
      
      if (!currentNote) {
        console.log("🎉 Ejercicio completado - todas las notas tocadas");
        setListening(false);
        return;
      }

      const currentTime = Date.now();
      const visualAngle = convertInputToVisualAngle(angle);
      const error = Math.abs(visualAngle - currentNote.angle);
      
      console.log(`SIMPLE | Índice: ${currentNoteIndex}/${selectedExercise.sequence.length} | Ángulo Real: ${angle.toFixed(1)}° | Ángulo Visual: ${visualAngle.toFixed(1)}° | Objetivo: ${currentNote.angle}° (${currentNote.note})`);
      
      // Detección con tolerancia adaptativa
      const tolerance = currentNote.note === 'E' ? 25 : 15; // Tolerancia especial para E
      console.log(`🎚️ TOLERANCIA | Nota: ${currentNote.note} | Tolerancia: ${tolerance}° | Error: ${error.toFixed(1)}° | ¿Válido?: ${error <= tolerance}`);
      
      // Sistema de respaldo: detectar si el ángulo coincide con otras notas
      const nextNote = selectedExercise.sequence[currentNoteIndex + 1];
      const nextError = nextNote ? Math.abs(visualAngle - nextNote.angle) : 999;
      const matchesNext = nextNote && nextError <= 15;
      
      // Detectar si coincide con cualquier nota cercana en la secuencia
      let bestMatch = null;
      let bestError = 999;
      for (let i = Math.max(0, currentNoteIndex - 1); i <= Math.min(selectedExercise.sequence.length - 1, currentNoteIndex + 2); i++) {
        const testNote = selectedExercise.sequence[i];
        const testError = Math.abs(visualAngle - testNote.angle);
        if (testError < bestError && testError <= 15) {
          bestMatch = { index: i, note: testNote, error: testError };
          bestError = testError;
        }
      }
      
      console.log(`🔍 RESPALDO | Siguiente: ${nextNote?.note} (${nextNote?.angle}°, error: ${nextError.toFixed(1)}°) | Mejor coincidencia: ${bestMatch ? `índice ${bestMatch.index}, ${bestMatch.note.note} (${bestMatch.note.angle}°, error: ${bestMatch.error.toFixed(1)}°)` : 'ninguna'}`);
      
      if (error <= tolerance && currentTime - lastPlayedTime > 300) {
        console.log(`🎵 SIMPLE | ¡Nota ${currentNote.note} detectada!`);
        
        // Reproducir la nota
        playNote(currentNote.sound);
        
        // Actualizar estados
        setScore(prev => prev + 10);
        setHitNotes(prev => prev + 1);
        setLastPlayedTime(currentTime);
        
        // AVANZAR - método simple
        const nextIndex = currentNoteIndex + 1;
        console.log(`🚀 SIMPLE | AVANZANDO: ${currentNoteIndex} -> ${nextIndex}`);
        
        if (nextIndex < selectedExercise.sequence.length) {
          setCurrentNoteIndex(nextIndex);
          const nextNote = selectedExercise.sequence[nextIndex];
          console.log(`SIMPLE | Próxima nota: ${nextNote.note} (${nextNote.angle}°)`);
        } else {
          console.log("🎉 SIMPLE | Secuencia completada!");
          setListening(false);
        }
      } else if (bestMatch && bestMatch.index > currentNoteIndex && currentTime - lastPlayedTime > 300) {
        // Sistema de respaldo: sincronizar con la mejor coincidencia hacia adelante
        console.log(`🚨 RESPALDO ACTIVADO | Saltando desde índice ${currentNoteIndex} (${currentNote.note}) al índice ${bestMatch.index} (${bestMatch.note.note}) porque el ángulo ${visualAngle}° coincide mejor`);
        
        // Reproducir la nota detectada
        playNote(bestMatch.note.sound);
        
        // Sincronizar al índice de la mejor coincidencia
        setCurrentNoteIndex(bestMatch.index);
        setScore(prev => prev + 3); // Puntuación baja por salto, pero al menos avanza
        setHitNotes(prev => prev + 1);
        setLastPlayedTime(currentTime);
        
        console.log(`🔄 RESPALDO | Sincronizado al índice ${bestMatch.index}`);
      }
    }
  }, [angle, selectedExercise, currentNoteIndex, listening, audioLoaded, lastPlayedTime]);

  // Limpiar audio cuando se desmonta el componente
  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  // Resetear el estado resetGraph después de un breve delay
  useEffect(() => {
    if (resetGraph) {
      const timer = setTimeout(() => {
        setResetGraph(false);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [resetGraph]);

  // Monitor de cambios en currentNoteIndex para debug
  useEffect(() => {
    if (selectedExercise) {
      const currentNote = getCurrentNote();
      console.log(`📍 ÍNDICE CAMBIÓ | currentNoteIndex: ${currentNoteIndex} | Nota: ${currentNote?.note} | Ángulo: ${currentNote?.angle}°`);
    }
  }, [currentNoteIndex, selectedExercise]);

  const getCurrentNote = () => {
    if (!selectedExercise) return null;
    if (currentNoteIndex >= selectedExercise.sequence.length) return null;
    return selectedExercise.sequence[currentNoteIndex];
  };

  const getNextNote = () => {
    if (!selectedExercise) return null;
    const nextIndex = currentNoteIndex + 1;
    if (nextIndex >= selectedExercise.sequence.length) return null;
    return selectedExercise.sequence[nextIndex];
  };

  const getProgress = () => {
    if (!selectedExercise) return 0;
    return (currentNoteIndex / selectedExercise.sequence.length) * 100;
  };

  const getFinalScore = () => {
    if (!selectedExercise || hitNotes === 0) return 0;
    // Calcular porcentaje basado en puntos obtenidos vs puntos máximos posibles
    const maxPossibleScore = selectedExercise.sequence.length * 10;
    return Math.round((score / maxPossibleScore) * 100);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "text-success";
    if (score >= 70) return "text-warning";
    return "text-danger";
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return "¡Excelente precisión!";
    if (score >= 70) return "Buen trabajo, pero hay espacio para mejorar";
    if (score >= 50) return "Necesitas mejorar tu precisión";
    return "Intenta seguir la secuencia correctamente";
  };

  return (
    <div className="ejercicios-musicales-container page-container">
      <div className="dashboard-gradient-overlay" />
      <Container fluid>
        <AnimatePresence>
          {!connected && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert variant="warning" className="mb-4">
                <FaExclamationTriangle className="me-2" />
                No se detecta conexión con ROS. Asegúrate de que:
                <ul className="mb-0 mt-2">
                  <li>El servidor ROS (roscore) está ejecutándose</li>
                  <li>El puente websocket está activo (roslaunch rosbridge_server rosbridge_websocket.launch)</li>
                  <li>Tu script de Python está publicando en el tópico /angle_topic</li>
                </ul>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="error-message mb-4">
            <i><FaExclamationTriangle /></i>
            {error}
          </div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
        <Row>
          <Col md={4}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
            <Card className="glass-card p-4 mb-3">
                <div className="card-header-icon">
                  <FaMusic className="icon-large" />
                  <h4>Ejercicios Analíticos</h4>
                </div>
              {exercises.map((exercise, idx) => (
                <Button
                  key={idx}
                  variant="outline-light"
                  className="w-100 mb-2 py-2 d-flex align-items-center justify-content-between"
                  onClick={() => handleExerciseSelect(exercise)}
                  disabled={!connected || (selectedExercise === exercise) || loading}
                >
                  <div className="d-flex align-items-center">
                    {loading && selectedExercise === exercise ? (
                      <div className="loading-spinner me-2" style={{ width: '16px', height: '16px' }} />
                    ) : (
                      <FaPlay className="button-icon me-2" />
                    )}
                    <div className="text-start">
                      <div className="exercise-name">{exercise.name}</div>
                      <small className="exercise-details d-block">{exercise.type} • {exercise.duration}</small>
                    </div>
                  </div>
                  <span className={`difficulty-badge ${exercise.difficulty.toLowerCase()}`}>
                    {exercise.difficulty}
                  </span>
                </Button>
              ))}
              </Card>

              {selectedExercise && (
                <Card className="glass-card p-3">
                  <h5 className="mb-2">Información del Ejercicio</h5>
                  <div className="exercise-info">
                    <div className="info-row">
                      <strong>Nota Actual:</strong>
                      <span className={`text-info ${perfectNote ? 'score-perfect' : ''}`}>
                        {getCurrentNote()?.note || '—'} ({getCurrentNote() ? convertVisualToInputAngle(getCurrentNote().angle).toFixed(0) : '—'}°)
                      </span>
                    </div>
                    <div className="info-row">
                      <strong>Siguiente:</strong>
                      <span className="text-warning">
                        {getNextNote()?.note || '—'} ({getNextNote() ? convertVisualToInputAngle(getNextNote().angle).toFixed(0) : '—'}°)
                      </span>
                    </div>
                    <div className="info-row">
                      <strong>Progreso:</strong>
                      <span className="text-success">
                        {hitNotes}/{selectedExercise.sequence.length}
                      </span>
                    </div>
                    <div className="info-row">
                      <strong>Puntuación:</strong>
                      <span className={`score-display ${getScoreColor(getFinalScore())}`}>
                        {getFinalScore()}%
                      </span>
                    </div>
                    <div className="info-description">
                      <p className="text-white-50">
                        {getScoreMessage(getFinalScore())}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    className="w-100 mt-3 py-2 d-flex align-items-center justify-content-center gap-2"
                    onClick={handleReset}
                    disabled={!connected || loading}
                  >
                    <FaRedo className="button-icon" />
                    Reiniciar
                  </Button>
                </Card>
              )}
            </motion.div>
          </Col>

          <Col md={8}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
            <Card className="glass-card p-4">
                <div className="card-header-icon">
                  <GiMuscleUp className="icon-large" />
                  <h4>Ángulo del brazo en tiempo real</h4>
                </div>
                {loading ? (
                  <div className="loading-state">
                    <div className="loading-spinner" />
                    <p>Cargando ejercicio...</p>
                  </div>
                ) : selectedExercise ? (
                  <>
                    <SensorChart 
                      angle={angle} 
                      resetGraph={resetGraph}
                      targetAngle={(() => {
                        const currentNote = getCurrentNote();
                        const visualTarget = currentNote?.angle;
                        const rawTarget = visualTarget !== undefined ? convertVisualToInputAngle(visualTarget) : null;
                        console.log(`PASANDO AL CHART | Índice: ${currentNoteIndex} | targetAngle(raw): ${rawTarget}° | Nota: ${currentNote?.note}`);
                        return rawTarget;
                      })()}
                    />
                    <div className="mt-4">
                      <h5 className="text-white">Progreso del ejercicio</h5>
                      <div className="progress-bar-container">
                        <div 
                          className="progress-bar" 
                          style={{ width: `${getProgress()}%` }}
                        />
                      </div>
                      <div className="mt-3 text-center">
                        <h6 className="text-white">
                          Ángulo Actual: <span className="text-info">{angle !== null ? angle.toFixed(1) : '—'}°</span>
                        </h6>
                        <p className="text-white mb-0">
                          Mueve el brazo al ángulo objetivo para reproducir la nota
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="empty-state-container text-center py-5">
                    <FaMusic className="empty-state-icon mb-3" />
                    <h5 className="empty-state-title">Selecciona un Ejercicio Analítico</h5>
                    <p className="empty-state-text">
                      Elige un ejercicio de la lista para comenzar tu sesión de rehabilitación
                    </p>
                </div>
              )}
            </Card>
            </motion.div>
          </Col>
        </Row>
        </motion.div>
      </Container>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    padding: "40px 20px",
    background: "transparent",
    color: "white",
    fontFamily: "Inter, sans-serif",
  },
};

export default EjerciciosMusicales;



