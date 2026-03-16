import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { FaExclamationTriangle, FaPlay, FaRedo, FaMusic, FaDownload } from 'react-icons/fa';
import { GiMuscleUp } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';
import TrackingExercise from './exercises/TrackingExercise';
import useRosAngle from '../hooks/useRosAngle';
import '../styles/components/Progress.css';

const Progress = () => {
  const { angle, connected } = useRosAngle();
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exerciseStartTime, setExerciseStartTime] = useState(null);
  const [exerciseLog, setExerciseLog] = useState([]);
  const [exerciseCompleted, setExerciseCompleted] = useState(false);
  const [exerciseScore, setExerciseScore] = useState(0);
  const [notesHit, setNotesHit] = useState(0);
  const [isExerciseActive, setIsExerciseActive] = useState(false);
  const [useSimulation, setUseSimulation] = useState(!connected);

  // Actualizar useSimulation cuando cambie connected
  useEffect(() => {
    setUseSimulation(!connected);
  }, [connected]);

  // Ejercicios de seguimiento disponibles
  const trackingExercises = [
    {
      id: 1,
      name: "Escala Musical",
      description: "Ejercicio básico siguiendo una escala musical ascendente",
      song: "/sounds/scales.mp3",
      difficulty: "Fácil",
      duration: "2:00",
      type: "Seguimiento Lineal"
    },
    {
      id: 2,
      name: "Twinkle Twinkle",
      description: "Ejercicio rítmico con la melodía de Twinkle Twinkle Little Star",
      song: "/sounds/twinkle.mp3",
      difficulty: "Medio",
      duration: "3:00",
      type: "Seguimiento Ondulado"
    },
    {
      id: 3,
      name: "Mary Had a Lamb",
      description: "Ejercicio avanzado con la melodía de Mary Had a Little Lamb",
      song: "/sounds/mary.mp3",
      difficulty: "Medio",
      duration: "3:00",
      type: "Seguimiento Complejo"
    }
  ];

  const handleExerciseSelect = async (exercise) => {
    try {
      setLoading(true);
      setSelectedExercise(exercise);
      setExerciseStartTime(Date.now());
      setExerciseLog([]); // Limpiar log anterior
      setExerciseCompleted(false);
      setExerciseScore(0);
      setNotesHit(0);
      setTimeout(() => setLoading(false), 1000);
    } catch (error) {
      console.error("Error al cargar el ejercicio:", error);
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedExercise(null);
    setExerciseStartTime(null);
    setExerciseLog([]);
    setExerciseCompleted(false);
    setExerciseScore(0);
    setNotesHit(0);
  };

  // Función para manejar el inicio del ejercicio
  const handleStartExercise = () => {
    console.log('Iniciando ejercicio desde Progress');
    setIsExerciseActive(true);
    setExerciseStartTime(Date.now());
  };

  // Función para manejar el fin del ejercicio
  const handleExerciseComplete = () => {
    console.log('Ejercicio completado');
    setIsExerciseActive(false);
    setExerciseCompleted(true);
  };

  // Logging de ángulos durante el ejercicio de seguimiento
  useEffect(() => {
    if (!isExerciseActive) return; // No procesar ángulos si el ejercicio no está activo

    if (selectedExercise && angle !== null && exerciseStartTime) {
      const currentTime = Date.now();
      const timeFromStart = currentTime - exerciseStartTime;
      
      // Añadir entrada al log cada cierto tiempo para no saturar (cada 100ms aprox)
      setExerciseLog(prev => {
        const lastEntry = prev[prev.length - 1];
        if (!lastEntry || (currentTime - new Date(lastEntry.timestamp).getTime()) > 100) {
          return [...prev, {
            timestamp: new Date().toISOString(),
            timeFromStart: timeFromStart,
            angle: angle,
            exerciseType: selectedExercise.type,
            exerciseName: selectedExercise.name
          }];
        }
        return prev;
      });
    }
  }, [angle, selectedExercise, exerciseStartTime, isExerciseActive]);

  // Función para generar y descargar informe del ejercicio de seguimiento
  const downloadTrackingReport = () => {
    if (!selectedExercise || exerciseLog.length === 0) return;

    const exerciseEndTime = Date.now();
    const totalDuration = exerciseEndTime - exerciseStartTime;
    
    // Calcular estadísticas
    const totalAnglesRecorded = exerciseLog.length;
    const avgAngle = (exerciseLog.reduce((sum, entry) => sum + entry.angle, 0) / totalAnglesRecorded).toFixed(2);
    const minAngle = Math.min(...exerciseLog.map(entry => entry.angle)).toFixed(2);
    const maxAngle = Math.max(...exerciseLog.map(entry => entry.angle)).toFixed(2);
    
    // Calcular rango de movimiento
    const rangeOfMotion = (maxAngle - minAngle).toFixed(2);
    
    // Calcular suavidad del movimiento (variación promedio entre mediciones consecutivas)
    let totalVariation = 0;
    for (let i = 1; i < exerciseLog.length; i++) {
      totalVariation += Math.abs(exerciseLog[i].angle - exerciseLog[i-1].angle);
    }
    const avgVariation = (totalVariation / (exerciseLog.length - 1)).toFixed(2);
    
    // Crear contenido CSV sin caracteres especiales
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Encabezado del informe - formato limpio
    csvContent += "INFORME DE EJERCICIO DE SEGUIMIENTO - EXOBRAZO REHAB\n";
    csvContent += "==================================================\n";
    csvContent += `Ejercicio:,${selectedExercise.name}\n`;
    csvContent += `Tipo:,${selectedExercise.type}\n`;
    csvContent += `Dificultad:,${selectedExercise.difficulty}\n`;
    csvContent += `Duracion Esperada:,${selectedExercise.duration}\n`;
    csvContent += `Fecha:,${new Date().toLocaleDateString('es-ES')}\n`;
    csvContent += `Hora de Inicio:,${new Date(exerciseStartTime).toLocaleTimeString('es-ES')}\n`;
    csvContent += `Hora de Finalizacion:,${new Date(exerciseEndTime).toLocaleTimeString('es-ES')}\n`;
    csvContent += `Duracion Real:,${(totalDuration / 1000).toFixed(1)} segundos\n`;
    csvContent += `Descripcion:,${selectedExercise.description}\n`;
    csvContent += "\n";
    
    // Estadísticas de movimiento
    csvContent += "ESTADISTICAS DE MOVIMIENTO\n";
    csvContent += "===========================\n";
    csvContent += `Total de Mediciones:,${totalAnglesRecorded}\n`;
    csvContent += `Angulo Promedio:,${avgAngle} grados\n`;
    csvContent += `Angulo Minimo:,${minAngle} grados\n`;
    csvContent += `Angulo Maximo:,${maxAngle} grados\n`;
    csvContent += `Rango de Movimiento:,${rangeOfMotion} grados\n`;
    csvContent += `Variacion Promedio:,${avgVariation} grados\n`;
    csvContent += `Frecuencia de Muestreo:,${(totalAnglesRecorded / (totalDuration / 1000)).toFixed(2)} Hz\n`;
    csvContent += "\n";
    
    // Datos detallados de ángulos con formato claro
    csvContent += "DATOS DETALLADOS DE MOVIMIENTO\n";
    csvContent += "===============================\n";
    csvContent += "Fecha y Hora,Segundos desde Inicio,Angulo (grados),Tipo de Ejercicio,Velocidad Angular (grados/seg)\n";
    
    exerciseLog.forEach((entry, index) => {
      // Convertir timestamp a formato legible
      const fechaHora = new Date(entry.timestamp);
      const fechaFormateada = fechaHora.toLocaleDateString('es-ES');
      const horaFormateada = fechaHora.toLocaleTimeString('es-ES');
      const tiempoDesdeInicio = (entry.timeFromStart / 1000).toFixed(2);
      
      let angularVelocity = 'N/A';
      if (index > 0) {
        const prevEntry = exerciseLog[index - 1];
        const timeDiff = entry.timeFromStart - prevEntry.timeFromStart;
        const angleDiff = entry.angle - prevEntry.angle;
        angularVelocity = ((angleDiff / timeDiff) * 1000).toFixed(2); // °/s
      }
      
      csvContent += `${fechaFormateada} ${horaFormateada},${tiempoDesdeInicio},${entry.angle.toFixed(2)},${entry.exerciseType},${angularVelocity}\n`;
    });
    
    // Crear y descargar archivo
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const fileName = `informe_ejercicio_seguimiento_${selectedExercise.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('Informe de seguimiento descargado:', fileName);
  };

  return (
    <div className="ejercicios-seguimiento-container page-container">
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
                No se detecta conexión con ROS. El sistema funcionará en modo simulación.
                <ul className="mb-0 mt-2">
                  <li>Podrás probar todos los ejercicios sin necesidad del hardware</li>
                  <li>El seguimiento se simulará automáticamente</li>
                  <li>Para usar el brazo real, asegúrate de que ROS esté ejecutándose</li>
                </ul>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <Row className="exercise-content">
          <Col md={4} className="d-flex flex-column">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-grow-1 d-flex flex-column"
            >
              <Card className="glass-card p-4 mb-4">
                <div className="card-header-icon">
                  <FaMusic className="icon-large" />
                  <h4>Ejercicios de Seguimiento</h4>
                </div>
                {trackingExercises.map((exercise) => (
                  <Button
                    key={exercise.id}
                    variant="outline-light"
                    className="exercise-button w-100 mb-3"
                    onClick={() => handleExerciseSelect(exercise)}
                    disabled={!connected || loading}
                  >
                    <div className="d-flex align-items-center justify-content-between w-100">
                      <div className="d-flex align-items-center">
                        <FaPlay className="button-icon me-3" />
                        <div className="text-start">
                          <div className="exercise-name">{exercise.name}</div>
                          <small className="exercise-details">
                            {exercise.type} • {exercise.duration}
                          </small>
                        </div>
                      </div>
                      <span className={`difficulty-badge ${exercise.difficulty.toLowerCase()}`}>
                        {exercise.difficulty}
                      </span>
                    </div>
                  </Button>
                ))}
              </Card>

              {selectedExercise && (
                <Card className="glass-card p-4 flex-grow-1 d-flex flex-column">
                  <h5 className="mb-3">Información del Ejercicio</h5>
                  <div className="exercise-info">
                    <div className="info-item">
                      <span>Ejercicio:</span>
                      <span className="info-value">{selectedExercise.name}</span>
                    </div>
                    <div className="info-item">
                      <span>Tipo:</span>
                      <span className="info-value">{selectedExercise.type}</span>
                    </div>
                    <div className="info-item">
                      <span>Duración:</span>
                      <span className="info-value">
                        {selectedExercise.duration || '2:00'} minutos
                      </span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Button
                      variant="secondary"
                      className="w-100 d-flex align-items-center justify-content-center gap-2 mb-2"
                      onClick={handleReset}
                      disabled={!connected || loading}
                    >
                      <FaRedo className="button-icon" />
                      Reiniciar ejercicio
                    </Button>

                    {/* Botón de descarga de informe */}
                    {selectedExercise && exerciseLog.length > 0 && (
                      <Button
                        variant="success"
                        className="w-100 d-flex align-items-center justify-content-center gap-2"
                        onClick={downloadTrackingReport}
                      >
                        <FaDownload className="button-icon" />
                        Descargar Informe
                      </Button>
                    )}
                  </div>
                </Card>
              )}
            </motion.div>
          </Col>

          <Col md={8} className="d-flex flex-column">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex-grow-1 d-flex flex-column"
            >
              <Card className="glass-card p-4 flex-grow-1 d-flex flex-column">
                <div className="card-header-icon">
                  <GiMuscleUp className="icon-large" />
                  <h4>Área de Ejercicio</h4>
                </div>
                <div className="flex-grow-1 d-flex flex-column">
                  {loading ? (
                    <div className="loading-state">
                      <div className="loading-spinner" />
                      <p>Cargando ejercicio...</p>
                    </div>
                  ) : selectedExercise ? (
                    <TrackingExercise 
                      exercise={selectedExercise} 
                      onExerciseComplete={handleExerciseComplete}
                      onScoreUpdate={(score) => setExerciseScore(score)}
                      onNotesUpdate={(notes) => setNotesHit(notes)}
                      isActive={isExerciseActive}
                      onStart={handleStartExercise}
                      forceSimulation={useSimulation}
                    />
                  ) : (
                    <div className="empty-state-container text-center py-5 flex-grow-1 d-flex flex-column align-items-center justify-content-center">
                      <GiMuscleUp className="empty-state-icon mb-3" />
                      <h5 className="empty-state-title">Selecciona un Ejercicio de Seguimiento</h5>
                      <p className="empty-state-text">
                        Elige un ejercicio de la lista para practicar movimientos continuos
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </Container>

      <style jsx>{`
        .exercise-info {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .info-item:last-child {
          border-bottom: none;
        }

        .info-item span:first-child {
          color: rgba(255, 255, 255, 0.7);
          font-weight: 500;
        }

        .info-value {
          color: #6EF3C5;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default Progress; 