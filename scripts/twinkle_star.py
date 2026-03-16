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

    def move_to_angle(target_angle, speed=5):
        global current_angle
        step = speed if target_angle > current_angle else -speed

        while not rospy.is_shutdown() and abs(target_angle - current_angle) > abs(step):
            current_angle += step
            pub.publish(Float64(current_angle))
            rospy.loginfo(f"Moviendo a: {current_angle:.2f}°")
            rate.sleep()

        current_angle = target_angle
        pub.publish(Float64(current_angle))
        rospy.loginfo(f"Llegó a la nota {target_angle}° ({note['note']})")

    # Comenzar simulación
    current_angle = sequence[0]["angle"]
    pub.publish(Float64(current_angle))
    rospy.sleep(1)

    rospy.loginfo("🎵 Iniciando simulación de Twinkle Twinkle Little Star")

    while not rospy.is_shutdown():
        for note in sequence:
            if rospy.is_shutdown():
                break
            move_to_angle(note["angle"])
            rospy.sleep(1)
        
        rospy.loginfo("✅ Secuencia completada. Reiniciando...")
        rospy.sleep(2)  # Espera 2 segundos antes de reiniciar

except rospy.ROSInterruptException:
    rospy.loginfo("⚠️ Nodo interrumpido")
except Exception as e:
    rospy.logerr(f"❌ Error: {str(e)}")
finally:
    rospy.loginfo("🛑 Simulación finalizada") 