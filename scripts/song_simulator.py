#!/usr/bin/env python3

import rospy
from std_msgs.msg import Float64
import time
import json
import sys

class SongSimulator:
    def __init__(self):
        rospy.init_node('song_simulator', anonymous=True)
        self.angle_pub = rospy.Publisher('/angle_topic', Float64, queue_size=10)
        self.rate = rospy.Rate(10)  # 10Hz
        
        # Definición de canciones y sus secuencias de ángulos
        self.songs = {
            "twinkle": [
                {"angle": 30, "duration": 1.0},  # C
                {"angle": 30, "duration": 1.0},  # C
                {"angle": 90, "duration": 1.0},  # G
                {"angle": 90, "duration": 1.0},  # G
                {"angle": 110, "duration": 1.0}, # A
                {"angle": 110, "duration": 1.0}, # A
                {"angle": 90, "duration": 1.5},  # G
            ],
            "mary": [
                {"angle": 80, "duration": 1.0},  # E
                {"angle": 60, "duration": 1.0},  # D
                {"angle": 30, "duration": 1.0},  # C
                {"angle": 60, "duration": 1.0},  # D
                {"angle": 80, "duration": 1.0},  # E
                {"angle": 80, "duration": 1.0},  # E
                {"angle": 80, "duration": 1.5},  # E
            ]
        }

    def simulate_song(self, song_name):
        if song_name not in self.songs:
            rospy.logerr(f"Canción {song_name} no encontrada")
            return

        sequence = self.songs[song_name]
        rospy.loginfo(f"Iniciando simulación de {song_name}")

        for step in sequence:
            if rospy.is_shutdown():
                break

            angle = step["angle"]
            duration = step["duration"]
            
            # Publicar el ángulo
            msg = Float64()
            msg.data = float(angle)
            self.angle_pub.publish(msg)
            rospy.loginfo(f"Publicando ángulo: {angle}")
            
            # Esperar la duración especificada
            time.sleep(duration)

        rospy.loginfo(f"Simulación de {song_name} completada")

if __name__ == '__main__':
    try:
        simulator = SongSimulator()
        if len(sys.argv) > 1:
            song_name = sys.argv[1]
            simulator.simulate_song(song_name)
        else:
            rospy.logerr("Por favor especifica el nombre de la canción")
    except rospy.ROSInterruptException:
        pass 