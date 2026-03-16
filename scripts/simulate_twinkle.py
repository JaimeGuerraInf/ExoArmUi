#!/usr/bin/env python3
import rospy
from std_msgs.msg import Float64
import time
import signal
import sys

def signal_handler(sig, frame):
    rospy.loginfo("🛑 Deteniendo la simulación...")
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

def move_to_angle(pub, rate, target_angle, current_note, speed=5):
    current_angle = current_note["angle"]
    step = speed if target_angle > current_angle else -speed

    while not rospy.is_shutdown() and abs(target_angle - current_angle) > abs(step):
        current_angle += step
        pub.publish(Float64(current_angle))
        rospy.loginfo(f"Moviendo a: {current_angle:.2f}°")
        rate.sleep()

    pub.publish(Float64(target_angle))
    rospy.loginfo(f"Llegó a la nota {target_angle}° ({current_note['note']})")
    return target_angle

def main():
    try:
        # Inicializa el nodo ROS y publisher
        rospy.init_node("angle_publisher", anonymous=True)
        pub = rospy.Publisher("/angle_topic", Float64, queue_size=10)
        rate = rospy.Rate(10)  # 10Hz

        # Secuencia de notas simuladas (Twinkle Twinkle Little Star)
        sequence = [
            {"note": "C", "angle": 30},
            {"note": "C", "angle": 30},
            {"note": "G", "angle": 90},
            {"note": "G", "angle": 90},
            {"note": "A", "angle": 120},
            {"note": "A", "angle": 120},
            {"note": "G", "angle": 90},
            {"note": "F", "angle": 75},
            {"note": "F", "angle": 75},
            {"note": "E", "angle": 60},
            {"note": "E", "angle": 60},
            {"note": "D", "angle": 45},
            {"note": "D", "angle": 45},
            {"note": "C", "angle": 30},
        ]

        # Comenzar simulación
        rospy.loginfo("🎵 Iniciando simulación de Twinkle Twinkle Little Star")
        rospy.sleep(1)  # Espera inicial

        current_note = sequence[0]
        pub.publish(Float64(current_note["angle"]))  # Publicar posición inicial

        # Ejecutar la secuencia una sola vez
        for i, note in enumerate(sequence):
            if rospy.is_shutdown():
                break
            
            rospy.loginfo(f"Ejecutando nota {i+1} de {len(sequence)}: {note['note']}")
            current_angle = move_to_angle(pub, rate, note["angle"], current_note)
            current_note = {"note": note["note"], "angle": current_angle}
            rospy.sleep(1)  # Espera entre notas

        rospy.loginfo("✅ Secuencia completada exitosamente")
        return True

    except rospy.ROSInterruptException:
        rospy.loginfo("⚠️ Nodo interrumpido")
        return False
    except Exception as e:
        rospy.logerr(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    success = main()
    rospy.loginfo("🛑 Simulación finalizada")
    sys.exit(0 if success else 1) 