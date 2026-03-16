#!/usr/bin/env python3

import rospy
from std_msgs.msg import Float64
import time
from math import pi, cos
import signal

def signal_handler(sig, frame):
    rospy.loginfo("⚠️ Ctrl+C detectado. Finalizando simulación...")
    rospy.signal_shutdown("Ctrl+C")

signal.signal(signal.SIGINT, signal_handler)

class ExerciseSimulator:
    def __init__(self):
        rospy.init_node('exercise_simulator', anonymous=True)
        self.pub = rospy.Publisher('/angle_topic', Float64, queue_size=10)
        self.rate = rospy.Rate(50)  # 50Hz para movimientos suaves
        
        # Secuencia de Mary Had a Little Lamb
        self.sequence = [
            {"note": "E", "angle": 80, "duration": 1.0},  # Ma-
            {"note": "D", "angle": 60, "duration": 1.0},  # -ry
            {"note": "C", "angle": 30, "duration": 1.0},  # had
            {"note": "D", "angle": 60, "duration": 1.0},  # a
            {"note": "E", "angle": 80, "duration": 1.0},  # lit-
            {"note": "E", "angle": 80, "duration": 1.0},  # -tle
            {"note": "E", "angle": 80, "duration": 2.0},  # lamb
            {"note": "D", "angle": 60, "duration": 1.0},  # lit-
            {"note": "D", "angle": 60, "duration": 1.0},  # -tle
            {"note": "D", "angle": 60, "duration": 2.0},  # lamb
            {"note": "E", "angle": 80, "duration": 1.0},  # lit-
            {"note": "E", "angle": 80, "duration": 1.0},  # -tle
            {"note": "E", "angle": 80, "duration": 2.0}   # lamb
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
            rospy.loginfo("🎵 Iniciando simulación de Mary Had a Little Lamb")
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
                
                # Mantener la nota durante su duración
                hold_time = note["duration"]
                start_time = time.time()
                while time.time() - start_time < hold_time:
                    if rospy.is_shutdown():
                        return
                    msg = Float64()
                    msg.data = note["angle"]
                    self.pub.publish(msg)
                    self.rate.sleep()
                
                self.current_angle = note["angle"]
                rospy.loginfo(f"✓ Nota {note['note']} completada")
                
                # Pequeña pausa entre notas para mejor sincronización
                rospy.sleep(0.1)

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
    except rospy.ROSInterruptException:
        pass 