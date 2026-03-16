import { useEffect, useState, useRef } from "react";
import ROSLIB from "roslib";
import { convertVisualToInputAngle } from "../utils/angleUtils";

// Usar localhost para la conexión WSL
const ROS_IP = 'localhost';
const ROS_PORT = '9090';

const useRosAngle = () => {
  const [angle, setAngle] = useState(null);
  const [connected, setConnected] = useState(false);
  const [exerciseActive, setExerciseActive] = useState(false);
  const [calibrated, setCalibrated] = useState(false);
  const rosRef = useRef(null);
  const topicRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Referencias para los publishers
  const exerciseControlPubRef = useRef(null);
  const calibrationPubRef = useRef(null);

  useEffect(() => {
    const connectToROS = () => {
      try {
        console.log(`🔌 Intentando conectar a ROS en ws://${ROS_IP}:${ROS_PORT}`);

    const ros = new ROSLIB.Ros({
          url: `ws://${ROS_IP}:${ROS_PORT}`,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 3000,
          connectTimeout: 5000
    });

    ros.on("connection", () => {
          console.log(`Conectado al servidor ROS en ${ROS_IP}:${ROS_PORT}`);
          setConnected(true);

          // Suscripción al tópico de ángulos
          const angleTopic = new ROSLIB.Topic({
            ros: ros,
            name: '/angle_topic',
            messageType: 'std_msgs/Float64'
          });

          // Suscripción al tópico de calibración
          const calibrationTopic = new ROSLIB.Topic({
            ros: ros,
            name: '/calibration_status',
            messageType: 'std_msgs/Bool'
          });

          // Publisher para control de ejercicios
          exerciseControlPubRef.current = new ROSLIB.Topic({
            ros: ros,
            name: '/exercise_control',
            messageType: 'std_msgs/String'
          });

          // Publisher para calibración
          calibrationPubRef.current = new ROSLIB.Topic({
            ros: ros,
            name: '/calibration_command',
            messageType: 'std_msgs/String'
          });

          // Manejador de mensajes de ángulo
          angleTopic.subscribe((message) => {
            console.log('Ángulo recibido:', message.data);
            const rawVal = message.data;
            let processed;
            if (rawVal >= 45 && rawVal <= 80) {
              // Valor real del brazo
              processed = rawVal;
            } else {
              // Valor proveniente de simulación (visual 45-180° o incluso <45)
              const clampedVisual = Math.max(45, Math.min(180, rawVal));
              processed = convertVisualToInputAngle(clampedVisual);
            }
            setAngle(processed);
      });

          // Manejador de mensajes de calibración
          calibrationTopic.subscribe((message) => {
            console.log('Estado de calibración:', message.data);
            setCalibrated(message.data);
          });

          topicRef.current = angleTopic;
    });

        ros.on("error", (error) => {
          console.error(`Error de conexión ROS (${ROS_IP}:${ROS_PORT}):`, error);
          setConnected(false);
          setAngle(null);
          setCalibrated(false);

          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          reconnectTimeoutRef.current = setTimeout(connectToROS, 3000);
        });

        ros.on("close", () => {
          console.log(`Conexión ROS cerrada (${ROS_IP}:${ROS_PORT})`);
          setConnected(false);
          setAngle(null);
          setCalibrated(false);

          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          reconnectTimeoutRef.current = setTimeout(connectToROS, 3000);
        });

    rosRef.current = ros;
      } catch (error) {
        console.error("Error al crear conexión ROS:", error);
        setConnected(false);
        setAngle(null);
        setCalibrated(false);
        
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(connectToROS, 3000);
      }
    };

    connectToROS();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (topicRef.current) {
        try {
          topicRef.current.unsubscribe();
        } catch (error) {
          console.error("Error al desuscribirse:", error);
        }
      }
      if (rosRef.current) {
        try {
          rosRef.current.close();
        } catch (error) {
          console.error("Error al cerrar conexión:", error);
        }
      }
    };
  }, []);

  // Función para iniciar un ejercicio
  const startExercise = (exerciseType) => {
    if (!connected || !calibrated) {
      console.error("No se puede iniciar el ejercicio: Sistema no conectado o no calibrado");
      return false;
    }

    try {
      exerciseControlPubRef.current.publish(new ROSLIB.Message({
        data: `start_${exerciseType}`
      }));
      setExerciseActive(true);
      console.log(`Iniciando ejercicio: ${exerciseType}`);
      return true;
    } catch (error) {
      console.error("Error al iniciar ejercicio:", error);
      return false;
    }
  };

  // Función para detener un ejercicio
  const stopExercise = () => {
    if (!connected) return false;

    try {
      exerciseControlPubRef.current.publish(new ROSLIB.Message({
        data: 'stop'
      }));
      setExerciseActive(false);
      console.log('Ejercicio detenido');
      return true;
    } catch (error) {
      console.error("Error al detener ejercicio:", error);
      return false;
    }
  };

  // Función para calibrar el sistema
  const calibrateSystem = () => {
    if (!connected) return false;

    try {
      calibrationPubRef.current.publish(new ROSLIB.Message({
        data: 'calibrate'
      }));
      console.log('Iniciando calibración');
      return true;
    } catch (error) {
      console.error("Error al calibrar:", error);
      return false;
    }
  };

  // Función para ajustar límites
  const adjustLimits = () => {
    if (!connected) return false;

    try {
      calibrationPubRef.current.publish(new ROSLIB.Message({
        data: 'adjust_limits'
      }));
      console.log('Ajustando límites');
      return true;
    } catch (error) {
      console.error("Error al ajustar límites:", error);
      return false;
    }
  };

  return {
    angle,
    connected,
    calibrated,
    exerciseActive,
    startExercise,
    stopExercise,
    calibrateSystem,
    adjustLimits
  };
};

export default useRosAngle;

