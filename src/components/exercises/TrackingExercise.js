import React, { useEffect, useRef, useState } from 'react';
import { Card } from 'react-bootstrap';
import useRosAngle from '../../hooks/useRosAngle';
import '../../styles/components/TrackingExercise.css';

const TrackingExercise = ({ 
  exercise, 
  onExerciseComplete, 
  onScoreUpdate, 
  onNotesUpdate,
  isActive,
  onStart,
  forceSimulation = false
}) => {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const { 
    angle, 
    connected, 
    calibrated,
    exerciseActive,
    startExercise: startRosExercise,
    stopExercise: stopRosExercise,
    simulateAngleChange,
    isSimulationMode: rosSimulationMode 
  } = useRosAngle(forceSimulation);

  // Definir las variables que faltaban
  const [isSimulationMode, setIsSimulationMode] = useState(forceSimulation);
  
  const startExercise = async () => {
    if (startRosExercise) {
      await startRosExercise();
    }
    setExerciseStarted(true);
  };

  const stopExercise = async () => {
    if (stopRosExercise) {
      await stopRosExercise();
    }
    setExerciseStarted(false);
  };

  const [score, setScore] = useState(0);
  const [isInPath, setIsInPath] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [exerciseStarted, setExerciseStarted] = useState(false);
  const [countdown, setCountdown] = useState(0); // 0 = no countdown, 1-3 = numbers, 4 = "¡YA!"
  const [showCountdown, setShowCountdown] = useState(false);
  const [notesHit, setNotesHit] = useState(0);
  const [totalNotes, setTotalNotes] = useState(0);
  const [currentNote, setCurrentNote] = useState('');
  const [completedTargets, setCompletedTargets] = useState(new Set()); // Objetivos ya completados
  const animationRef = useRef(null);
  const scrollOffset = useRef(0);
  const lastTime = useRef(null);
  const lastNoteHit = useRef(0);
  
  // Posición actual del punto (controlada directamente por el ángulo)
  const currentPointY = useRef(200); // Inicializar en el centro

  // Añadir estado para controlar si el ejercicio ha terminado
  const [exerciseFinished, setExerciseFinished] = useState(false);

  // Configuración del ejercicio sincronizada con scripts
  const getExerciseConfig = (exerciseType) => {
    const baseConfig = {
      width: 800,
      height: 280,
      pathWidth: 55,
      pointRadius: 15,
      pointColor: '#6EF3C5',
      preparationZoneWidth: 200,
      previewZoneWidth: 100,
      initialOffset: 900 // 5 segundos * 60 frames/segundo * 3 px/frame
    };

    // Velocidad fija para todos los ejercicios (px/frame)
    const scrollSpeed = 3;
    
    // Longitud total incluyendo zonas
    const pathLength = baseConfig.width * 4;
    const totalLength = baseConfig.initialOffset + baseConfig.previewZoneWidth + baseConfig.preparationZoneWidth + pathLength;
    
    // Calcular duración basada en la longitud y velocidad
    const duration = Math.ceil(pathLength / (scrollSpeed * 60)); // en segundos

    return {
      ...baseConfig,
      duration,
      pathLength,
      totalLength,
      scrollSpeed,
      totalFrames: duration * 60
    };
  };

  const config = getExerciseConfig(exercise?.type);

  // Inicializar número total de notas según el ejercicio
  useEffect(() => {
    if (exercise?.type === "Seguimiento Lineal") {
      setTotalNotes(8);
    } else if (exercise?.type === "Seguimiento Ondulado") {
      setTotalNotes(14);
    } else {
      setTotalNotes(13);
    }
    setNotesHit(0);
    setCurrentNote('');
  }, [exercise]);

  // Función para convertir ángulo a posición Y
  const angleToY = (angleValue) => {
    if (angleValue === null || angleValue === undefined) {
      return config.height / 2; // Centro si no hay ángulo
    }
    
    // Ángulos reales del brazo (entrada)
    const minInputAngle = 45; // Flexión total (45° real)
    const maxInputAngle = 80; // Extensión total (180° real)
    
    // Ángulos deseados para visualización y ejercicios
    const minOutputAngle = 45;  // Flexión total
    const maxOutputAngle = 180; // Extensión total
    
    // Limitar el ángulo de entrada al rango válido
    const clampedInputAngle = Math.max(minInputAngle, Math.min(maxInputAngle, angleValue));
    
    // Convertir el ángulo de entrada al rango de salida
    const normalizedAngle = (clampedInputAngle - minInputAngle) / (maxInputAngle - minInputAngle);
    const mappedAngle = minOutputAngle + normalizedAngle * (maxOutputAngle - minOutputAngle);
    
    // Invertir el mapeo para la posición Y (180° = arriba, 45° = abajo)
    const normalizedY = 1 - ((mappedAngle - minOutputAngle) / (maxOutputAngle - minOutputAngle));
    const y = normalizedY * config.height;
    
    // Asegurar que esté dentro de los límites del canvas
    return Math.max(config.pointRadius, Math.min(config.height - config.pointRadius, y));
  };

  // Función inversa para convertir posición Y a ángulo (para simulación)
  const yToAngle = (y) => {
    // Normalizar la posición Y
    const normalizedY = 1 - (y / config.height);
    
    // Convertir a ángulo de salida
    const mappedAngle = 45 + normalizedY * (180 - 45);
    
    // Convertir al rango de entrada del brazo
    const normalizedInputAngle = (mappedAngle - 45) / (180 - 45);
    const inputAngle = 45 + normalizedInputAngle * (80 - 45);
    
    return inputAngle;
  };

  // Modificar useEffect del ángulo para incluir simulación
  useEffect(() => {
    if (!isActive || !exerciseStarted || exerciseFinished) return;

    if (angle !== null) {
      const newY = angleToY(angle);
      currentPointY.current = newY;
      
      // Si estamos en modo simulación, simular el seguimiento del camino
      if (isSimulationMode) {
        const path = generateExercisePath();
        const centerX = config.width / 2;
        const centerPoints = path.filter(point => {
          const x = point.x - scrollOffset.current;
          return Math.abs(x - centerX) < 10;
        });

        if (centerPoints.length > 0) {
          // Tomar el punto más cercano del camino
          const targetPoint = centerPoints[0];
          // Simular movimiento suave hacia el punto objetivo
          const targetY = targetPoint.y;
          const currentY = currentPointY.current;
          const diff = targetY - currentY;
          const smoothing = 0.1; // Factor de suavizado
          
          // Usar yToAngle para convertir la posición Y objetivo a un ángulo válido para el brazo
          const targetAngle = yToAngle(targetY);
          const currentAngle = yToAngle(currentY);
          const angleDiff = targetAngle - currentAngle;
          const newAngle = currentAngle + angleDiff * smoothing;
          
          simulateAngleChange(newAngle);
        }
      }
      
      console.log('Punto actualizado:', {
        anguloRecibido: angle,
        anguloMapeado: yToAngle(newY),
        posicionY: newY,
        timestamp: new Date().toLocaleTimeString(),
        modoSimulacion: isSimulationMode
      });
    }
  }, [angle, isActive, exerciseStarted, exerciseFinished, isSimulationMode]);

  // Función para dibujar el punto (diferenciado usando principios de Gestalt)
  const drawPoint = (ctx) => {
    const centerX = config.width / 2;
    const pointY = currentPointY.current;
    const time = Date.now() * 0.005;
    const pulse = Math.sin(time) * 0.3 + 1;
    
    // Principio de Figura-Fondo: Halo exterior muy diferenciado
    ctx.beginPath();
    ctx.arc(centerX, pointY, (config.pointRadius + 12) * pulse, 0, Math.PI * 2);
    const outerGlow = ctx.createRadialGradient(
      centerX, pointY, 0,
      centerX, pointY, (config.pointRadius + 12) * pulse
    );
    outerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    outerGlow.addColorStop(0.6, 'rgba(255, 255, 255, 0.2)');
    outerGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = outerGlow;
    ctx.fill();
    
    // Principio de Contraste: Anillo de separación
    ctx.beginPath();
    ctx.arc(centerX, pointY, config.pointRadius + 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fill();
    
    // Segundo nivel de brillo con color contrastante
    ctx.beginPath();
    ctx.arc(centerX, pointY, (config.pointRadius + 3) * pulse, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();

    // Crear gradiente radial para el punto principal (colores muy contrastantes)
    const gradient = ctx.createRadialGradient(
      centerX, pointY, 0,
      centerX, pointY, config.pointRadius
    );
    gradient.addColorStop(0, '#FFFFFF');  // Blanco puro en el centro
    gradient.addColorStop(0.3, '#6EF3C5'); // Verde brillante
    gradient.addColorStop(0.7, '#00D4AA'); // Verde más intenso
    gradient.addColorStop(1, '#008B8B');   // Verde oscuro para el borde

    // Punto principal con forma distintiva
    ctx.beginPath();
    ctx.arc(centerX, pointY, config.pointRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Borde muy contrastante y grueso
    ctx.beginPath();
    ctx.arc(centerX, pointY, config.pointRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#000000';  // Negro para máximo contraste
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // Segundo borde interno blanco
    ctx.beginPath();
    ctx.arc(centerX, pointY, config.pointRadius - 2, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Principio de Proximidad: Múltiples brillos internos
    const highlights = [
      { x: -5, y: -5, size: 4, opacity: 0.9 },
      { x: -2, y: -2, size: 2, opacity: 0.7 },
      { x: 3, y: 4, size: 3, opacity: 0.5 }
    ];
    
    highlights.forEach(highlight => {
      ctx.beginPath();
      ctx.arc(centerX + highlight.x, pointY + highlight.y, highlight.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${highlight.opacity})`;
      ctx.fill();
    });
    
    // Punto central ultra brillante para máxima diferenciación
    ctx.beginPath();
    ctx.arc(centerX, pointY, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    
    // Debug: mostrar coordenadas con máximo contraste
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 4;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Y: ${Math.round(pointY)}`, centerX + 25, pointY);
    ctx.shadowBlur = 0;
  };

  // Animación por defecto (antes de comenzar ejercicio)
  const drawDefaultAnimation = (ctx, time) => {
    ctx.clearRect(0, 0, config.width, config.height);
    
    // Crear gradiente más suave para la onda de demostración
    const backgroundGradient = ctx.createLinearGradient(0, 0, config.width, 0);
    backgroundGradient.addColorStop(0, 'rgba(45, 35, 120, 0.7)');
    backgroundGradient.addColorStop(0.5, 'rgba(65, 45, 140, 0.8)');
    backgroundGradient.addColorStop(1, 'rgba(45, 35, 120, 0.7)');
    
    // Dibujar sombra difusa de la onda
    ctx.beginPath();
    ctx.moveTo(4, config.height / 2 + 4);
    for (let x = 0; x < config.width; x++) {
      const y = Math.sin((x + time) * 0.02) * 70 + config.height / 2 + 4;
      ctx.lineTo(x + 4, y);
    }
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = config.pathWidth + 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    // Dibujar onda sinusoidal principal con bordes suavizados
    ctx.beginPath();
    ctx.moveTo(0, config.height / 2);
    for (let x = 0; x < config.width; x++) {
      const y = Math.sin((x + time) * 0.02) * 70 + config.height / 2;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = backgroundGradient;
    ctx.lineWidth = config.pathWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Añadir brillo interno suave
    ctx.beginPath();
    ctx.moveTo(0, config.height / 2);
    for (let x = 0; x < config.width; x++) {
      const y = Math.sin((x + time) * 0.02) * 70 + config.height / 2;
      ctx.lineTo(x, y);
    }
    
    const innerGlow = ctx.createLinearGradient(0, 0, config.width, 0);
    innerGlow.addColorStop(0, 'rgba(108, 92, 231, 0.4)');
    innerGlow.addColorStop(0.5, 'rgba(168, 85, 247, 0.5)');
    innerGlow.addColorStop(1, 'rgba(110, 243, 197, 0.4)');
    
    ctx.strokeStyle = innerGlow;
    ctx.lineWidth = config.pathWidth * 0.3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Dibujar líneas guía suaves
    const drawSoftGuideLine = (offsetY) => {
      ctx.beginPath();
      ctx.moveTo(0, config.height / 2 + offsetY);
      for (let x = 0; x < config.width; x++) {
        const y = Math.sin((x + time) * 0.02) * 70 + config.height / 2 + offsetY;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    };
    
    drawSoftGuideLine(-config.pathWidth / 2 + 2);
    drawSoftGuideLine(config.pathWidth / 2 - 2);

    // Añadir partículas flotantes más suaves
    for (let i = 0; i < 6; i++) {
      const particleX = (time * 0.3 + i * 120) % config.width;
      const particleY = Math.sin(time * 0.008 + i) * 40 + config.height / 2;
      const particleSize = 2 + Math.sin(time * 0.01 + i) * 1;
      
      ctx.beginPath();
      ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + Math.sin(time * 0.015 + i) * 0.2})`;
      ctx.fill();
    }

    // Siempre dibujar el punto
    drawPoint(ctx);
  };

  // Generar camino del ejercicio sincronizado con duración del script
  const generateExercisePath = () => {
    const points = [];
    const totalWidth = config.totalLength;
    const numPoints = Math.floor(totalWidth / 2);
    
    // Determinar la posición inicial según el tipo de ejercicio
    let initialY;
    if (exercise?.type === "Seguimiento Lineal") {
      initialY = config.height * 0.8; // Comenzar desde abajo para la escala musical
    } else if (exercise?.type === "Seguimiento Ondulado") {
      initialY = config.height * 0.5; // Comenzar desde el medio para Twinkle
    } else {
      initialY = config.height * 0.5; // Comenzar desde el medio para Mary
    }

    for (let i = 0; i < numPoints; i++) {
      const x = (i / (numPoints - 1)) * totalWidth;
      let y = initialY;

      // Zona inicial vacía (espacio a la izquierda)
      if (x < config.initialOffset) {
        y = initialY;
      }
      // Zona de vista previa
      else if (x < config.initialOffset + config.previewZoneWidth) {
        y = initialY;
      }
      // Zona de preparación
      else if (x < config.initialOffset + config.previewZoneWidth + config.preparationZoneWidth) {
        y = initialY;
      }
      // Ejercicio real
      else {
        const exerciseX = x - (config.initialOffset + config.previewZoneWidth + config.preparationZoneWidth);
        const progress = exerciseX / config.pathLength;
        
        if (exercise?.type === "Seguimiento Lineal") {
          const scaleSteps = 8;
          const stepProgress = (progress * scaleSteps * 2) % (scaleSteps * 2);
          
          if (stepProgress < scaleSteps) {
            const stepIndex = Math.floor(stepProgress);
            const stepHeight = config.height / scaleSteps;
            y = config.height - (stepIndex * stepHeight) - stepHeight/2;
          } else {
            const stepIndex = Math.floor(stepProgress - scaleSteps);
            const stepHeight = config.height / scaleSteps;
            y = (stepIndex * stepHeight) + stepHeight/2;
          }
          
          const smoothing = Math.sin(progress * Math.PI * 16) * 5;
          y += smoothing;
          
        } else if (exercise?.type === "Seguimiento Ondulado") {
          const melody = [
            0.8, 0.8, 0.2, 0.2, 0.1, 0.1, 0.2,
            0.3, 0.3, 0.4, 0.4, 0.6, 0.6, 0.8
          ];
          
          const noteIndex = Math.floor(progress * melody.length) % melody.length;
          const nextNoteIndex = (noteIndex + 1) % melody.length;
          const noteProgress = (progress * melody.length) % 1;
          
          const currentNote = melody[noteIndex];
          const nextNote = melody[nextNoteIndex];
          const interpolatedNote = currentNote + (nextNote - currentNote) * noteProgress;
          
          y = interpolatedNote * config.height;
          
          const vibrato = Math.sin(progress * Math.PI * 32) * 3;
          y += vibrato;
          
        } else {
          const maryMelody = [
            0.3, 0.5, 0.8, 0.5, 0.3, 0.3, 0.3,
            0.5, 0.5, 0.5,
            0.3, 0.3, 0.3,
            0.3, 0.5, 0.8, 0.5, 0.3, 0.3, 0.3,
            0.5, 0.5, 0.3, 0.5, 0.8
          ];
          
          const noteIndex = Math.floor(progress * maryMelody.length) % maryMelody.length;
          const nextNoteIndex = (noteIndex + 1) % maryMelody.length;
          const noteProgress = (progress * maryMelody.length) % 1;
          
          const currentNote = maryMelody[noteIndex];
          const nextNote = maryMelody[nextNoteIndex];
          const interpolatedNote = currentNote + (nextNote - currentNote) * noteProgress;
          
          y = interpolatedNote * config.height;
          
          const harmonic1 = Math.sin(progress * Math.PI * 24) * 8;
          const harmonic2 = Math.cos(progress * Math.PI * 16) * 4;
          y += harmonic1 + harmonic2;
        }
      }
      
      // Asegurar que Y esté dentro de los límites
      y = Math.max(config.pathWidth/2, Math.min(config.height - config.pathWidth/2, y));
      
      points.push({ x, y });
    }
    
    return points;
  };

  // Función para formatear la duración
  const formatDuration = (duration) => {
    return `${duration} segundos`;
  };

  // Función para dibujar ejercicio con camino
  const drawExercisePath = (ctx, path, offset = 0) => {
    // Si el ejercicio está terminado, no procesar más datos
    if (exerciseFinished) return;

    ctx.clearRect(0, 0, config.width, config.height);
    
    // Crear gradiente para el fondo del camino (más oscuro y diferenciado)
    const backgroundGradient = ctx.createLinearGradient(0, 0, config.width, 0);
    backgroundGradient.addColorStop(0, 'rgba(45, 35, 120, 0.8)');
    backgroundGradient.addColorStop(0.5, 'rgba(65, 45, 140, 0.9)');
    backgroundGradient.addColorStop(1, 'rgba(45, 35, 120, 0.8)');
    
    // Dibujar sombra difusa del camino (para suavizar bordes)
    ctx.beginPath();
    let started = false;
    path.forEach(point => {
      const x = point.x - offset;
      if (x >= 0 && x <= config.width) {
        if (!started) {
          ctx.moveTo(x + 4, point.y + 4);
          started = true;
        } else {
          ctx.lineTo(x + 4, point.y + 4);
        }
      }
    });
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = config.pathWidth + 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    // Dibujar camino principal con bordes suavizados
    ctx.beginPath();
    started = false;
    path.forEach(point => {
      const x = point.x - offset;
      if (x >= 0 && x <= config.width) {
        if (!started) {
          ctx.moveTo(x, point.y);
          started = true;
        } else {
          ctx.lineTo(x, point.y);
        }
      }
    });
    
    ctx.strokeStyle = backgroundGradient;
    ctx.lineWidth = config.pathWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Añadir brillo interno suave al camino
    ctx.beginPath();
    started = false;
    path.forEach(point => {
      const x = point.x - offset;
      if (x >= 0 && x <= config.width) {
        if (!started) {
          ctx.moveTo(x, point.y);
          started = true;
        } else {
          ctx.lineTo(x, point.y);
        }
      }
    });
    
    const innerGlow = ctx.createLinearGradient(0, 0, config.width, 0);
    innerGlow.addColorStop(0, 'rgba(108, 92, 231, 0.3)');
    innerGlow.addColorStop(0.5, 'rgba(168, 85, 247, 0.4)');
    innerGlow.addColorStop(1, 'rgba(110, 243, 197, 0.3)');
    
    ctx.strokeStyle = innerGlow;
    ctx.lineWidth = config.pathWidth * 0.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Dibujar zona inicial vacía
    const initialZoneEnd = config.initialOffset - offset;
    if (initialZoneEnd > 0) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, Math.min(initialZoneEnd, config.width), config.height);
    }

    // Dibujar zona de vista previa
    const previewZoneStart = config.initialOffset - offset;
    const previewZoneEnd = config.initialOffset + config.previewZoneWidth - offset;
    if (previewZoneEnd > 0 && previewZoneStart < config.width) {
      const startX = Math.max(0, previewZoneStart);
      const endX = Math.min(previewZoneEnd, config.width);
      
      // Fondo de la zona de vista previa
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(startX, 0, endX - startX, config.height);
      
      // Borde izquierdo de la zona de vista previa
      if (previewZoneStart >= 0 && previewZoneStart <= config.width) {
        ctx.beginPath();
        ctx.moveTo(previewZoneStart, 0);
        ctx.lineTo(previewZoneStart, config.height);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      
      // Texto de vista previa
      if (endX > startX) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Vista previa', (startX + endX) / 2, 30);
      }
    }

    // Dibujar zona de preparación
    const preparationZoneStart = config.initialOffset + config.previewZoneWidth - offset;
    const preparationZoneEnd = preparationZoneStart + config.preparationZoneWidth;
    
    if (preparationZoneEnd > 0 && preparationZoneStart < config.width) {
      const startX = Math.max(0, preparationZoneStart);
      const endX = Math.min(preparationZoneEnd, config.width);
      
      // Fondo de la zona de preparación más visible
      ctx.fillStyle = 'rgba(110, 243, 197, 0.1)';
      ctx.fillRect(startX, 0, endX - startX, config.height);
      
      // Borde izquierdo de la zona de preparación
      if (preparationZoneStart >= 0 && preparationZoneStart <= config.width) {
        ctx.beginPath();
        ctx.moveTo(preparationZoneStart, 0);
        ctx.lineTo(preparationZoneStart, config.height);
        ctx.strokeStyle = 'rgba(110, 243, 197, 0.8)';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      
      // Borde derecho de la zona de preparación
      if (preparationZoneEnd >= 0 && preparationZoneEnd <= config.width) {
        ctx.beginPath();
        ctx.moveTo(preparationZoneEnd, 0);
        ctx.lineTo(preparationZoneEnd, config.height);
        ctx.strokeStyle = 'rgba(110, 243, 197, 0.8)';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      
      // Texto de instrucción más visible
      if (endX > startX) {
        const textX = (startX + endX) / 2;
        ctx.fillStyle = 'rgba(110, 243, 197, 0.9)';
        ctx.font = 'bold 18px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText('ZONA DE PREPARACIÓN', textX, config.height/2 - 20);
        ctx.fillText('Coloca el brazo en posición inicial', textX, config.height/2 + 10);
        ctx.shadowBlur = 0;
      }
    }

    // Dibujar objetivos musicales con efectos mejorados
    const targets = drawMusicalTargets(ctx, path, offset);

    // Dibujar línea central de referencia más sutil
    ctx.beginPath();
    ctx.moveTo(config.width / 2, 0);
    ctx.lineTo(config.width / 2, config.height);
    ctx.strokeStyle = 'rgba(110, 243, 197, 0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([8, 12]);
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.setLineDash([]);

    // Siempre dibujar el punto (ahora más diferenciado)
    drawPoint(ctx);

    // Verificar si el punto está en el camino
    const centerX = config.width / 2;
    const pointY = currentPointY.current;
    
    // Encontrar TODOS los puntos del camino cerca del centro
    const centerPoints = path.filter(point => {
      const x = point.x - offset;
      return Math.abs(x - centerX) < 10;
    });

    // Por defecto, asumimos que está fuera del camino
    let newInPath = false;

    if (centerPoints.length > 0) {
      // Tomar el punto más cercano verticalmente
      const centerPathPoint = centerPoints.reduce((closest, current) => {
        const currentDistance = Math.abs(current.y - pointY);
        const closestDistance = Math.abs(closest.y - pointY);
        return currentDistance < closestDistance ? current : closest;
      });

      const distanceFromPath = Math.abs(centerPathPoint.y - pointY);
      
      // Ajustar la tolerancia basada en el tipo de ejercicio
      let pathWidthTolerance;
      if (exercise?.type === "Seguimiento Lineal") {
        pathWidthTolerance = config.pathWidth * 0.5;
      } else if (exercise?.type === "Seguimiento Ondulado") {
        pathWidthTolerance = config.pathWidth * 0.4;
      } else {
        pathWidthTolerance = config.pathWidth * 0.35;
      }

      // Determinar si está en el camino
      newInPath = distanceFromPath < pathWidthTolerance;

      // Dibujar línea de referencia entre el punto y el camino
      ctx.beginPath();
      ctx.moveTo(centerX, pointY);
      ctx.lineTo(centerX, centerPathPoint.y);
      ctx.strokeStyle = newInPath ? 'rgba(110, 243, 197, 0.3)' : 'rgba(255, 107, 107, 0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Mostrar distancia del camino si está fuera
      if (!newInPath) {
        ctx.fillStyle = 'rgba(255, 107, 107, 0.9)';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 3;
        ctx.fillText(`${Math.round(distanceFromPath)}px`, centerX, pointY - 30);
        ctx.shadowBlur = 0;
      }

      // Verificar objetivos musicales
      checkMusicalTargets(targets, offset);
    } else {
      // No hay puntos del camino cerca, se considera fuera
      newInPath = false;
    }

    // Forzar actualización del estado si ha cambiado
    if (newInPath !== isInPath) {
      setIsInPath(newInPath);
      console.log('Estado del camino actualizado:', newInPath ? 'Dentro' : 'Fuera');
    }

    // Verificar si estamos en zona de preparación (no contar puntuación)
    const isInPreparationZone = offset < (config.initialOffset + config.previewZoneWidth + config.preparationZoneWidth);

    // En zona de preparación forzamos estado neutral, fuera de ella solo actualizamos estado in/out (la puntuación se gestiona al acertar notas)
    if (isInPreparationZone) {
      setIsInPath(false);
    }

    // Verificar si el ejercicio ha terminado
    const progress = ((offset - (config.initialOffset + config.previewZoneWidth + config.preparationZoneWidth)) / config.pathLength) * 100;
    
    // Solo considerar terminar si hemos llegado al final del camino
    if (progress >= 100 && !exerciseFinished) {
      const remainingTargets = targets.filter(target => !completedTargets.has(target.id));
      const notesHitCount = completedTargets.size;
      
      // Solo terminar si:
      // 1. Se han conseguido todas las notas, o
      // 2. No quedan notas alcanzables
      if (notesHitCount === totalNotes) {
        console.log('Ejercicio completado: ¡Todas las notas conseguidas!');
        setExerciseFinished(true);
        if (onExerciseComplete) onExerciseComplete(true);
      } else if (remainingTargets.length > 0) {
        // Verificar si alguna de las notas restantes es alcanzable
        const canReachRemainingTargets = remainingTargets.some(target => {
          const targetX = target.x - offset;
          // Una nota es alcanzable si está visible en la pantalla o está por venir
          return targetX > -100; // Dar un margen más amplio para notas que apenas salieron
        });

        if (!canReachRemainingTargets) {
          console.log(`Ejercicio incompleto: ${notesHitCount}/${totalNotes} notas conseguidas`);
          // Retroceder un poco más para dar más oportunidad de conseguir las notas
          scrollOffset.current = offset - 50;
        }
      }
    }

    // Mostrar información del ejercicio
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText(`${exercise?.name || 'Ejercicio'}`, 20, 35);
    
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText(`${exercise?.type || 'Seguimiento'}`, 20, 55);
    
    // Mostrar progreso de notas y camino
    const notesProgress = (completedTargets.size / totalNotes) * 100;
    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(`Notas: ${completedTargets.size}/${totalNotes} (${Math.round(notesProgress)}%)`, 20, 75);
    ctx.fillText(`Progreso: ${Math.max(0, Math.min(100, Math.round(progress)))}%`, 20, 90);
    
    // Mostrar mensaje si quedan notas por conseguir
    if (progress >= 95 && completedTargets.size < totalNotes) {
      ctx.fillStyle = '#ff4444';
      ctx.fillText('¡Aún quedan notas por conseguir!', 20, 105);
    }
    
    ctx.shadowBlur = 0;
  };

  // Añadir objetivos musicales en el camino
  const drawMusicalTargets = (ctx, path, offset) => {
    const targets = [];
    
    // Calcular la posición X donde comienza el ejercicio real
    const exerciseStartX = config.initialOffset + config.previewZoneWidth + config.preparationZoneWidth;
    
    if (exercise?.type === "Seguimiento Lineal") {
      // 8 objetivos para las 8 notas de la escala - distribuidos uniformemente
      const scaleNotes = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si', 'Do'];
      for (let i = 0; i < scaleNotes.length; i++) {
        targets.push({
          id: `scale_${i}`,
          x: exerciseStartX + (config.pathLength / scaleNotes.length) * i + (config.pathLength / scaleNotes.length) * 0.5,
          note: scaleNotes[i],
          color: '#FFD700',
          glowColor: 'rgba(255, 215, 0, 0.6)'
        });
      }
    } else if (exercise?.type === "Seguimiento Ondulado") {
      // 14 objetivos para Twinkle Twinkle - distribuidos uniformemente
      const twinkleNotes = ['C', 'C', 'G', 'G', 'A', 'A', 'G', 'F', 'F', 'E', 'E', 'D', 'D', 'C'];
      for (let i = 0; i < twinkleNotes.length; i++) {
        targets.push({
          id: `twinkle_${i}`,
          x: exerciseStartX + (config.pathLength / twinkleNotes.length) * i + (config.pathLength / twinkleNotes.length) * 0.5,
          note: twinkleNotes[i],
          color: '#FF6B9D',
          glowColor: 'rgba(255, 107, 157, 0.6)'
        });
      }
    } else {
      // 13 objetivos para Mary Had a Little Lamb - distribuidos uniformemente
      const maryNotes = ['E', 'D', 'C', 'D', 'E', 'E', 'E', 'D', 'D', 'D', 'E', 'E', 'E'];
      for (let i = 0; i < maryNotes.length; i++) {
        targets.push({
          id: `mary_${i}`,
          x: exerciseStartX + (config.pathLength / maryNotes.length) * i + (config.pathLength / maryNotes.length) * 0.5,
          note: maryNotes[i],
          color: '#6EF3C5',
          glowColor: 'rgba(110, 243, 197, 0.6)'
        });
      }
    }

    // Dibujar los objetivos con efectos mejorados
    targets.forEach((target, index) => {
      const adjustedX = target.x - offset;
      
      // Solo dibujar objetivos que están en pantalla
      if (adjustedX >= -50 && adjustedX <= config.width + 50) {
        // Encontrar la Y del camino en esta posición
        const pathPoint = path.find(p => Math.abs(p.x - target.x) < 20);
        if (pathPoint) {
          const time = Date.now() * 0.003;
          const isCompleted = completedTargets.has(target.id);
          
          // Si está completado, mostrar efecto diferente
          if (isCompleted) {
            // Objetivo completado - efecto de "check" verde
            const pulse = Math.sin(time + index * 0.5) * 0.1 + 0.9;
            
            // Círculo de fondo completado
            ctx.beginPath();
            ctx.arc(adjustedX, pathPoint.y, 12 * pulse, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(46, 204, 113, 0.8)';
            ctx.fill();
            
            // Borde completado
            ctx.beginPath();
            ctx.arc(adjustedX, pathPoint.y, 12, 0, Math.PI * 2);
            ctx.strokeStyle = '#2ECC71';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Símbolo de check
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(adjustedX - 4, pathPoint.y);
            ctx.lineTo(adjustedX - 1, pathPoint.y + 3);
            ctx.lineTo(adjustedX + 4, pathPoint.y - 3);
            ctx.stroke();
          } else {
            // Objetivo no completado
            const pulse = Math.sin(time + index * 0.5) * 0.2 + 1;
            
            // Círculo de fondo
            ctx.beginPath();
            ctx.arc(adjustedX, pathPoint.y, 15 * pulse, 0, Math.PI * 2);
            ctx.fillStyle = target.glowColor;
            ctx.fill();
            
            // Círculo principal
            ctx.beginPath();
            ctx.arc(adjustedX, pathPoint.y, 12, 0, Math.PI * 2);
            ctx.fillStyle = target.color;
            ctx.fill();
            
            // Texto de la nota
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(target.note, adjustedX, pathPoint.y);
          }
        }
      }
    });
    
    return targets;
  };

  const checkMusicalTargets = (targets, offset) => {
    const centerX = config.width / 2;
    const pointY = currentPointY.current;
    
    // Verificar si estamos en la zona de ejercicio real
    const currentX = offset + centerX;
    const exerciseStartX = config.initialOffset + config.previewZoneWidth + config.preparationZoneWidth;
    
    // Solo procesar objetivos si estamos después de la zona de preparación
    if (currentX >= exerciseStartX) {
      targets.forEach(target => {
        const targetScreenX = target.x - offset;
        
        // Solo procesar objetivos cerca de la línea central
        if (Math.abs(targetScreenX - centerX) < 10) {
          const pathY = getPathYAtX(target.x);
          
          if (pathY !== null && Math.abs(pointY - pathY) < config.pathWidth/2 && !completedTargets.has(target.id)) {
            const currentTime = Date.now();
            
            // Evitar tocar la misma nota muy rápido
            if (currentTime - lastNoteHit.current > 300) {
              lastNoteHit.current = currentTime;
              
              // Marcar objetivo como completado
              setCompletedTargets(prev => new Set([...prev, target.id]));
              
              // Reproducir sonido de la nota
              playMusicalNote(target.note);
              
              // Actualizar estadísticas
              setNotesHit(prev => {
                const newNotesHit = prev + 1;
                if (onNotesUpdate) {
                  onNotesUpdate(newNotesHit);
                }
                // Solo completar el ejercicio si se han alcanzado todas las notas
                if (newNotesHit >= totalNotes) {
                  setExerciseFinished(true);
                  if (onExerciseComplete) {
                    onExerciseComplete(true);
                  }
                }
                return newNotesHit;
              });
              
              setScore(prev => {
                const newScore = Math.min(100, prev + 10);
                if (onScoreUpdate) {
                  onScoreUpdate(newScore);
                }
                return newScore;
              });
              
              setCurrentNote(target.note);
              console.log('Objetivo alcanzado:', target.note, 'ID:', target.id);
            }
          }
        }
      });
    }
  };

  // Función auxiliar para obtener la Y del camino en una posición X específica
  const getPathYAtX = (targetX) => {
    const path = generateExercisePath();
    const pathPoint = path.find(p => Math.abs(p.x - targetX) < 10);
    return pathPoint ? pathPoint.y : null;
  };

  // Función para crear efecto visual de éxito
  const createSuccessEffect = (x, y) => {
    // Este efecto se puede expandir más tarde con partículas
    console.log('✨ Efecto de éxito en:', x, y);
  };

  // Función para reproducir notas musicales usando archivos MP3 reales
  const playMusicalNote = (note = 'A') => {
    try {
      // Mapear notas a archivos de audio disponibles
      const noteMapping = {
        'C': 'C', 'Do': 'C',
        'D': 'D', 'Re': 'D', 
        'E': 'E', 'Mi': 'E',
        'F': 'F', 'Fa': 'F',
        'G': 'G', 'Sol': 'G',
        'A': 'A', 'La': 'A',
        'B': 'B', 'Si': 'B'
      };
      
      const audioFile = noteMapping[note] || 'A';
      const audioPath = `/sounds/${audioFile}.mp3`;
      
      console.log('🎵 Reproduciendo nota:', note, '→', audioPath);
      
      // Crear un nuevo elemento de audio para cada nota
      const audio = new Audio(audioPath);
      audio.volume = 0.6; // Volumen moderado
      
      // Reproducir el audio
      audio.play().catch(error => {
        console.log('Error reproduciendo audio:', error);
        
        // Fallback a tono sintético si falla el archivo
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const frequencies = {
          'C': 261.63, 'Do': 261.63,
          'D': 293.66, 'Re': 293.66,
          'E': 329.63, 'Mi': 329.63,
          'F': 349.23, 'Fa': 349.23,
          'G': 392.00, 'Sol': 392.00,
          'A': 440.00, 'La': 440.00,
          'B': 493.88, 'Si': 493.88
        };
        
        const frequency = frequencies[note] || 440;
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
      });
      
    } catch (error) {
      console.log('Error general reproduciendo nota:', error);
    }
  };

  // Función para reproducir sonido de cuenta atrás
  const playCountdownSound = (type) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      if (type === 'number') {
        // Sonido para números 3, 2, 1
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      } else if (type === 'ya') {
        // Sonido especial para "¡YA!"
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1600, audioContext.currentTime + 0.2);
        oscillator.type = 'square';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      }
    } catch (error) {
      console.log('Countdown sound failed:', error);
    }
  };

  // Función para la cuenta atrás estilo videojuego
  const startCountdown = () => {
    console.log('Iniciando cuenta atrás...');
    setShowCountdown(true);
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        console.log('⏰ Countdown:', prev);
        if (prev === 1) {
          // Comenzar ejercicio inmediatamente después del 1
            console.log('🚀 Comenzando ejercicio...');
            setShowCountdown(false);
            setExerciseStarted(true);
            scrollOffset.current = 0;
            setScore(0);
            setNotesHit(0);
            setCurrentNote('');
          setCompletedTargets(new Set());
          clearInterval(countdownInterval);
        }
        return prev > 0 ? prev - 1 : prev;
      });
    }, 1000);
  };

  // Función para dibujar la cuenta atrás sobre el canvas
  const drawCountdown = (ctx) => {
    if (!showCountdown || countdown <= 0) return;
    
    console.log('🎨 Dibujando countdown:', countdown);
    
    const centerX = config.width / 2;
    const centerY = config.height / 2;
    const time = Date.now() * 0.008;
    const pulse = Math.sin(time) * 0.2 + 1;
    
    // Fondo semi-transparente
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, config.width, config.height);
    
    // Configurar texto
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
      // Números 3, 2, 1 con color verde
      const fontSize = 120 * pulse;
      ctx.font = `bold ${fontSize}px Inter, sans-serif`;
      
      // Sombra del texto
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 4;
      
    // Gradiente verde para el número
      const gradient = ctx.createLinearGradient(0, centerY - fontSize/2, 0, centerY + fontSize/2);
      gradient.addColorStop(0, '#6EF3C5');
      gradient.addColorStop(0.5, '#FFFFFF');
      gradient.addColorStop(1, '#6EF3C5');
      
      ctx.fillStyle = gradient;
      ctx.fillText(countdown.toString(), centerX, centerY);
      
      // Borde del texto
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.strokeText(countdown.toString(), centerX, centerY);
      
      // Resetear sombra
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
  };

  // Modificar la función animate para manejar mejor el movimiento
  const animate = (timestamp) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (!lastTime.current) {
      lastTime.current = timestamp;
    }
    
    const deltaTime = timestamp - lastTime.current;
    lastTime.current = timestamp;

    if (showCountdown) {
      ctx.clearRect(0, 0, config.width, config.height);
      drawCountdown(ctx);
    } else if (!exercise || !exerciseStarted || !isActive) {
      drawDefaultAnimation(ctx, timestamp * 0.1);
    } else {
      // Avanzar solo si el ejercicio está activo, no ha terminado y aún faltan notas
      if (isActive && !exerciseFinished) {
        const newOffset = scrollOffset.current + (config.scrollSpeed * deltaTime) / 16;
        scrollOffset.current = newOffset;

        // Si llegamos (o sobrepasamos) el final del camino, terminar el ejercicio
        if (scrollOffset.current >= config.totalLength) {
          scrollOffset.current = config.totalLength;
          setExerciseFinished(true);
          if (onExerciseComplete) onExerciseComplete(false);
        }
      }
      
      const path = generateExercisePath();
      drawExercisePath(ctx, path, scrollOffset.current);
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  // Modificar el useEffect de inicialización del canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = config.width;
      canvas.height = config.height;
      
      // Inicializar posición del punto
      currentPointY.current = config.height / 2;
      
      // Reiniciar lastTime para evitar saltos en la animación
      lastTime.current = null;
      
      // Iniciar animación
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [exercise, exerciseStarted, isActive, exerciseFinished]); // Añadir dependencias importantes

  // Cargar audio
  useEffect(() => {
    if (exercise?.song) {
      audioRef.current = new Audio(exercise.song);
      audioRef.current.addEventListener('canplaythrough', () => {
        setAudioLoaded(true);
      });
      audioRef.current.load();

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      };
    }
  }, [exercise]);

  const handleStartExercise = async () => {
    console.log('Iniciando ejercicio en TrackingExercise');

    if (onStart) {
      onStart();
    }

    if (startRosExercise) {
      await startRosExercise();
    }
    
      startCountdown();
  };

  // Función para reiniciar el ejercicio
  const handleRestart = async () => {
    // Detener el ejercicio actual en ROS
    await stopExercise();
    
    // Reiniciar estados locales
    scrollOffset.current = 0;
    setScore(0);
    setNotesHit(0);
    setCurrentNote('');
    setCompletedTargets(new Set());
    setExerciseStarted(false);
    setExerciseFinished(false);
  };

  // Actualizar isSimulationMode cuando cambie forceSimulation
  useEffect(() => {
    setIsSimulationMode(forceSimulation || !connected);
  }, [forceSimulation, connected]);

  return (
    <div className="tracking-exercise-content d-flex flex-column h-100">
      <div className="canvas-container-compact">
        <canvas ref={canvasRef} />
        
        {/* Overlay de cuenta atrás */}
        {showCountdown && countdown > 0 && (
          <div className="countdown-overlay">
            {countdown <= 3 && countdown > 0 && (
              <div className="countdown-number" key={countdown}>
                {countdown}
              </div>
            )}
          </div>
        )}

        {/* Overlay de finalización */}
        {exerciseFinished && (
          <div className="completion-overlay">
            <div className="completion-modal">
              <div className="completion-title">
                ¡Ejercicio Completado!
              </div>
              <div className="completion-message">
                Has completado {exercise?.name}
              </div>
              <div className="completion-stats">
                <div>Puntuación final: {Math.round(score)}%</div>
                <div>Notas acertadas: {notesHit} de {totalNotes}</div>
              </div>
              <button 
                className="restart-btn"
                onClick={handleRestart}
              >
                Reiniciar Ejercicio
              </button>
            </div>
          </div>
        )}
      </div>
      
      {exercise && !exerciseStarted && !showCountdown ? (
        <div className="exercise-controls d-flex align-items-center">
          <div className="w-100 d-flex flex-column align-items-center justify-content-center">
            <button 
              className="start-exercise-btn"
              onClick={handleStartExercise}
            >
              Comenzar Ejercicio
            </button>
          </div>
        </div>
      ) : !showCountdown ? (
        <div className="exercise-controls">
          <div className="exercise-info">
            <div>
              <h5 className="exercise-score">Puntuación: {Math.round(score)}%</h5>
              <div className="status-indicator">
                Estado: {isInPath ? 
                  <span className="text-success">¡Dentro del camino!</span> : 
                  <span className="text-danger">Fuera del camino</span>
                }
              </div>
            </div>
          </div>
          
          <div className="exercise-stats">
            <div className="stat-item">
              <div className="stat-value">{angle ? angle.toFixed(1) : 'N/A'}°</div>
              <div className="stat-label">Ángulo</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{Math.round(currentPointY.current)}</div>
              <div className="stat-label">Posición Y</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{notesHit}/{totalNotes}</div>
              <div className="stat-label">Notas</div>
            </div>
          </div>
          
          {/* Barra de progreso del ejercicio */}
          <div className="progress-section">
            <div className="progress-header">
              <span>Progreso del Ejercicio</span>
              <span>{exerciseFinished ? 100 : Math.min(Math.round((scrollOffset.current / config.totalLength) * 100), 100)}%</span>
            </div>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill"
                style={{ width: `${exerciseFinished ? 100 : Math.min((scrollOffset.current / config.totalLength) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="exercise-controls d-flex align-items-center">
          <div className="w-100 d-flex flex-column align-items-center justify-content-center">
            <div className="preparing-text">
              Preparándose para comenzar...
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .tracking-exercise-content {
          min-height: 500px;
          max-height: 700px;
          display: flex;
          flex-direction: column;
        }

        .canvas-container-compact {
          position: relative;
          flex: 1;
          min-height: 280px;
          max-height: 280px;
          width: 100%;
          overflow: hidden;
        }

        .exercise-controls {
          padding: 1rem;
          background: transparent;
          border-top: none;
          min-height: 220px;
          max-height: 220px;
          overflow-y: auto;
        }

        .completion-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .completion-modal {
          background: rgba(13, 17, 23, 0.95);
          border: 1px solid rgba(110, 243, 197, 0.3);
          border-radius: 8px;
          padding: 1.5rem;
          text-align: center;
          width: 300px;
          box-shadow: 0 0 20px rgba(110, 243, 197, 0.2);
        }

        .completion-title {
          font-size: 1.2rem;
          font-weight: bold;
          color: #6EF3C5;
          margin-bottom: 0.8rem;
        }

        .completion-message {
          font-size: 1rem;
          color: white;
          margin-bottom: 0.8rem;
        }

        .completion-stats {
          background: rgba(255, 255, 255, 0.1);
          padding: 0.8rem;
          border-radius: 6px;
          margin-bottom: 1.2rem;
          color: white;
          font-size: 0.9rem;
        }

        .restart-btn {
          background: linear-gradient(45deg, #6EF3C5, #4A90E2);
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 6px;
          color: white;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .restart-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(110, 243, 197, 0.3);
        }

        .start-exercise-btn {
          width: 60%;
          padding: 1rem 2rem;
          background: linear-gradient(45deg, #6EF3C5, #4A90E2);
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1.1rem;
          margin-top: 2rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 2px 8px rgba(110, 243, 197, 0.2);
        }

        .start-exercise-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(110, 243, 197, 0.4);
          background: linear-gradient(45deg, #7FFFD4, #5AA1E3);
        }

        .start-exercise-btn:active {
          transform: translateY(1px);
          box-shadow: 0 2px 6px rgba(110, 243, 197, 0.3);
        }

        .preparing-text {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.2rem;
          font-weight: 500;
          text-align: center;
          margin-top: 2rem;
          letter-spacing: 0.5px;
        }
      `}</style>
    </div>
  );
};

export default TrackingExercise; 