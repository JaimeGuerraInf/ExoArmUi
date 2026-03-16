#!/usr/bin/env python3

import rospy
from std_msgs.msg import Float64
import time
from math import pi, cos, sin
import signal
import random

def signal_handler(sig, frame):
    rospy.loginfo("⚠️ Ctrl+C detectado. Finalizando simulación...")
    rospy.signal_shutdown("Ctrl+C")

signal.signal(signal.SIGINT, signal_handler)

class BadExerciseSimulator:
    def __init__(self):
        rospy.init_node('exercise_simulator', anonymous=True)
        self.pub = rospy.Publisher('/angle_topic', Float64, queue_size=10)
        self.rate = rospy.Rate(50)  # 50Hz para movimientos suaves
        
        # Secuencia con errores intencionales y movimientos incorrectos
        self.sequence = [
            # Primer intento fallido de C (pasa por encima)
            {"movement": "overshoot", "start": 0, "end": 40, "duration": 1.0},
            {"movement": "correction", "start": 40, "end": 30, "duration": 0.5},
            
            # Segundo C correcto
            {"movement": "direct", "start": 30, "end": 30, "duration": 1.0},
            
            # Intento de ir a G pero se queda corto
            {"movement": "undershoot", "start": 30, "end": 75, "duration": 1.0},
            {"movement": "correction", "start": 75, "end": 90, "duration": 0.5},
            
            # Segundo G con temblor
            {"movement": "tremor", "start": 90, "end": 90, "duration": 1.0},
            
            # Intento de A pero se pasa
            {"movement": "overshoot", "start": 90, "end": 120, "duration": 1.0},
            {"movement": "correction", "start": 120, "end": 110, "duration": 0.5},
            
            # Segundo A inestable
            {"movement": "tremor", "start": 110, "end": 110, "duration": 1.0},
            
            # G con movimiento errático
            {"movement": "erratic", "start": 110, "end": 90, "duration": 2.0},
            
            # Intento de F con varios ajustes
            {"movement": "adjustment", "start": 90, "end": 75, "duration": 1.5},
            
            # Segundo F impreciso
            {"movement": "tremor", "start": 75, "end": 75, "duration": 1.0},
            
            # E con movimiento lento
            {"movement": "slow", "start": 75, "end": 60, "duration": 1.5},
            
            # Segundo E inestable
            {"movement": "tremor", "start": 60, "end": 60, "duration": 1.0},
            
            # D con sobrepaso
            {"movement": "overshoot", "start": 60, "end": 50, "duration": 1.0},
            {"movement": "correction", "start": 50, "end": 45, "duration": 0.5},
            
            # Segundo D impreciso
            {"movement": "tremor", "start": 45, "end": 45, "duration": 1.0},
            
            # C final con varios intentos
            {"movement": "adjustment", "start": 45, "end": 30, "duration": 2.0}
        ]
        
        self.current_angle = 0
        self.tremor_amplitude = 3  # Amplitud del temblor

    def add_tremor(self, angle, amplitude=None):
        """Añade un temblor suave al movimiento."""
        if amplitude is None:
            amplitude = self.tremor_amplitude
        tremor = amplitude * sin(time.time() * 10)
        return angle + tremor

    def execute_movement(self, movement):
        """Ejecuta un tipo específico de movimiento con errores."""
        start_angle = movement["start"]
        end_angle = movement["end"]
        duration = movement["duration"]
        movement_type = movement["movement"]
        
        steps = int(duration * 50)
        
        for i in range(steps):
            if rospy.is_shutdown():
                return False
            
            progress = i / steps
            
            if movement_type == "direct":
                current = start_angle + (end_angle - start_angle) * progress
            elif movement_type == "overshoot":
                overshoot = 1.2  # 20% de sobrepaso
                current = start_angle + (end_angle - start_angle) * progress * overshoot
            elif movement_type == "undershoot":
                undershoot = 0.8  # 20% de quedarse corto
                current = start_angle + (end_angle - start_angle) * progress * undershoot
            elif movement_type == "tremor":
                current = end_angle + self.add_tremor(0, 5)  # Temblor más pronunciado
            elif movement_type == "erratic":
                # Movimiento errático con cambios aleatorios
                noise = random.uniform(-5, 5)
                current = start_angle + (end_angle - start_angle) * progress + noise
            elif movement_type == "adjustment":
                # Movimiento con ajustes pequeños
                if progress < 0.3:
                    current = start_angle + (end_angle - start_angle) * progress * 1.2
                elif progress < 0.6:
                    current = start_angle + (end_angle - start_angle) * progress * 0.8
                else:
                    current = start_angle + (end_angle - start_angle) * progress
            elif movement_type == "slow":
                # Movimiento más lento al principio
                current = start_angle + (end_angle - start_angle) * (progress ** 2)
            elif movement_type == "correction":
                # Corrección suave
                current = start_angle + (end_angle - start_angle) * (1 - cos(pi * progress) / 2)
            else:
                current = start_angle + (end_angle - start_angle) * progress
            
            # Añadir un pequeño temblor base a todos los movimientos
            current = self.add_tremor(current, 1)
            
            msg = Float64()
            msg.data = current
            self.pub.publish(msg)
            self.rate.sleep()
            
        return True

    def run_exercise(self):
        try:
            rospy.loginfo("🎵 Iniciando simulación de Twinkle Twinkle Little Star (Mala ejecución)")
            rospy.sleep(1)  # Pequeña pausa inicial

            # Ejecutar la secuencia con errores
            for i, movement in enumerate(self.sequence):
                if rospy.is_shutdown():
                    break

                rospy.loginfo(f"Movimiento {i+1}/{len(self.sequence)}: {movement['movement']} "
                            f"({movement['start']}° → {movement['end']}°)")
                
                if not self.execute_movement(movement):
                    break
                
                self.current_angle = movement["end"]
                rospy.loginfo(f"✓ Movimiento completado")
                
                # Pequeña pausa entre movimientos
                rospy.sleep(0.1)

            # Ejercicio completado
            rospy.loginfo("⚠️ Ejercicio completado con errores")
            
            # Volver a posición de reposo con error
            final_movement = {
                "movement": "tremor",
                "start": self.current_angle,
                "end": 35,
                "duration": 1.0
            }
            self.execute_movement(final_movement)
            rospy.sleep(1)

        except rospy.ROSInterruptException:
            rospy.loginfo("⚠️ Simulación interrumpida")
        except Exception as e:
            rospy.logerr(f"❌ Error: {str(e)}")
        finally:
            rospy.loginfo("🏁 Simulación finalizada")

if __name__ == '__main__':
    try:
        simulator = BadExerciseSimulator()
        simulator.run_exercise()
    except rospy.ROSInterruptException:
        pass 