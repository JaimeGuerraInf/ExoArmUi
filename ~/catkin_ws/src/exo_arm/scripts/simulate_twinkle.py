#!/usr/bin/env python3
import rospy
from std_msgs.msg import Float64
import time
import signal
import sys
from math import sin, pi

def signal_handler(sig, frame):
    rospy.loginfo("🛑 Deteniendo simulación...")
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

class ExerciseSimulator:
    def __init__(self):
        rospy.init_node('exercise_simulator', anonymous=True)
        self.pub = rospy.Publisher('/angle_topic', Float64, queue_size=10)
        self.rate = rospy.Rate(50)  # 50Hz para movimientos suaves
        
        # Secuencia de la canción
        self.sequence = [
            {"note": "C", "angle": 30, "duration": 1.0},
            {"note": "C", "angle": 30, "duration": 1.0},
            {"note": "G", "angle": 90, "duration": 1.0},
            {"note": "G", "angle": 90, "duration": 1.0},
            {"note": "A", "angle": 120, "duration": 1.0},
            {"note": "A", "angle": 120, "duration": 1.0},
            {"note": "G", "angle": 90, "duration": 1.5},
            {"note": "F", "angle": 75, "duration": 1.0},
            {"note": "F", "angle": 75, "duration": 1.0},
            {"note": "E", "angle": 60, "duration": 1.0},
            {"note": "E", "angle": 60, "duration": 1.0},
            {"note": "D", "angle": 45, "duration": 1.0},
            {"note": "D", "angle": 45, "duration": 1.0},
            {"note": "C", "angle": 30, "duration": 2.0}
        ]
        
        self.current_angle = 0

    def smooth_move(self, start_angle, target_angle, duration):
        """Realiza un movimiento suave entre dos ángulos usando interpolación sinusoidal."""
        steps = int(duration * 50)  # 50Hz
        for i in range(steps):
            if rospy.is_shutdown():
                return False
                
            # Interpolación sinusoidal para movimiento suave
            progress = (1 - cos(pi * i / steps)) / 2
            current = start_angle + (target_angle - start_angle) * progress
            
            msg = Float64()
            msg.data = current
            self.pub.publish(msg)
            self.rate.sleep()
            
        return True

    def run_exercise(self):
        try:
            rospy.loginfo("🎵 Iniciando simulación de Twinkle Twinkle Little Star")
            rospy.sleep(1)  # Pequeña pausa inicial

            # Mover a posición inicial
            msg = Float64()
            msg.data = self.sequence[0]["angle"]
            self.pub.publish(msg)
            rospy.sleep(1)

            # Ejecutar la secuencia
            for i, note in enumerate(self.sequence):
                if rospy.is_shutdown():
                    break

                rospy.loginfo(f"Nota {i+1}/{len(self.sequence)}: {note['note']} ({note['angle']}°)")
                
                # Mover al ángulo objetivo
                if not self.smooth_move(self.current_angle, note["angle"], 0.5):
                    break
                
                # Mantener la nota
                start_time = time.time()
                while time.time() - start_time < note["duration"]:
                    if rospy.is_shutdown():
                        return
                    msg = Float64()
                    msg.data = note["angle"]
                    self.pub.publish(msg)
                    self.rate.sleep()
                
                self.current_angle = note["angle"]
                rospy.loginfo(f"✓ Nota {note['note']} completada")

            # Ejercicio completado
            rospy.loginfo("✨ ¡Ejercicio completado correctamente!")
            
            # Volver a posición de reposo
            self.smooth_move(self.current_angle, 30, 1.0)
            rospy.sleep(1)

        except rospy.ROSInterruptException:
            rospy.loginfo("⚠️ Simulación interrumpida")
        except Exception as e:
            rospy.logerr(f"❌ Error: {str(e)}")
        finally:
            rospy.loginfo("🏁 Simulación finalizada")

if __name__ == '__main__':
    try:
        simulator = ExerciseSimulator()
        simulator.run_exercise()
    except KeyboardInterrupt:
        rospy.loginfo("🛑 Simulación detenida por el usuario") 